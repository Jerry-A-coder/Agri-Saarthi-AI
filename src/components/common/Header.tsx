import React, { useState } from 'react';
import { useApp, LOCATION_PRESETS } from '../../context/AppContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  Sprout,
  User,
  Shield,
  Warehouse,
  Bell,
  MapPin,
  Compass,
  Sparkles,
  ChevronDown,
  Check,
  Building2,
  X,
  Download,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    role,
    setRole,
    currentLocation,
    setCurrentLocation,
    t,
    activePublicTab,
    setActivePublicTab,
    unreadNotificationCount,
    notifications,
    markNotificationAsRead,
    useGpsLocation,
    gpsLoading,
  } = useApp();

  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const publicNavItems = [
    { id: 'home', labelKey: 'nav.home', defaultLabel: 'Home' },
    { id: 'about', labelKey: 'nav.about', defaultLabel: 'About' },
    { id: 'how-it-works', labelKey: 'nav.howItWorks', defaultLabel: 'How It Works' },
    { id: 'features', labelKey: 'nav.features', defaultLabel: 'Features' },
    { id: 'contact', labelKey: 'nav.contact', defaultLabel: 'Contact & KVK' },
  ];

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Public Navigation */}
          <div className="flex items-center space-x-3">
            <button
              id="brand-logo-btn"
              onClick={() => {
                setRole('public');
                setActivePublicTab('home');
              }}
              className="flex items-center space-x-2.5 text-left focus:outline-hidden group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-lg text-stone-900 tracking-tight">
                    {t('app.title')}
                  </span>
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {t('app.badge')}
                  </span>
                </div>
                <p className="text-[10px] text-stone-500 hidden sm:block">
                  {t('app.tagline')}
                </p>
              </div>
            </button>

            {/* Public Navigation */}
            {role === 'public' && (
              <nav className="hidden md:flex items-center space-x-1 ml-6 border-l border-stone-200 pl-4">
                {publicNavItems.map((item) => (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    onClick={() => setActivePublicTab(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activePublicTab === item.id
                        ? 'bg-emerald-50 text-emerald-800 font-semibold'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                    }`}
                  >
                    {t(item.labelKey)}
                  </button>
                ))}
              </nav>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5">
            {/* Location Selector (GPS + District) */}
            <div className="relative">
              <button
                id="location-picker-btn"
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-700 text-xs font-medium transition-colors border border-stone-200"
                title="Current Agricultural Hub / District"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="max-w-[110px] sm:max-w-[160px] truncate">{currentLocation.district}</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {showLocationDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 border-b border-stone-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      {t('location.select')}
                    </span>
                    <button
                      onClick={useGpsLocation}
                      disabled={gpsLoading}
                      className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 bg-emerald-50 px-2 py-0.5 rounded-md"
                    >
                      <Compass className={`w-3 h-3 ${gpsLoading ? 'animate-spin' : ''}`} />
                      <span>{gpsLoading ? t('location.detecting') : t('location.useGps')}</span>
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {LOCATION_PRESETS.map((loc) => (
                      <button
                        key={loc.district}
                        onClick={() => {
                          setCurrentLocation(loc);
                          setShowLocationDropdown(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-stone-50 transition-colors ${
                          currentLocation.district === loc.district ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-stone-700'
                        }`}
                      >
                        <div>
                          <p className="font-medium">{loc.name}</p>
                          <p className="text-[10px] text-stone-400">{loc.state}</p>
                        </div>
                        {currentLocation.district === loc.district && <Check className="w-4 h-4 text-emerald-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Language Switcher Component */}
            <LanguageSwitcher />

            {/* Notification Bell */}
            <div className="relative">
              <button
                id="notifications-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-600 transition-colors border border-stone-200"
                title={t('notif.title')}
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-stone-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                      {t('notif.title')} ({notifications.length})
                    </span>
                    <button onClick={() => setShowNotifications(false)} className="text-stone-400 hover:text-stone-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-stone-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-stone-500">
                        {t('notif.empty')}
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationAsRead(n.id)}
                          className={`p-3 text-left hover:bg-stone-50 cursor-pointer transition-colors ${
                            !n.is_read ? 'bg-emerald-50/60' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <h4 className="text-xs font-bold text-stone-900">{n.title}</h4>
                            <span className="text-[10px] text-stone-400">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-stone-600 mt-0.5">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Direct ZIP Codebase Download Button */}
            <a
              id="download-codebase-zip-btn"
              href="/agrisaarthi-ai-full-codebase.zip"
              download="agrisaarthi-ai-full-codebase.zip"
              className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-stone-700 text-xs font-semibold transition-all border border-stone-200"
              title="Download Full Source Code ZIP"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Full Code ZIP</span>
            </a>

            {/* Portal Role Switcher Button */}
            <div className="relative">
              <button
                id="role-switcher-btn"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all border ${
                  role === 'farmer'
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-800'
                    : role === 'provider'
                    ? 'bg-amber-700 hover:bg-amber-800 text-white border-amber-800'
                    : role === 'admin'
                    ? 'bg-indigo-700 hover:bg-indigo-800 text-white border-indigo-800'
                    : 'bg-stone-900 hover:bg-black text-white border-stone-900'
                }`}
              >
                {role === 'farmer' && <User className="w-3.5 h-3.5" />}
                {role === 'provider' && <Warehouse className="w-3.5 h-3.5" />}
                {role === 'admin' && <Shield className="w-3.5 h-3.5" />}
                {role === 'public' && <Sparkles className="w-3.5 h-3.5" />}
                <span className="font-bold">
                  {role === 'public'
                    ? t('role.login')
                    : role === 'farmer'
                    ? t('role.farmer')
                    : role === 'provider'
                    ? t('role.provider')
                    : t('role.admin')}
                </span>
                <ChevronDown className="w-3 h-3 text-white/70" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 border-b border-stone-100 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                    {t('role.switch')}
                  </div>

                  <button
                    onClick={() => {
                      setRole('farmer');
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full px-3 py-2.5 text-left text-xs flex items-center space-x-3 hover:bg-emerald-50 transition-colors ${
                      role === 'farmer' ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-stone-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-stone-900">{t('role.farmer')}</p>
                      <p className="text-[10px] text-stone-500 leading-tight mt-0.5">{t('role.farmerDesc')}</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setRole('provider');
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full px-3 py-2.5 text-left text-xs flex items-center space-x-3 hover:bg-amber-50 transition-colors ${
                      role === 'provider' ? 'bg-amber-50 text-amber-900 font-bold' : 'text-stone-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <Warehouse className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-stone-900">{t('role.provider')}</p>
                      <p className="text-[10px] text-stone-500 leading-tight mt-0.5">{t('role.providerDesc')}</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setRole('admin');
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full px-3 py-2.5 text-left text-xs flex items-center space-x-3 hover:bg-indigo-50 transition-colors ${
                      role === 'admin' ? 'bg-indigo-50 text-indigo-900 font-bold' : 'text-stone-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-stone-900">{t('role.admin')}</p>
                      <p className="text-[10px] text-stone-500 leading-tight mt-0.5">{t('role.adminDesc')}</p>
                    </div>
                  </button>

                  <div className="border-t border-stone-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setRole('public');
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center space-x-3 hover:bg-stone-50 ${
                        role === 'public' ? 'font-bold text-stone-900' : 'text-stone-600'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-stone-400" />
                      <span>{t('role.public')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
