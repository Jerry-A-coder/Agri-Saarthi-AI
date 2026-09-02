import React from 'react';
import { Camera, Warehouse, FlaskConical, FileCheck2, TrendingUp, Bot, MapPin, Database } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FeaturesPage: React.FC = () => {
  const { setRole, setActiveFarmerTab } = useApp();

  const featureList = [
    {
      icon: Camera,
      title: 'Real-Time Plant Disease & Pest Diagnosis',
      desc: 'Capture or upload plant leaves. The system validates image sharpness, isolates symptom lesions, and delivers calibrated diagnoses (Early Blight, Leaf Curl, Spodoptera, Yellow Chlorosis) with organic & biological IPM recommendations.',
      tab: 'plant-scanner',
    },
    {
      icon: Warehouse,
      title: 'Nearby Warehouse & Cold Chain Finder',
      desc: 'GPS-enabled locator for Central & State Warehousing Corporation (CWC/TNWC) facilities. Includes live capacity meters, anti-overbooking locks, dynamic rent calculation, and Storage Profitability ROI forecasting.',
      tab: 'warehouses',
    },
    {
      icon: FlaskConical,
      title: 'Soil Intelligence & Health Card Interpretation',
      desc: 'Connect with ICAR-accredited soil testing labs, schedule door-step sample collection, and analyze 12-parameter soil health cards (pH, EC, Organic Carbon, NPK, Zinc, Boron) with automated fertilizer dosing.',
      tab: 'soil',
    },
    {
      icon: TrendingUp,
      title: 'Crop Selection & Planned Crop Rotation',
      desc: 'Data-driven crop recommendations tailored to soil chemistry and season. Visual crop rotation planner that designs sequential cropping to break pest life cycles and fix atmospheric nitrogen.',
      tab: 'crops',
    },
    {
      icon: FileCheck2,
      title: 'Government Scheme Facilitation & Tracking',
      desc: 'Direct portal linking and eligibility check for PM-KISAN, PM Fasal Bima Yojana (PMFBY), SMAM Tractor Subsidies, and PMKSY Drip Irrigation with real-time status updates.',
      tab: 'schemes',
    },
    {
      icon: Database,
      title: 'Live APMC Mandi Market & Buyer Marketplace',
      desc: 'Real-time commodity prices from AGMARKNET with 30-day historical trend charts. Direct marketplace connecting farmers with verified food processors, exporters, and FPOs to eliminate exploitative middlemen.',
      tab: 'market',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Complete Feature Suite
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          Engineered for Indian Farmers & Agronomists
        </h1>
        <p className="text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Every tool is deeply integrated with our central relational database and AI advisory models.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featureList.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-700 flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-stone-900">{f.title}</h3>
                <p className="text-xs text-stone-600 leading-relaxed">{f.desc}</p>
              </div>
              <button
                onClick={() => {
                  setRole('farmer');
                  setActiveFarmerTab(f.tab);
                }}
                className="mt-4 pt-3 border-t border-stone-100 text-xs font-bold text-emerald-700 hover:text-emerald-800 text-left"
              >
                Open Feature in Farmer Portal →
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
