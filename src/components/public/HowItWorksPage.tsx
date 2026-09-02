import React from 'react';
import { ArrowRight, Bot, Camera, Warehouse, FlaskConical, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const HowItWorksPage: React.FC = () => {
  const { setRole, setActiveFarmerTab } = useApp();

  const steps = [
    {
      num: '01',
      title: 'Farmer Interaction',
      desc: 'The farmer interacts through voice, photo upload, or text in their local language (Tamil, Hindi, Telugu, Marathi, Kannada, English).',
      icon: Bot,
      color: 'bg-emerald-100 text-emerald-800',
    },
    {
      num: '02',
      title: 'Farm & GIS Context Retrieval',
      desc: 'AgriSaarthi retrieves farm soil type (pH, NPK), active crop stage, weather forecast, and geographic coordinates from the central database.',
      icon: FlaskConical,
      color: 'bg-blue-100 text-blue-800',
    },
    {
      num: '03',
      title: 'Computer Vision & AI Inference',
      desc: 'Plant images undergo quality checks (blur, illumination) before deep disease/pest classification and IPM generation by Gemini 3.7 Flash.',
      icon: Camera,
      color: 'bg-purple-100 text-purple-800',
    },
    {
      num: '04',
      title: 'Intermediary Facilitation & Storage',
      desc: 'If storage is needed, the system calculates distance to nearby CWC/TNWC warehouses, checks real-time available capacity, and calculates storage ROI.',
      icon: Warehouse,
      color: 'bg-amber-100 text-amber-800',
    },
    {
      num: '05',
      title: 'Direct Market & Scheme Connect',
      desc: 'Farmers view live APMC mandi trends, match with verified food processors and FPOs, and apply directly for government subsidies with one click.',
      icon: TrendingUp,
      color: 'bg-teal-100 text-teal-800',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Autonomous Agricultural Intermediary
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          How AgriSaarthi AI Works
        </h1>
        <p className="text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
          From query to resolution: A step-by-step breakdown of how our AI engine orchestrates services for the farmer.
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.num}
              className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-6 shadow-xs hover:border-emerald-300 transition-colors"
            >
              <div className="flex items-center space-x-3 sm:space-x-0">
                <span className="font-mono text-2xl font-black text-stone-300">{s.num}</span>
                <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-stone-900">{s.title}</h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Box */}
      <div className="bg-emerald-900 text-white rounded-2xl p-8 text-center space-y-4">
        <h3 className="text-xl font-bold">Experience the AgriSaarthi Ecosystem Live</h3>
        <p className="text-xs text-emerald-200 max-w-xl mx-auto">
          Test plant disease diagnosis, find nearby cold storages, check live APMC mandi prices, or review the central database.
        </p>
        <button
          onClick={() => {
            setRole('farmer');
            setActiveFarmerTab('plant-scanner');
          }}
          className="px-6 py-3 rounded-xl bg-white text-emerald-950 font-bold text-xs shadow-md hover:bg-emerald-50 transition-all inline-flex items-center space-x-2"
        >
          <span>Launch Farmer Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
