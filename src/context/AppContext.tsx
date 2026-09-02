import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, FarmerProfile, ProviderProfile, UserRole, LanguageCode, NotificationItem } from '../types';
import { api } from '../services/api';
import { getTranslation } from '../i18n/translations';
import { swService } from '../services/swService';

export interface LocationPreset {
  name: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
}

export const LOCATION_PRESETS: LocationPreset[] = [
  { name: 'Pollachi / Coimbatore, TN', district: 'Coimbatore', state: 'Tamil Nadu', latitude: 10.6586, longitude: 77.0089 },
  { name: 'Madurai Central, TN', district: 'Madurai', state: 'Tamil Nadu', latitude: 9.9252, longitude: 78.1198 },
  { name: 'Thanjavur Delta, TN', district: 'Thanjavur', state: 'Tamil Nadu', latitude: 10.7870, longitude: 79.1378 },
  { name: 'Salem Commodity Belt, TN', district: 'Salem', state: 'Tamil Nadu', latitude: 11.6643, longitude: 78.1460 },
  { name: 'Baramati / Pune, MH', district: 'Pune', state: 'Maharashtra', latitude: 18.1517, longitude: 74.5772 },
  { name: 'Ludhiana Agro Hub, PB', district: 'Ludhiana', state: 'Punjab', latitude: 30.9010, longitude: 75.8573 },
];

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: User | null;
  farmerProfile: FarmerProfile | null;
  providerProfile: ProviderProfile | null;
  currentLocation: LocationPreset;
  setCurrentLocation: (loc: LocationPreset) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
  activePublicTab: string;
  setActivePublicTab: (tab: string) => void;
  activeFarmerTab: string;
  setActiveFarmerTab: (tab: string) => void;
  activeProviderTab: string;
  setActiveProviderTab: (tab: string) => void;
  activeAdminTab: string;
  setActiveAdminTab: (tab: string) => void;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  refreshNotifications: () => void;
  useGpsLocation: () => Promise<void>;
  gpsLoading: boolean;
  gpsError: string | null;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  // Offline & Service Worker Support
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  lastSyncTime: string | null;
  syncOfflineData: () => Promise<void>;
  isSyncingOffline: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('public');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile | null>(null);
  const [providerProfile, setProviderProfile] = useState<ProviderProfile | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationPreset>(LOCATION_PRESETS[0]);
  
  // Offline and Service Worker State
  const [isOffline, setIsOffline] = useState<boolean>(!swService.isOnline());
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    return localStorage.getItem('agrisarthi_last_sync') || new Date().toISOString();
  });
  const [isSyncingOffline, setIsSyncingOffline] = useState(false);

  useEffect(() => {
    const cleanup = swService.onNetworkChange((online) => {
      setIsOffline(!online);
      if (online) {
        showToast('Internet connection restored. Synchronizing live agricultural records...');
        syncOfflineData();
      } else {
        showToast('Internet connection lost. Running in Offline Mode with cached records.');
      }
    });
    return cleanup;
  }, []);

  const syncOfflineData = async () => {
    setIsSyncingOffline(true);
    try {
      const ok = await swService.precacheCriticalFarmerData(currentUser?.id || 'usr_farmer_1');
      if (ok) {
        const now = new Date().toISOString();
        setLastSyncTime(now);
        localStorage.setItem('agrisarthi_last_sync', now);
        showToast('Critical soil reports, mandi prices, and farm data cached for offline use.');
      }
    } catch (e) {
      console.warn('Sync offline data error:', e);
    } finally {
      setIsSyncingOffline(false);
    }
  };

  
  // Persisted language state
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('agrisarthi_language') as LanguageCode;
      if (saved && ['en', 'hi', 'ta', 'te', 'mr', 'kn', 'ml', 'pa', 'gu', 'bn'].includes(saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('agrisarthi_language', lang);
    } catch {
      // ignore
    }
  };

  const t = useCallback(
    (key: string): string => {
      return getTranslation(key, language);
    },
    [language]
  );

  // Navigation tab states
  const [activePublicTab, setActivePublicTab] = useState<string>('home');
  const [activeFarmerTab, setActiveFarmerTab] = useState<string>('plant-scanner');
  const [activeProviderTab, setActiveProviderTab] = useState<string>('warehouses');
  const [activeAdminTab, setActiveAdminTab] = useState<string>('overview');

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const loadUserData = async (activeRole: UserRole) => {
    try {
      const data = await api.getCurrentUser(activeRole === 'public' ? 'farmer' : activeRole);
      setCurrentUser(data.user);
      setFarmerProfile(data.farmerProfile);
      setProviderProfile(data.providerProfile);
      if (data.user?.id) {
        const notifs = await api.getNotifications(data.user.id);
        setNotifications(notifs);
      }
    } catch (err) {
      console.error('Error loading initial user data:', err);
    }
  };

  useEffect(() => {
    loadUserData(role);
  }, [role]);

  const refreshNotifications = async () => {
    if (currentUser?.id) {
      const notifs = await api.getNotifications(currentUser.id);
      setNotifications(notifs);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const useGpsLocation = async () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLoading(false);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCurrentLocation({
          name: `GPS Live Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          district: 'Current GPS Location',
          state: 'GPS Detected',
          latitude: lat,
          longitude: lng,
        });
        showToast('Live GPS location synchronized successfully.');
      },
      (err) => {
        setGpsLoading(false);
        console.warn('GPS location error:', err);
        setGpsError('GPS permission was not granted or timed out. Please select your district manually.');
      },
      { timeout: 8000 }
    );
  };

  const unreadNotificationCount = notifications.filter((n) => !n.is_read).length;

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        currentUser,
        farmerProfile,
        providerProfile,
        currentLocation,
        setCurrentLocation,
        language,
        setLanguage,
        t,
        activePublicTab,
        setActivePublicTab,
        activeFarmerTab,
        setActiveFarmerTab,
        activeProviderTab,
        setActiveProviderTab,
        activeAdminTab,
        setActiveAdminTab,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        refreshNotifications,
        useGpsLocation,
        gpsLoading,
        gpsError,
        toastMessage,
        showToast,
        isOffline,
        setIsOffline,
        lastSyncTime,
        syncOfflineData,
        isSyncingOffline,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
