import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  MarketPrice,
  PriceAlertRule,
  TriggeredPriceAlert,
  PriceAlertCondition,
  BuyerListing,
} from '../../types';
import {
  Bell,
  BellRing,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Sparkles,
  Plus,
  RefreshCw,
  CheckCircle2,
  Trash2,
  Pause,
  Play,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  DollarSign,
  Smartphone,
  MessageSquare,
  Volume2,
  Sliders,
  Filter,
  Layers,
  X,
  Phone,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface PriceAlertNotificationSectionProps {
  onNavigateToBuyers?: () => void;
  onNavigateToWarehouses?: () => void;
  onNavigateToListings?: () => void;
}

export const PriceAlertNotificationSection: React.FC<PriceAlertNotificationSectionProps> = ({
  onNavigateToBuyers,
  onNavigateToWarehouses,
  onNavigateToListings,
}) => {
  const { currentUser, farmerProfile, showToast, refreshNotifications, setActiveFarmerTab } = useApp();

  const [rates, setRates] = useState<MarketPrice[]>([]);
  const [alertRules, setAlertRules] = useState<PriceAlertRule[]>([]);
  const [triggeredAlerts, setTriggeredAlerts] = useState<TriggeredPriceAlert[]>([]);
  const [buyers, setBuyers] = useState<BuyerListing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());

  // Filter states
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [alertFilter, setAlertFilter] = useState<'ALL' | 'UNREAD' | 'HIGH_PROFIT' | 'SURGE'>('ALL');

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // New Alert Form state
  const [formCommodity, setFormCommodity] = useState<string>('Tomato');
  const [formMandi, setFormMandi] = useState<string>('Pollachi Regulated Market & APMC');
  const [formCondition, setFormCondition] = useState<PriceAlertCondition>('ABOVE_TARGET');
  const [formTargetPrice, setFormTargetPrice] = useState<number>(2400);
  const [formThreshold, setFormThreshold] = useState<number>(5);
  const [formChannels, setFormChannels] = useState<Array<'in_app' | 'push' | 'sms' | 'whatsapp'>>([
    'in_app',
    'push',
    'sms',
  ]);
  const [formNote, setFormNote] = useState<string>('');

  // Quick Preset options
  const PRESET_COMMODITIES = [
    { name: 'Tomato', mandi: 'Pollachi Regulated Market & APMC', defaultPrice: 2400, defaultCondition: 'ABOVE_TARGET' as PriceAlertCondition },
    { name: 'Small Onion (Shallots)', mandi: 'Coimbatore M.G.R. Central APMC', defaultPrice: 5000, defaultCondition: 'PERCENT_SURGE' as PriceAlertCondition },
    { name: 'Coconut (Raw)', mandi: 'Pollachi Coconut & Copra Regulated Market', defaultPrice: 3500, defaultCondition: 'ABOVE_TARGET' as PriceAlertCondition },
    { name: 'Groundnut (Pods)', mandi: 'Pollachi Oilseed & Groundnut Yard', defaultPrice: 6800, defaultCondition: 'ABOVE_TARGET' as PriceAlertCondition },
    { name: 'Turmeric (Finger)', mandi: 'Erode Turmeric Special Commodity Market', defaultPrice: 15500, defaultCondition: 'ABOVE_TARGET' as PriceAlertCondition },
    { name: 'Red Chilli (Dry)', mandi: 'Madurai Central APMC (Mattuthavani)', defaultPrice: 18000, defaultCondition: 'PERCENT_SURGE' as PriceAlertCondition },
    { name: 'Paddy (Dhan)', mandi: 'Thanjavur Grain Regulated Market', defaultPrice: 2550, defaultCondition: 'ABOVE_TARGET' as PriceAlertCondition },
    { name: 'Garlic (Hill Produce)', mandi: 'Mettupalayam Nilgiris Hill Produce Market', defaultPrice: 15000, defaultCondition: 'PERCENT_SURGE' as PriceAlertCondition },
  ];

  // Load all market and alert data
  const loadAlertsAndRates = useCallback(async () => {
    try {
      setLoading(true);
      const [marketData, rulesData, historyData, buyersData] = await Promise.all([
        api.getMarketPrices(),
        api.getPriceAlertRules(currentUser?.id || 'usr_farmer_1'),
        api.getTriggeredPriceAlerts(currentUser?.id || 'usr_farmer_1'),
        api.getBuyers(),
      ]);

      setRates(marketData);
      setAlertRules(rulesData);
      setTriggeredAlerts(historyData);
      setBuyers(buyersData);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to load market price alerts data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    loadAlertsAndRates();
  }, [loadAlertsAndRates]);

  // Fetch Live Rates and trigger real-time alert evaluation
  const handleFetchLiveRates = async (fluctuate: boolean = true) => {
    try {
      setIsRefreshing(true);
      const res = await api.fetchLiveMarketRates({ fluctuateRandomly: fluctuate });
      if (res.success) {
        setRates(res.rates);
        setLastUpdated(new Date().toLocaleTimeString());

        // Refresh rules and triggered alerts
        const [updatedRules, updatedHistory] = await Promise.all([
          api.getPriceAlertRules(currentUser?.id || 'usr_farmer_1'),
          api.getTriggeredPriceAlerts(currentUser?.id || 'usr_farmer_1'),
        ]);
        setAlertRules(updatedRules);
        setTriggeredAlerts(updatedHistory);
        refreshNotifications();

        if (res.triggeredCount > 0) {
          showToast(`🔔 ${res.triggeredCount} New Real-Time Price Alert(s) Triggered! Check your alert stream below.`);
        } else {
          showToast('⚡ Live APMC Mandi rates updated. No new alert threshold breaches.');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch live market rates');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Create new rule
  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const newRule: Partial<PriceAlertRule> = {
        userId: currentUser?.id || 'usr_farmer_1',
        commodity: formCommodity,
        mandiName: formMandi,
        district: formMandi.includes('Pollachi') || formMandi.includes('Coimbatore') ? 'Coimbatore' : 'Tamil Nadu',
        state: 'Tamil Nadu',
        condition: formCondition,
        targetPriceINR: Number(formTargetPrice),
        thresholdPercent: Number(formThreshold),
        channels: formChannels,
        note: formNote || undefined,
        status: 'ACTIVE',
      };

      const res = await api.createPriceAlertRule(newRule);
      if (res.success) {
        showToast(`🔔 Price alert created for ${formCommodity} at ${formMandi}!`);
        setIsCreateModalOpen(false);
        setFormNote('');
        loadAlertsAndRates();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to create price alert rule');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle rule status (Active / Paused)
  const handleToggleRuleStatus = async (rule: PriceAlertRule) => {
    try {
      const newStatus = rule.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
      await api.updatePriceAlertRule(rule.id, { status: newStatus });
      showToast(`Alert for ${rule.commodity} is now ${newStatus.toLowerCase()}.`);
      setAlertRules((prev) =>
        prev.map((r) => (r.id === rule.id ? { ...r, status: newStatus } : r))
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to update alert');
    }
  };

  // Delete rule
  const handleDeleteRule = async (id: string, commodity: string) => {
    try {
      await api.deletePriceAlertRule(id);
      showToast(`Price alert rule for ${commodity} removed.`);
      setAlertRules((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      showToast(err.message || 'Failed to delete rule');
    }
  };

  // Mark triggered alert as read
  const handleMarkAlertRead = async (id: string) => {
    try {
      await api.markTriggeredAlertRead(id);
      setTriggeredAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isRead: true } : a))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Channel toggle helper
  const toggleChannel = (channel: 'in_app' | 'push' | 'sms' | 'whatsapp') => {
    setFormChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    );
  };

  // Filtered rates
  const filteredRates = rates.filter((item) => {
    if (selectedDistrict !== 'ALL' && item.district !== selectedDistrict) return false;
    if (selectedCategory !== 'ALL' && item.category && item.category !== selectedCategory) return false;
    return true;
  });

  // Filtered triggered alerts
  const filteredTriggeredAlerts = triggeredAlerts.filter((alert) => {
    if (alertFilter === 'UNREAD') return !alert.isRead;
    if (alertFilter === 'HIGH_PROFIT') return alert.alertType === 'HIGH_PROFIT_SELL';
    if (alertFilter === 'SURGE') return alert.alertType === 'SURGE_SPIKE';
    return true;
  });

  const unreadAlertsCount = triggeredAlerts.filter((a) => !a.isRead).length;

  return (
    <div className="space-y-6">
      {/* Top Banner with Real-Time Ticker Controls */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm border border-emerald-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-black shadow-xs">
              <BellRing className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white">Live Commodity Price Alerts & Mandi Ticker</h2>
                <span className="flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>AGMARKNET Real-Time Feed</span>
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Automated rate tracking across local APMC yards with instant SMS, WhatsApp & Push price surge notifications
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleFetchLiveRates(true)}
              disabled={isRefreshing}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              title="Fetch latest rates and check price alert thresholds"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-300' : 'text-emerald-300'}`} />
              <span>{isRefreshing ? 'Checking Rates...' : 'Fetch Live Rates'}</span>
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-black shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-stone-950" />
              <span>Set New Price Alert</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/10 text-xs">
          <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
            <span className="text-emerald-200/80 text-[10px] uppercase font-bold block">Active Subscriptions</span>
            <span className="text-lg font-black text-white">{alertRules.filter((r) => r.status === 'ACTIVE').length} Rules</span>
          </div>

          <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
            <span className="text-emerald-200/80 text-[10px] uppercase font-bold block">Unread Alerts</span>
            <span className={`text-lg font-black ${unreadAlertsCount > 0 ? 'text-amber-300' : 'text-emerald-300'}`}>
              {unreadAlertsCount} Notifications
            </span>
          </div>

          <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
            <span className="text-emerald-200/80 text-[10px] uppercase font-bold block">Local Mandis Monitored</span>
            <span className="text-lg font-black text-white">{new Set(rates.map((r) => r.mandi_name)).size} APMC Yards</span>
          </div>

          <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
            <span className="text-emerald-200/80 text-[10px] uppercase font-bold block">Last Ticker Refresh</span>
            <span className="text-xs font-bold text-emerald-200 flex items-center gap-1 mt-1">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              {lastUpdated}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: REAL-TIME TRIGGERED PRICE ALERTS STREAM */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-900">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Real-Time Triggered Alerts Feed</h3>
              <p className="text-xs text-stone-500">Live signals when market rates cross your target profits or fluctuate sharply</p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
            {(
              [
                { id: 'ALL', label: 'All Alerts' },
                { id: 'UNREAD', label: `Unread (${unreadAlertsCount})` },
                { id: 'HIGH_PROFIT', label: 'High Profit 🚀' },
                { id: 'SURGE', label: 'Surge 📈' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setAlertFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  alertFilter === f.id ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Triggered Alerts Cards */}
        {filteredTriggeredAlerts.length === 0 ? (
          <div className="text-center py-8 bg-stone-50 rounded-xl border border-dashed border-stone-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-80" />
            <p className="text-xs font-bold text-stone-800">All caught up! No active threshold breaches.</p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Click &quot;Fetch Live Rates&quot; to check the latest mandi price fluctuations against your rules.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTriggeredAlerts.map((alert) => {
              const isHighProfit = alert.alertType === 'HIGH_PROFIT_SELL';
              const isSurge = alert.alertType === 'SURGE_SPIKE';
              const isDip = alert.alertType === 'PRICE_DIP_WARNING';

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border transition-all space-y-3 ${
                    alert.isRead
                      ? 'bg-stone-50/70 border-stone-200'
                      : isHighProfit
                      ? 'bg-emerald-50/50 border-emerald-300 shadow-xs ring-1 ring-emerald-400/20'
                      : isSurge
                      ? 'bg-amber-50/50 border-amber-300 shadow-xs ring-1 ring-amber-400/20'
                      : 'bg-rose-50/50 border-rose-300 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            isHighProfit
                              ? 'bg-emerald-200 text-emerald-900'
                              : isSurge
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-rose-200 text-rose-900'
                          }`}
                        >
                          {alert.alertType.replace(/_/g, ' ')}
                        </span>
                        <h4 className="text-sm font-bold text-stone-900">{alert.headline}</h4>
                        {!alert.isRead && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                        )}
                      </div>

                      <p className="text-xs text-stone-600 flex items-center gap-2">
                        <span className="flex items-center gap-1 font-semibold text-stone-700">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          {alert.mandiName} ({alert.district})
                        </span>
                        <span>•</span>
                        <span className="text-stone-400">
                          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </p>
                    </div>

                    {/* Price delta badge */}
                    <div className="flex items-center space-x-3 text-right">
                      <div>
                        <span className="text-xs text-stone-400 block line-through">₹{alert.previousPrice}/Q</span>
                        <span className="text-base font-black text-stone-900">₹{alert.newPrice}/Q</span>
                      </div>
                      <div
                        className={`px-2.5 py-1 rounded-xl text-xs font-extrabold flex items-center space-x-0.5 ${
                          alert.changePercent >= 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {alert.changePercent >= 0 ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        <span>{alert.changePercent > 0 ? '+' : ''}{alert.changePercent}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Message & Action Recommendation */}
                  <div className="bg-white/80 p-3 rounded-lg border border-stone-200/80 text-xs space-y-1.5">
                    <p className="text-stone-700 leading-relaxed">{alert.message}</p>
                    {alert.actionRecommendation && (
                      <div className="flex items-start space-x-1.5 text-emerald-900 font-semibold pt-1 border-t border-stone-100">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                        <span>💡 Recommendation: {alert.actionRecommendation}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {alert.suggestedAction === 'VIEW_BUYERS' || alert.suggestedAction === 'SELL_NOW' ? (
                        <button
                          onClick={onNavigateToBuyers || (() => setActiveFarmerTab('market'))}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center space-x-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Contact Buyers ({buyers.filter((b) => b.crops_demanded.some((c) => alert.commodity.includes(c))).length})</span>
                        </button>
                      ) : null}

                      {alert.suggestedAction === 'STORE_IN_WAREHOUSE' ? (
                        <button
                          onClick={onNavigateToWarehouses || (() => setActiveFarmerTab('warehouses'))}
                          className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg transition-colors"
                        >
                          Book Cold Storage
                        </button>
                      ) : null}

                      <button
                        onClick={onNavigateToListings || (() => setActiveFarmerTab('market'))}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-lg transition-colors"
                      >
                        Create Sell Listing
                      </button>
                    </div>

                    {!alert.isRead && (
                      <button
                        onClick={() => handleMarkAlertRead(alert.id)}
                        className="text-xs text-stone-500 hover:text-stone-800 font-semibold underline cursor-pointer"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: CONFIGURED PRICE ALERT RULES & SUBSCRIPTIONS */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div>
            <h3 className="font-bold text-stone-900 text-sm">Your Active Price Alert Subscriptions</h3>
            <p className="text-xs text-stone-500">
              The engine automatically evaluates live AGMARKNET mandi feeds against your threshold rules
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Alert Rule</span>
          </button>
        </div>

        {/* Quick Presets for Common Farmer Harvests */}
        <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Quick One-Click Alert Presets for Your Harvests:
            </span>
            <span className="text-[10px] text-emerald-700 font-medium">Click to configure</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESET_COMMODITIES.map((p) => {
              const alreadyExists = alertRules.some((r) => r.commodity === p.name);
              return (
                <button
                  key={p.name}
                  onClick={() => {
                    setFormCommodity(p.name);
                    setFormMandi(p.mandi);
                    setFormTargetPrice(p.defaultPrice);
                    setFormCondition(p.defaultCondition);
                    setIsCreateModalOpen(true);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                    alreadyExists
                      ? 'bg-emerald-100/70 border-emerald-300 text-emerald-900'
                      : 'bg-white border-emerald-200 text-stone-800 hover:border-emerald-500 shadow-2xs'
                  }`}
                >
                  {p.name} {alreadyExists ? '✓' : `(Target: ₹${p.defaultPrice}/Q)`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alertRules.map((rule) => {
            const isPaused = rule.status === 'PAUSED';
            const matchedRate = rates.find((r) => r.commodity === rule.commodity);
            const currentPrice = matchedRate?.modal_price_per_quintal || matchedRate?.modal_price_inr || rule.currentPriceINR || 2200;
            const isTargetMet =
              rule.condition === 'ABOVE_TARGET'
                ? currentPrice >= rule.targetPriceINR
                : rule.condition === 'BELOW_TARGET'
                ? currentPrice <= rule.targetPriceINR
                : false;

            return (
              <div
                key={rule.id}
                className={`p-4 rounded-xl border transition-all space-y-3 flex flex-col justify-between ${
                  isPaused
                    ? 'bg-stone-50 border-stone-200 opacity-60'
                    : isTargetMet
                    ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-400/20'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-stone-900 text-sm">{rule.commodity}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                          isPaused
                            ? 'bg-stone-200 text-stone-600'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {rule.status}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleToggleRuleStatus(rule)}
                        className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                        title={isPaused ? 'Resume Alert' : 'Pause Alert'}
                      >
                        {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id, rule.commodity)}
                        className="p-1 rounded-md text-rose-400 hover:text-rose-700 hover:bg-rose-50"
                        title="Delete Alert Rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-stone-500 mt-0.5 flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    <span>{rule.mandiName}</span>
                  </p>

                  <div className="mt-3 p-2.5 rounded-lg bg-stone-50 border border-stone-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">Condition:</span>
                      <span className="font-bold text-stone-800">
                        {rule.condition === 'ABOVE_TARGET' && `Rate ≥ ₹${rule.targetPriceINR}/Q`}
                        {rule.condition === 'BELOW_TARGET' && `Rate ≤ ₹${rule.targetPriceINR}/Q`}
                        {rule.condition === 'PERCENT_SURGE' && `Surge Spike > ${rule.thresholdPercent}%`}
                        {rule.condition === 'PERCENT_DROP' && `Price Drop > ${rule.thresholdPercent}%`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">Current Market Rate:</span>
                      <strong className={`font-black ${isTargetMet ? 'text-emerald-700' : 'text-stone-900'}`}>
                        ₹{currentPrice}/Q {isTargetMet ? '🎯 (Target Met)' : ''}
                      </strong>
                    </div>

                    {rule.note && (
                      <p className="text-[11px] text-stone-500 italic pt-1 border-t border-stone-200">
                        &ldquo;{rule.note}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer status */}
                <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-100">
                  <span className="flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-stone-400" />
                    {rule.channels.join(', ').toUpperCase()}
                  </span>
                  <span>Fired {rule.triggerCount || 0} times</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: LIVE APMC COMMODITY RATES TABLE & TICKER */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div>
            <h3 className="font-bold text-stone-900 text-sm">Live Local APMC Mandi Rates</h3>
            <p className="text-xs text-stone-500">Real-time daily modal rates, price ranges, and 24-hour trends</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-stone-400 font-semibold">District:</span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-xs font-bold text-stone-800"
              >
                <option value="ALL">All Districts</option>
                <option value="Coimbatore">Coimbatore (Pollachi)</option>
                <option value="Erode">Erode</option>
                <option value="Madurai">Madurai</option>
                <option value="Thanjavur">Thanjavur</option>
                <option value="Pune">Pune</option>
              </select>
            </div>

            <div className="flex items-center space-x-1 text-xs">
              <span className="text-stone-400 font-semibold">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-xs font-bold text-stone-800"
              >
                <option value="ALL">All Categories</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Spices & Commercial">Spices & Commercial</option>
                <option value="Oilseeds & Pulses">Oilseeds & Pulses</option>
                <option value="Cereals & Grains">Cereals & Grains</option>
              </select>
            </div>
          </div>
        </div>

        {/* Rates Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredRates.map((item) => {
            const modalPrice = item.modal_price_per_quintal || item.modal_price_inr || 2200;
            const minPrice = item.min_price_per_quintal || item.min_price_inr || Math.round(modalPrice * 0.85);
            const maxPrice = item.max_price_per_quintal || item.max_price_inr || Math.round(modalPrice * 1.15);
            const changePercent = item.price_change_percent || (item.price_trend === 'up' ? 4.2 : -1.5);
            const isSubscribed = alertRules.some((r) => r.commodity === item.commodity && r.status === 'ACTIVE');

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-stone-200 bg-white hover:border-emerald-500 hover:shadow-xs transition-all space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                      {item.category || 'Agricultural Produce'}
                    </span>
                    <span
                      className={`text-xs font-extrabold flex items-center space-x-0.5 ${
                        changePercent >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {changePercent >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      <span>{changePercent > 0 ? '+' : ''}{changePercent}%</span>
                    </span>
                  </div>

                  <h4 className="font-bold text-stone-900 text-sm mt-1">{item.commodity}</h4>
                  <p className="text-xs text-stone-500">
                    {item.variety} • {item.mandi_name}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-stone-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Modal Price:</span>
                    <strong className="text-base font-black text-stone-900">₹{modalPrice} / Quintal</strong>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <span>Range: ₹{minPrice} - ₹{maxPrice}</span>
                    <span>Arrivals: {item.arrival_quantity_tonnes || 120} T</span>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setFormCommodity(item.commodity);
                        setFormMandi(item.mandi_name);
                        setFormTargetPrice(Math.round(modalPrice * 1.05));
                        setIsCreateModalOpen(true);
                      }}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center justify-center space-x-1 ${
                        isSubscribed
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-stone-50 hover:bg-emerald-50 hover:text-emerald-800 text-stone-700 border-stone-200'
                      }`}
                    >
                      <Bell className="w-3 h-3" />
                      <span>{isSubscribed ? 'Alert Active ✓' : 'Set Alert'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: SET NEW PRICE ALERT */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-900">
                  <BellRing className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-stone-900">Create Live Price Alert</h3>
                  <p className="text-xs text-stone-500">Receive automated signals when market rates reach your target</p>
                </div>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Select Commodity</label>
                <select
                  value={formCommodity}
                  onChange={(e) => {
                    setFormCommodity(e.target.value);
                    const matched = rates.find((r) => r.commodity === e.target.value);
                    if (matched) {
                      setFormMandi(matched.mandi_name);
                      setFormTargetPrice(Math.round((matched.modal_price_per_quintal || 2200) * 1.05));
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-semibold text-stone-900"
                >
                  {Array.from(new Set(rates.map((r) => r.commodity))).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Target Mandi (APMC Market)</label>
                <select
                  value={formMandi}
                  onChange={(e) => setFormMandi(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-semibold text-stone-900"
                >
                  {Array.from(new Set(rates.map((r) => r.mandi_name))).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Alert Condition</label>
                  <select
                    value={formCondition}
                    onChange={(e) => setFormCondition(e.target.value as PriceAlertCondition)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-semibold text-stone-900"
                  >
                    <option value="ABOVE_TARGET">Target Price Hit (Rate ≥ ₹)</option>
                    <option value="BELOW_TARGET">Dip Floor Price (Rate ≤ ₹)</option>
                    <option value="PERCENT_SURGE">Surge Spike (% Jump)</option>
                    <option value="PERCENT_DROP">Sudden Drop (% Fall)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    {formCondition.includes('PERCENT') ? 'Threshold Percent (%)' : 'Target Price (₹ / Quintal)'}
                  </label>
                  {formCondition.includes('PERCENT') ? (
                    <input
                      type="number"
                      value={formThreshold}
                      onChange={(e) => setFormThreshold(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold"
                      min={1}
                      max={50}
                    />
                  ) : (
                    <input
                      type="number"
                      value={formTargetPrice}
                      onChange={(e) => setFormTargetPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold"
                      min={100}
                      step={50}
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">Notification Channels</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'in_app', label: 'In-App' },
                    { id: 'push', label: 'Web Push' },
                    { id: 'sms', label: 'SMS Alert' },
                    { id: 'whatsapp', label: 'WhatsApp' },
                  ].map((ch) => {
                    const isChecked = formChannels.includes(ch.id as any);
                    return (
                      <button
                        type="button"
                        key={ch.id}
                        onClick={() => toggleChannel(ch.id as any)}
                        className={`py-2 px-2.5 rounded-xl border font-bold text-center transition-all ${
                          isChecked
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                            : 'bg-stone-50 border-stone-200 text-stone-600'
                        }`}
                      >
                        {ch.label} {isChecked ? '✓' : ''}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Optional Farmer Note</label>
                <input
                  type="text"
                  placeholder="e.g. Sell ready picking from North Block Plot A"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Activating...' : 'Activate Price Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
