// AgriSaarthi AI — Offline-First Service Worker
// Provides intelligent caching for critical farmer dashboard data:
// Soil Health Reports, Market Prices, Labs, Schemes, and App Shell.

const CACHE_NAME = 'agrisarthi-cache-v1';
const DATA_CACHE_NAME = 'agrisarthi-data-v1';

// Static App Shell assets to pre-cache
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700&display=swap',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
];

// Critical API endpoints to cache for offline agricultural access
const CRITICAL_API_PATTERNS = [
  '/api/soil-tests',
  '/api/soil-labs',
  '/api/markets/prices',
  '/api/buyers',
  '/api/crop-listings',
  '/api/crop-rotations',
  '/api/schemes',
  '/api/farms',
  '/api/fields',
  '/api/users/current',
  '/api/admin/system-health',
];

// Install event - precache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[AgriSaarthi SW] Pre-caching offline application shell');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[AgriSaarthi SW] Pre-cache partial warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log('[AgriSaarthi SW] Removing outdated cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - handle dynamic requests with Network-First and Stale-While-Revalidate for APIs
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Critical API Data Requests: Network-first with Cache Fallback
  const isCriticalApi = CRITICAL_API_PATTERNS.some((pattern) => url.pathname.startsWith(pattern));

  if (isCriticalApi && event.request.method === 'GET') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(DATA_CACHE_NAME).then((cache) => {
              // Store with timestamp header simulation
              const headers = new Headers(responseToCache.headers);
              headers.append('x-agrisarthi-cached-at', new Date().toISOString());
              
              responseToCache.blob().then((blob) => {
                const customResponse = new Response(blob, {
                  status: responseToCache.status,
                  statusText: responseToCache.statusText,
                  headers: headers,
                });
                cache.put(event.request, customResponse);
              });
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          console.log('[AgriSaarthi SW] Network failed. Serving cached data for:', url.pathname);
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return an offline fallback JSON structure if completely uncached
          return new Response(
            JSON.stringify({
              offline: true,
              message: 'Offline mode: Live server unreachable and no cached record exists.',
              data: [],
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json', 'x-agrisarthi-offline': 'true' },
            }
          );
        })
    );
    return;
  }

  // 2. Non-API or Static Asset requests: Stale-While-Revalidate / Cache First
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Fetch update in background if online
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, networkResponse);
                });
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        return fetch(event.request)
          .then((networkResponse) => {
            if (
              networkResponse.status === 200 &&
              event.request.url.startsWith('http') &&
              !event.request.url.includes('/api/')
            ) {
              const resClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, resClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // For navigation requests, fallback to root index.html
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html') || caches.match('/');
            }
          });
      })
    );
  }
});

// Message listener for manual client sync or status checks
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CHECK_CACHE_STATUS') {
    caches.open(DATA_CACHE_NAME).then((cache) => {
      cache.keys().then((keys) => {
        event.ports[0].postMessage({
          type: 'CACHE_STATUS_RESULT',
          cachedUrls: keys.map((k) => k.url),
          count: keys.length,
          timestamp: new Date().toISOString(),
        });
      });
    });
  }
  if (event.data && event.data.type === 'CLEAR_DATA_CACHE') {
    caches.delete(DATA_CACHE_NAME).then(() => {
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ type: 'DATA_CACHE_CLEARED' });
      }
    });
  }
});
