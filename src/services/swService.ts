// Service Worker & Offline Data Manager for AgriSaarthi AI

export interface OfflineCacheMeta {
  lastUpdated: string;
  isOffline: boolean;
  serviceWorkerRegistered: boolean;
  cachedKeys: string[];
}

const LOCAL_STORAGE_CACHE_PREFIX = 'agrisarthi_offline_';

export const swService = {
  // Register the service worker
  register(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('[OfflineManager] Service workers not supported in this environment');
      return Promise.resolve(null);
    }

    return navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[AgriSaarthi SW] Service Worker registered with scope:', registration.scope);

        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[AgriSaarthi SW] New content is available; please refresh.');
              }
            };
          }
        };

        return registration;
      })
      .catch((err) => {
        console.warn('[AgriSaarthi SW] Service Worker registration failed:', err);
        return null;
      });
  },

  // Check if browser is currently online
  isOnline(): boolean {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine !== false;
  },

  // Listen to network connectivity changes
  onNetworkChange(callback: (online: boolean) => void): () => void {
    if (typeof window === 'undefined') return () => {};

    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  },

  // Save critical data copy to localStorage as persistent secondary offline guarantee
  saveOfflineBackup<T>(key: string, data: T): void {
    try {
      const payload = {
        data,
        cachedAt: new Date().toISOString(),
      };
      localStorage.setItem(`${LOCAL_STORAGE_CACHE_PREFIX}${key}`, JSON.stringify(payload));
    } catch (e) {
      console.warn('[OfflineManager] Failed to write localStorage backup for:', key, e);
    }
  },

  // Retrieve critical data copy from localStorage if network fails
  getOfflineBackup<T>(key: string): { data: T; cachedAt: string } | null {
    try {
      const item = localStorage.getItem(`${LOCAL_STORAGE_CACHE_PREFIX}${key}`);
      if (item) {
        return JSON.parse(item);
      }
    } catch (e) {
      console.warn('[OfflineManager] Failed to read localStorage backup for:', key, e);
    }
    return null;
  },

  // Query Cache Storage API for cached resources
  async getCacheStatus(): Promise<{ count: number; urls: string[]; lastSync: string }> {
    try {
      if ('caches' in window) {
        const cache = await caches.open('agrisarthi-data-v1');
        const keys = await cache.keys();
        return {
          count: keys.length,
          urls: keys.map((k) => k.url),
          lastSync: new Date().toISOString(),
        };
      }
    } catch (e) {
      console.warn('[OfflineManager] Failed to inspect caches:', e);
    }
    return { count: 0, urls: [], lastSync: new Date().toISOString() };
  },

  // Force pre-cache critical API endpoints immediately
  async precacheCriticalFarmerData(farmerId: string = 'usr_farmer_1'): Promise<boolean> {
    const endpoints = [
      `/api/soil-tests?farmerId=${farmerId}`,
      '/api/soil-labs',
      '/api/markets/prices',
      '/api/buyers',
      '/api/crop-listings',
      '/api/schemes',
      `/api/farms?farmerId=${farmerId}`,
    ];

    try {
      const fetchPromises = endpoints.map((url) =>
        fetch(url)
          .then((res) => {
            if (res.ok) {
              return res.json().then((json) => {
                // save in localStorage backup too
                const cleanKey = url.replace('/api/', '').split('?')[0];
                swService.saveOfflineBackup(cleanKey, json);
              });
            }
          })
          .catch((err) => console.warn('[OfflinePrecache] error on endpoint:', url, err))
      );

      await Promise.all(fetchPromises);
      return true;
    } catch (err) {
      console.warn('[OfflinePrecache] Error during bulk pre-cache:', err);
      return false;
    }
  },
};
