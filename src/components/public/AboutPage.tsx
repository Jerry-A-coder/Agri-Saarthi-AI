import React from 'react';
import { ShieldCheck, Target, Cpu, Users, Leaf, CheckCircle, Database, Award } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Smart India Hackathon 2025 • SIH25076
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          About AgriSaarthi AI
        </h1>
        <p className="text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
          A unified digital agricultural intermediary platform bridging Indian farmers with intelligent crop advisory, scientific soil management, cold storage hubs, government schemes, and direct market access.
        </p>
      </div>

      {/* Problem vs Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-red-50/70 border border-red-200/80 rounded-2xl p-6 space-y-3">
          <div className="inline-flex items-center space-x-2 text-red-800 font-bold text-sm">
            <span>The Fragmentation Problem</span>
          </div>
          <p className="text-xs text-red-950/80 leading-relaxed">
            Indian farmers currently depend on multiple disconnected sources for soil testing, crop selection, government schemes, storage facilities, market rates, and expert agronomic advice. Combined with language barriers, delayed testing support, and lack of nearby cold chain transparency, this results in significant post-harvest losses and depressed farm incomes.
          </p>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-6 space-y-3">
          <div className="inline-flex items-center space-x-2 text-emerald-800 font-bold text-sm">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>The AgriSaarthi Solution</span>
          </div>
          <p className="text-xs text-emerald-950/80 leading-relaxed">
            AgriSaarthi AI acts as a single intelligent intermediary. By synthesizing farm boundaries, historical crop cycles, 12-parameter soil health cards, real-time computer vision disease scans, and CWC/TNWC storage availability, the platform provides actionable, data-backed recommendations and instant booking capabilities.
          </p>
        </div>
      </div>

      {/* Architecture Highlights */}
      <div className="bg-white border border-stone-200 rounded-2xl p-8 space-y-6 shadow-xs">
        <h2 className="text-lg font-bold text-stone-900 flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-emerald-600" />
          <span>Technical Architecture & Innovation</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-stone-600">
          <div className="space-y-2 border-l-2 border-emerald-500 pl-4">
            <h3 className="font-bold text-stone-900 text-sm">Central Relational Database</h3>
            <p>
              Supabase PostgreSQL architecture featuring 30+ relational schemas with foreign-key referential integrity, automated audit trails, and transactional capacity management.
            </p>
          </div>
          <div className="space-y-2 border-l-2 border-amber-500 pl-4">
            <h3 className="font-bold text-stone-900 text-sm">Vision & Agronomic AI</h3>
            <p>
              Ensemble computer-vision pipeline analyzing image sharpness, lighting, leaf centering, and fungal/viral lesion patterns powered by Gemini 3.7 Flash and PlantCV heuristics.
            </p>
          </div>
          <div className="space-y-2 border-l-2 border-indigo-500 pl-4">
            <h3 className="font-bold text-stone-900 text-sm">Geo-Spatial Logistics</h3>
            <p>
              Haversine & road routing algorithms connecting farmers to nearby cold rooms, warehouses, and NABL soil laboratories within their district.
            </p>
          </div>
        </div>
      </div>

      {/* Team Note */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-base text-white">Developed by Taskforce Titans</h3>
          <p className="text-xs text-stone-400 mt-1">Smart India Hackathon 2025 • Theme: Agricultural, Food Tech and Rural Development</p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-emerald-700/80 text-white font-bold text-xs">
          SIH25076 Compliant
        </div>
      </div>
    </div>
  );
};
