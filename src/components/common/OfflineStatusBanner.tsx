import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  WifiOff,
  Wifi,
  RefreshCw,
  CheckCircle2,
  Database,
  HardDriveDownload,
  Info,
  ShieldCheck,
} from 'lucide-react';

export const OfflineStatusBanner: React.FC = () => {
  const {
    isOffline,
    setIsOffline,
    lastSyncTime,
    syncOfflineData,
    isSyncingOffline,
    t,
  } = useApp();

  const [showDetails, setShowDetails] = useState(false);

  const formattedTime = lastSyncTime
    ? new Date(lastSyncTime).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : 'Just now';

  const formattedDate = lastSyncTime
    ? new Date(lastSyncTime).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      })
    : 'Today';

  return (
    <div id="offline-status-bar" className="w-full">
      {isOffline ? (
        /* Prominent Offline Mode Active Notification */
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5">
            <div className="p-1 rounded-lg bg-amber-900/60 text-amber-200 animate-pulse">
              <WifiOff className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold tracking-wide uppercase text-[11px] bg-amber-950/70 px-2 py-0.5 rounded-md mr-2 border border-amber-500/40">
                Offline Mode Active
              </span>
              <span className="font-medium text-amber-100">
                Service Worker active: Viewing last-loaded <strong>Soil Health Cards</strong> &amp; <strong>Mandi Market Prices</strong>.
              </span>
              <span className="hidden sm:inline text-amber-200/80 ml-2">
                (Cached: {formattedDate}, {formattedTime})
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsOffline(false)}
              className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur transition-colors border border-white/30"
              title="Switch back to Live Online mode"
            >
              <span className="flex items-center space-x-1">
                <Wifi className="w-3.5 h-3.5" />
                <span>Go Online</span>
              </span>
            </button>
          </div>
        </div>
      ) : (
        /* Online State with Subtle Offline Ready Cache Badge */
        <div className="bg-stone-100/90 border-b border-stone-200/80 px-4 py-1 text-[11px] text-stone-600 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span className="font-semibold text-stone-700">Online &amp; Synced</span>
            <span className="text-stone-400">•</span>
            <span className="text-stone-500 hidden sm:inline">
              Critical farmer data cached for offline field access ({formattedTime})
            </span>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={syncOfflineData}
              disabled={isSyncingOffline}
              className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center space-x-1 hover:underline transition-all"
              title="Update cached Soil Reports and Mandi Price copies"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncingOffline ? 'animate-spin' : ''}`} />
              <span>{isSyncingOffline ? 'Caching Data...' : 'Sync Offline Cache'}</span>
            </button>

            <span className="text-stone-300">|</span>

            {/* Quick Offline Simulator for Testing Field Conditions */}
            <button
              onClick={() => setIsOffline(true)}
              className="text-stone-500 hover:text-amber-700 font-medium flex items-center space-x-1 transition-colors text-[10px] bg-stone-200/70 hover:bg-amber-100 px-2 py-0.5 rounded-md"
              title="Simulate zero-connectivity field conditions to test offline access"
            >
              <WifiOff className="w-2.5 h-2.5" />
              <span>Test Offline Mode</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
