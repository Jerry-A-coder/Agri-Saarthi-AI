import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PlantScannerView } from './PlantScannerView';
import { WarehouseFinderView } from './WarehouseFinderView';
import { AIAdvisorView } from './AIAdvisorView';
import { SoilLabsView } from './SoilLabsView';
import { CropRotationView } from './CropRotationView';
import { SchemesView } from './SchemesView';
import { MarketView } from './MarketView';
import { MyFarmView } from './MyFarmView';
import { YieldPredictionView } from './YieldPredictionView';
import { PestRiskPredictionView } from './PestRiskPredictionView';
import { FarmerCommunityMapView } from './FarmerCommunityMapView';
import { WeatherPlantingWidget } from './WeatherPlantingWidget';
import { FarmerVoiceQueryBar } from './FarmerVoiceQueryBar';
import { CropGrowthTrackerView } from './CropGrowthTrackerView';
import { InquiryChatbotModal } from '../common/InquiryChatbotModal';
import {
  Camera,
  Warehouse,
  Bot,
  FlaskConical,
  RotateCcw,
  FileCheck2,
  TrendingUp,
  Sprout,
  MapPin,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Bug,
  Clock,
  HelpCircle,
  MessageSquare,
  CloudSun,
  Users,
  Layers,
  Mic,
  CalendarCheck,
} from 'lucide-react';

