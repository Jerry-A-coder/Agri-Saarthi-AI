import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sprout,
  Camera,
  Warehouse,
  FlaskConical,
  FileCheck2,
  TrendingUp,
  Users,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  MapPin,
  Bot,
  Layers,
  Database,
  Building,
} from 'lucide-react';
import { api } from '../../services/api';
import { SystemHealthStats } from '../../types';

export const LandingPage: React.FC = () => {
  const { setRole, setActiveFarmerTab, setActivePublicTab } = useApp();
  const [health, setHealth] = useState<SystemHealthStats | null>(null);

  useEffect(() => {
    api.getSystemHealth().then(setHealth).catch(console.error);
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-stone-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold backdrop-blur">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>SIH25076 • Agricultural Advisory & Intermediary Facilitation</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            One Conversation. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">
              All Agricultural Services.
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-emerald-100/90 leading-relaxed font-normal">
            AgriSaarthi AI is an integrated digital agricultural intermediary connecting Indian farmers with real-time AI crop advisory, computer-vision plant health scans, nearby CWC/TNWC cold storages, certified soil testing labs, government schemes, and direct market buyers.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
            <button
              id="cta-farmer-portal"
              onClick={() => {
                setRole('farmer');
                setActiveFarmerTab('plant-scanner');
              }}
              className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-sm shadow-lg shadow-emerald-900/50 flex items-center space-x-2 transition-all hover:scale-[1.02]"
            >
              <Camera className="w-4 h-4 text-stone-900" />
              <span>Access Farmer Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="cta-warehouse-finder"
              onClick={() => {
                setRole('farmer');
                setActiveFarmerTab('warehouses');
              }}
              className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur flex items-center space-x-2 transition-all"
            >
              <Warehouse className="w-4 h-4 text-emerald-300" />
              <span>Nearby Warehouses</span>
            </button>

            <button
              id="cta-provider-portal"
              onClick={() => setRole('provider')}
              className="px-5 py-3.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold text-sm border border-amber-400/30 backdrop-blur flex items-center space-x-2 transition-all"
            >
              <Building className="w-4 h-4 text-amber-400" />
              <span>Storage Provider Login</span>
            </button>

            <button
              id="cta-admin-portal"
              onClick={() => setRole('admin')}
              className="px-5 py-3.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 font-semibold text-sm border border-indigo-400/30 backdrop-blur flex items-center space-x-2 transition-all"
            >
              <Database className="w-4 h-4 text-indigo-400" />
              <span>Admin & Database Hub</span>
            </button>
          </div>

          {/* Quick Stat Pill Bar */}
          {health && (
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-emerald-200/80 border-t border-emerald-700/40 max-w-4xl mx-auto">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Database: <strong className="text-white">Supabase Relational ({health.total_farmers} Farmers)</strong></span>
              </div>
              <div>•</div>
              <div>Warehouses Indexed: <strong className="text-white">{health.total_warehouses} Hubs</strong></div>
              <div>•</div>
              <div>AI Diagnostic Model: <strong className="text-white">Gemini 3.7 Flash + PlantCV</strong></div>
            </div>
          )}
        </div>
      </section>

      {/* Core Solution Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            End-To-End Agricultural Ecosystem
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">
            Solving Agricultural Fragmentation with Data & AI
          </h2>
          <p className="text-sm text-stone-500 max-w-2xl mx-auto">
            Connecting isolated rural services into an intelligent, transparent workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-2">Real-Time Plant Health Scanner</h3>
            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              Multi-step image analysis checking blur and lighting, classifying early blight, viral curl, pest infestations, and nutrient chlorosis with calibrated confidence scores and IPM advice.
            </p>
            <button
              onClick={() => {
                setRole('farmer');
                setActiveFarmerTab('plant-scanner');
              }}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
            >
              <span>Try Plant Scanner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
              <Warehouse className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-2">Nearby Warehouse Intelligence</h3>
            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              Find nearest CWC and State Warehousing Corporation cold and dry storages with verified live capacity, road travel distance, dynamic rent calculation, and storage profitability projections.
            </p>
            <button
              onClick={() => {
                setRole('farmer');
                setActiveFarmerTab('warehouses');
              }}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center space-x-1"
            >
              <span>Explore Storage Finder</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-4">
              <FlaskConical className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-2">Soil Testing & Crop Rotation</h3>
            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              Locate ICAR-accredited soil testing labs, book sample pickup, interpret 12-parameter Soil Health Cards, and generate planned multi-season crop rotation sequences to build soil fertility.
            </p>
            <button
              onClick={() => {
                setRole('farmer');
                setActiveFarmerTab('soil');
              }}
              className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center space-x-1"
            >
              <span>View Soil Labs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-4">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-2">Government Scheme Facilitation</h3>
            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              Instant eligibility screening for PM-KISAN, PM Fasal Bima Yojana (PMFBY), SMAM Tractor Subsidy, and PMKSY Micro-Irrigation with direct application workflow tracking.
            </p>
            <button
              onClick={() => {
                setRole('farmer');
                setActiveFarmerTab('schemes');
              }}
              className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center space-x-1"
            >
              <span>Check Eligible Schemes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 5 */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-2">Live Mandi Prices & Direct Buyers</h3>
            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              Real-time AGMARKNET APMC market price trends, historical 30-day commodity charts, direct buyer listings (FPOs, food processors, exporters), and farmer crop sell offerings.
            </p>
            <button
              onClick={() => {
                setRole('farmer');
                setActiveFarmerTab('market');
              }}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
            >
              <span>Check Market Rates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 6 */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center mb-4">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-2">Multilingual Kisan AI Advisory</h3>
            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              Ask questions in Tamil, Hindi, Telugu, Marathi, Kannada, or English. Farm-aware context retrieves your specific soil profile, recent plant scan history, and local seasonal conditions.
            </p>
            <button
              onClick={() => {
                setRole('farmer');
                setActiveFarmerTab('ai-advisor');
              }}
              className="text-xs font-bold text-indigo-700 hover:text-indigo-800 flex items-center space-x-1"
            >
              <span>Talk to AI Copilot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Process Flow Banner */}
      <section className="bg-stone-100 py-12 px-4 sm:px-6 lg:px-8 border-y border-stone-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">How AgriSaarthi AI Operates</h2>
            <p className="text-xs text-stone-500">Autonomous workflow from farmer query to service fulfillment</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center">
            {[
              { step: '1', title: 'Farmer Query', desc: 'Voice, photo, or text in Indian languages' },
              { step: '2', title: 'Intent & GIS', desc: 'Language detection & farm data retrieval' },
              { step: '3', title: 'AI Reasoning', desc: 'Vision & agronomic model inference' },
              { step: '4', title: 'Recommendation', desc: 'Evidence-based crop & health advice' },
              { step: '5', title: 'Intermediary Link', desc: 'Warehouse / Lab / Buyer booking' },
              { step: '6', title: 'Farmer Decision', desc: 'Profit maximization & yield protection' },
            ].map((p) => (
              <div key={p.step} className="bg-white rounded-xl p-3 border border-stone-200/80 shadow-2xs">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs inline-flex items-center justify-center mb-2">
                  {p.step}
                </span>
                <h4 className="text-xs font-bold text-stone-900">{p.title}</h4>
                <p className="text-[10px] text-stone-500 mt-1 leading-snug">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
