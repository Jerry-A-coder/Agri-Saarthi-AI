import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Farm, Field, CropHarvestEstimate } from '../../types';
import {
  MapPin,
  Layers,
  Sprout,
  Droplets,
  Calendar,
  CheckCircle2,
  Plus,
  ShieldCheck,
  Compass,
  Clock,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Sun,
  ChevronRight,
  Warehouse,
} from 'lucide-react';
import { InquiryChatbotModal } from '../common/InquiryChatbotModal';

const CROP_OPTIONS = [
  'Tomato',
  'Small Onion (Shallots)',
  'Banana',
  'Paddy (Rice)',
  'Maize',
  'Groundnut',
  'Green Chilli',
  'Turmeric',
  'Cotton',
  'Papaya',
];

export const MyFarmView: React.FC = () => {
  const { currentUser, farmerProfile, showToast, setActiveFarmerTab } = useApp();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [fields, setFields] = useState<Field[]>([]);

  // Harvest Estimator State
  const [calcCrop, setCalcCrop] = useState('Tomato');
  const [calcSowingDate, setCalcSowingDate] = useState('2024-12-15');
  const [calcEstimate, setCalcEstimate] = useState<CropHarvestEstimate | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  useEffect(() => {
    Promise.all([api.getFarms(currentUser?.id || 'usr_farmer_1'), api.getFields()])
      .then(([f, fld]) => {
        setFarms(f);
        setFields(fld);
      })
      .catch(console.error);
  }, [currentUser]);

  // Run initial estimate
  useEffect(() => {
    runHarvestEstimate(calcCrop, calcSowingDate);
  }, [calcCrop, calcSowingDate]);

  const runHarvestEstimate = async (crop: string, sowingDate: string) => {
    setIsCalculating(true);
    try {
      const result = await api.getHarvestEstimate(crop, sowingDate);
      setCalcEstimate(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCalculating(false);
    }
  };

  const activeFarm = farms[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">My Farm Profile & Harvest Estimator</h2>
            <p className="text-xs text-stone-500">
              Survey plots, real-time crop stage tracking, and estimated harvest timeline schedules
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsInquiryModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Ask Admin About Harvest Logistics</span>
        </button>
      </div>

      {/* CROP HARVEST TIME ESTIMATOR & STAGE TRACKER */}
      <div className="bg-gradient-to-br from-white to-emerald-50/40 border border-emerald-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-emerald-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-700 text-white">
                Agronomic Engine
              </span>
              <span className="text-xs font-semibold text-emerald-900">TNAU Agrometeorology Model</span>
            </div>
            <h3 className="text-base font-bold text-stone-900 mt-1">
              Estimated Harvest Time & Crop Stage Tracker
            </h3>
          </div>

          {/* Sowing Date & Crop Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-0.5">Crop</label>
              <select
                value={calcCrop}
                onChange={(e) => setCalcCrop(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white font-semibold text-stone-800 focus:ring-2 focus:ring-emerald-500"
              >
                {CROP_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-0.5">Sowing Date</label>
              <input
                type="date"
                value={calcSowingDate}
                onChange={(e) => setCalcSowingDate(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white font-semibold text-stone-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Harvest Estimation Output Cards */}
        {calcEstimate && (
          <div className="space-y-4">
            {/* Key Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                <p className="text-stone-400 text-[10px] uppercase font-bold">Estimated Harvest Window</p>
                <p className="text-sm font-extrabold text-emerald-800 mt-0.5">
                  {calcEstimate.estimated_harvest_start} to {calcEstimate.estimated_harvest_end}
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {calcEstimate.maturity_days_range} Days Duration
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                <p className="text-stone-400 text-[10px] uppercase font-bold">Days Remaining</p>
                <p className="text-2xl font-black text-emerald-700 mt-0.5">
                  {calcEstimate.days_remaining} <span className="text-xs font-semibold text-stone-500">Days</span>
                </p>
                <p className="text-[10px] text-stone-500 mt-1">Elapsed: {calcEstimate.days_elapsed} Days</p>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                <p className="text-stone-400 text-[10px] uppercase font-bold">Current Growth Stage</p>
                <p className="text-sm font-bold text-stone-900 mt-0.5">{calcEstimate.current_stage}</p>
                <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                  Progress: {calcEstimate.stage_completion_percentage}%
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                <p className="text-stone-400 text-[10px] uppercase font-bold">Expected Yield (Per Acre)</p>
                <p className="text-sm font-extrabold text-amber-800 mt-0.5">{calcEstimate.expected_yield_per_acre}</p>
                <p className="text-[10px] text-stone-500 mt-1">Variety: {calcEstimate.variety}</p>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="bg-white p-4 rounded-xl border border-emerald-200 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                <span className="flex items-center gap-1.5">
                  <Sprout className="w-4 h-4 text-emerald-600" />
                  Crop Lifecycle Progress
                </span>
                <span className="text-emerald-700 font-extrabold">{calcEstimate.stage_completion_percentage}% Completed</span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(calcEstimate.stage_completion_percentage, 100)}%` }}
                />
              </div>

              {/* Milestone Markers */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-stone-100 text-[11px]">
                {calcEstimate.milestones.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg border ${
                      m.completed
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-stone-50 border-stone-200 text-stone-600'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>{m.stage}</span>
                      {m.completed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] opacity-80 mt-0.5">Day {m.day_offset} • {m.date}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Post Harvest Recommendation & Storage Notice */}
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-start space-x-3 text-xs text-blue-950">
              <Warehouse className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Post-Harvest Recommendation & Cold Chain Window:</strong>{' '}
                {calcEstimate.post_harvest_advice}
              </div>
            </div>

            {/* Link to Full Multi-Plot Growth Tracker */}
            <div className="p-4 bg-emerald-800 text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <span className="text-xl">🌱</span>
                <div>
                  <h4 className="text-xs font-bold text-white">Full Multi-Plot Stage & Task Tracker</h4>
                  <p className="text-[11px] text-emerald-200">Log custom planting dates per block, check off stage tasks, and track real-time maturity.</p>
                </div>
              </div>
              <button
                onClick={() => setActiveFarmerTab('crop-tracker')}
                className="px-3.5 py-1.5 bg-white text-emerald-950 hover:bg-emerald-50 rounded-lg text-xs font-bold transition-colors whitespace-nowrap"
              >
                Open Crop Growth Tracker →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FARM PROFILE CARD */}
      {activeFarm && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  Survey No: {activeFarm.survey_number}
                </span>
                <span className="text-xs text-stone-400">Total: {activeFarm.total_acres} Acres</span>
              </div>
              <h3 className="text-base font-bold text-stone-900 mt-1">{activeFarm.farm_name}</h3>
              <p className="text-xs text-stone-500 flex items-center space-x-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>
                  {activeFarm.village}, {activeFarm.taluk}, {activeFarm.district}
                </span>
              </p>
            </div>

            <div className="text-right text-xs">
              <span className="font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
                Primary Soil: {activeFarm.soil_type}
              </span>
            </div>
          </div>

          {/* Farm Attributes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <p className="text-stone-400 text-[10px] uppercase font-bold">Irrigation Method</p>
              <p className="font-bold text-stone-900 mt-0.5">{activeFarm.irrigation_type}</p>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <p className="text-stone-400 text-[10px] uppercase font-bold">Water Source</p>
              <p className="font-bold text-stone-900 mt-0.5">{activeFarm.water_source}</p>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <p className="text-stone-400 text-[10px] uppercase font-bold">GPS Coordinates</p>
              <p className="font-mono text-stone-900 text-[11px] mt-0.5">
                {activeFarm.latitude.toFixed(4)}°N, {activeFarm.longitude.toFixed(4)}°E
              </p>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <p className="text-stone-400 text-[10px] uppercase font-bold">Active Fields</p>
              <p className="font-bold text-emerald-700 mt-0.5">{fields.length} Sub-Plots</p>
            </div>
          </div>

          {/* Fields Sub-Plots List */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Sub-Field Plots</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {fields.map((fld) => (
                <div
                  key={fld.id}
                  onClick={() => {
                    setCalcCrop(fld.current_crop);
                    setCalcSowingDate(fld.sowing_date);
                    showToast(`Loaded timeline for Field: ${fld.field_name} (${fld.current_crop})`);
                  }}
                  className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 hover:border-emerald-500 hover:bg-white transition-all cursor-pointer space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-stone-900">{fld.field_name}</h5>
                    <span className="text-stone-500 font-semibold">{fld.area_acres} Acres</span>
                  </div>
                  <p className="text-emerald-800 font-bold">Active Crop: {fld.current_crop}</p>
                  <p className="text-stone-500">Stage: {fld.crop_stage} • Planted {fld.sowing_date}</p>
                  <p className="text-stone-500">Irrigation: {fld.irrigation_type}</p>
                  <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 pt-1">
                    <span>View Harvest Estimate</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Admin Inquiry Modal */}
      <InquiryChatbotModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        defaultCategory="GENERAL"
        initialContextPrompt="I have a question about my crop harvest timeline and warehouse booking coordination..."
      />
    </div>
  );
};