export const FarmerDashboard: React.FC = () => {
  const {
    activeFarmerTab,
    setActiveFarmerTab,
    farmerProfile,
    currentLocation,
  } = useApp();

  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [advisorVoiceQuery, setAdvisorVoiceQuery] = useState<string | undefined>(undefined);

  const handleVoiceQuerySubmit = (spokenQuery: string) => {
    setAdvisorVoiceQuery(spokenQuery);
    setActiveFarmerTab('ai-advisor');
  };

  const navItems = [
    { id: 'crop-tracker', label: 'Crop Growth & Harvest Tracker', icon: CalendarCheck, badge: 'Planting Logs & Stages 5/5' },
    { id: 'community-map', label: 'Farmer Community & Knowledge Map', icon: Users, badge: 'Live Peer GIS' },
    { id: 'pest-risk', label: 'AI Pest Risk & Bio-Management', icon: Bug, badge: 'Proactive Alert' },
    { id: 'yield-prediction', label: 'AI Yield & 60-Day Forecast', icon: TrendingUp, badge: '60-Day AI Growth' },
    { id: 'weather-planting', label: 'Weather & Planting Time', icon: CloudSun, badge: 'Optimal Sowing' },
    { id: 'plant-scanner', label: 'Plant Health Scanner', icon: Camera, badge: 'Real-Time AI' },
    { id: 'warehouses', label: 'Nearby Warehouses & Cold Storage', icon: Warehouse, badge: 'Pollachi/CWC' },
    { id: 'ai-advisor', label: 'Kisan AI Advisor', icon: Bot, badge: 'Multilingual Voice' },
    { id: 'soil', label: 'Soil Labs & Health', icon: FlaskConical, badge: 'NABL Certified' },
    { id: 'market', label: 'Live Mandi & Price Alerts', icon: TrendingUp, badge: 'Live Ticker 🔔' },
    { id: 'my-farm', label: 'My Farm & Fields', icon: Sprout, badge: 'Plot GIS' },
    { id: 'crops', label: 'Intelligent Crop Rotation Advisor', icon: RotateCcw, badge: 'Soil NPK & Season' },
    { id: 'schemes', label: 'Govt. Schemes', icon: FileCheck2, badge: 'PM-KISAN' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Farmer Identity & Quick Summary Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-950 text-white rounded-2xl p-5 shadow-sm border border-emerald-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 text-stone-950 flex items-center justify-center font-black text-lg shadow-sm">
            🌱
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white">
                {farmerProfile?.farmer_name || 'Murugan Palaniswamy'}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-700 text-emerald-200 border border-emerald-600">
                Verified Kisan #TN-882
              </span>
            </div>
            <p className="text-xs text-emerald-100 flex items-center space-x-2 mt-0.5">
              <span>{farmerProfile?.land_area_acres || 6.5} Acres ({farmerProfile?.soil_type || 'Red Loamy'})</span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-emerald-300" />
                <span>{currentLocation.district}, {currentLocation.state}</span>
              </span>
            </p>
          </div>
        </div>

        {/* Quick Action Shortcut Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveFarmerTab('ai-advisor')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5 text-stone-950 animate-pulse" />
            <span>Voice Kisan Assistant</span>
          </button>

          <button
            onClick={() => setActiveFarmerTab('community-map')}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold text-xs shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-stone-950" />
            <span>Farmer Community GIS</span>
          </button>

          <button
            onClick={() => setActiveFarmerTab('pest-risk')}
            className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-stone-950 font-bold text-xs shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Bug className="w-3.5 h-3.5 text-stone-950" />
            <span>AI Pest Risk Alert</span>
          </button>

          <button
            onClick={() => setActiveFarmerTab('yield-prediction')}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white font-semibold text-xs border border-emerald-600 transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
            <span>AI Yield Forecast</span>
          </button>

          <button
            onClick={() => setActiveFarmerTab('weather-planting')}
            className="px-3.5 py-1.5 rounded-xl bg-white text-emerald-950 font-bold text-xs shadow-xs hover:bg-emerald-50 transition-colors flex items-center space-x-1.5"
          >
            <CloudSun className="w-3.5 h-3.5 text-emerald-700" />
            <span>Weather & Sowing</span>
          </button>

          <button
            onClick={() => setIsInquiryModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/90 hover:bg-amber-500 text-stone-950 font-bold text-xs transition-colors flex items-center space-x-1.5 shadow-xs"
          >
            <MessageSquare className="w-3.5 h-3.5 text-stone-950" />
            <span>Admin Helpdesk</span>
          </button>
        </div>
      </div>

      {/* Prominent Microphone Voice Input Bar for AI Assistant (Visible on all tabs or when speaking query) */}
      <FarmerVoiceQueryBar onAskAI={handleVoiceQuerySubmit} />

      {/* Real-Time Weather & Sowing Compact Banner (shown when not already on weather-planting tab) */}
      {activeFarmerTab !== 'weather-planting' && (
        <WeatherPlantingWidget
          compact={true}
          onNavigateToFull={() => setActiveFarmerTab('weather-planting')}
        />
      )}

      {/* Highlights Quick Bar: Weather Sowing, Cold Storage, Estimated Harvest, Demand */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          onClick={() => setActiveFarmerTab('weather-planting')}
          className="p-3.5 bg-white rounded-xl border border-stone-200 hover:border-emerald-500 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-stone-400">Optimal Planting Time</p>
              <p className="text-xs font-bold text-stone-900">Next 48h Window (96% Match)</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </div>

        <div
          onClick={() => setActiveFarmerTab('warehouses')}
          className="p-3.5 bg-white rounded-xl border border-stone-200 hover:border-emerald-500 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Warehouse className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-stone-400">Nearby Cold Storage</p>
              <p className="text-xs font-bold text-stone-900">4 Certified Units (4.2 km)</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </div>

        <div
          onClick={() => setActiveFarmerTab('crop-tracker')}
          className="p-3.5 bg-white rounded-xl border border-stone-200 hover:border-emerald-500 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-stone-400">Crop Growth & Harvest Tracker</p>
              <p className="text-xs font-bold text-stone-900">4 Standing Plots • 5 Stages</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </div>

        <div
          onClick={() => setActiveFarmerTab('market')}
          className="p-3.5 bg-white rounded-xl border border-stone-200 hover:border-emerald-500 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-stone-400">Live Mandi & Price Alerts</p>
              <p className="text-xs font-bold text-stone-900">Tomato & Small Onion Alerts Active</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </div>
      </div>

      {/* Main Layout: Horizontal Nav on Mobile, Sidebar + View on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Nav */}
        <aside className="lg:col-span-3 space-y-2">
          <div className="bg-white border border-stone-200 rounded-2xl p-3 shadow-xs space-y-1">
            <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
              Farmer Services
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeFarmerTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`farmer-tab-${item.id}`}
                  onClick={() => setActiveFarmerTab(item.id)}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-emerald-800 text-emerald-100'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Admin Helpdesk Floating trigger card */}
          <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl p-4 shadow-xs space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-300">
              <Bot className="w-4 h-4" />
              <span>Official Admin Helpdesk</span>
            </div>
            <p className="text-[11px] text-emerald-100 leading-relaxed">
              Have inquiries regarding cold storage allocations, soil test turnaround, government subsidies, or disputes?
            </p>
            <button
              onClick={() => setIsInquiryModalOpen(true)}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Start Admin Inquiry Chat</span>
            </button>
          </div>
        </aside>

        {/* Content Panel */}
        <main className="lg:col-span-9">
          {activeFarmerTab === 'crop-tracker' && <CropGrowthTrackerView />}
          {activeFarmerTab === 'community-map' && <FarmerCommunityMapView />}
          {activeFarmerTab === 'pest-risk' && <PestRiskPredictionView />}
          {activeFarmerTab === 'weather-planting' && <WeatherPlantingWidget />}
          {activeFarmerTab === 'yield-prediction' && <YieldPredictionView />}
          {activeFarmerTab === 'plant-scanner' && <PlantScannerView />}
          {activeFarmerTab === 'warehouses' && <WarehouseFinderView />}
          {activeFarmerTab === 'ai-advisor' && (
            <AIAdvisorView
              initialQuery={advisorVoiceQuery}
              onClearInitialQuery={() => setAdvisorVoiceQuery(undefined)}
            />
          )}
          {activeFarmerTab === 'soil' && <SoilLabsView />}
          {activeFarmerTab === 'crops' && <CropRotationView />}
          {activeFarmerTab === 'schemes' && <SchemesView />}
          {activeFarmerTab === 'market' && <MarketView />}
          {activeFarmerTab === 'my-farm' && <MyFarmView />}
        </main>
      </div>

      {/* Admin Inquiry Helpdesk Chatbot Modal */}
      <InquiryChatbotModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        defaultCategory="GENERAL"
      />
    </div>
  );
};

