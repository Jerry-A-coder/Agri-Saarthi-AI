import React from 'react';
import { FourSeasonSuccessionPlan } from '../../types';
import {
  Layers,
  ArrowRight,
  TrendingUp,
  Droplets,
  Sparkles,
  CheckCircle2,
  Calendar,
  DollarSign,
} from 'lucide-react';

interface FourSeasonSuccessionRoadmapProps {
  succession: FourSeasonSuccessionPlan;
}

export const FourSeasonSuccessionRoadmap: React.FC<FourSeasonSuccessionRoadmapProps> = ({
  succession,
}) => {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Title & Cumulative Gain Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-teal-100 text-teal-800">
              {succession.total_cycle_months}-Month Restorative Cycle
            </span>
            <span className="text-[11px] font-bold text-stone-500">
              Target Soil: {succession.target_soil_type}
            </span>
          </div>
          <h3 className="text-lg font-black text-stone-900 mt-1">{succession.cycle_title}</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Scientifically balanced succession to avoid mono-cropping depletion and build long-term soil carbon
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-right">
            <div className="text-[10px] font-bold uppercase text-emerald-800">Cumulative Net Profit</div>
            <div className="text-lg font-black text-emerald-700 leading-tight">
              ₹{succession.cumulative_estimated_net_profit.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold">Across all 4 seasons</div>
          </div>

          <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-right">
            <div className="text-[10px] font-bold uppercase text-teal-800">Bio Nitrogen Fixed</div>
            <div className="text-lg font-black text-teal-700 leading-tight">
              +{succession.nitrogen_fixation_total_kg_ha} kg/ha
            </div>
            <div className="text-[10px] text-teal-600 font-semibold">Root nodule accumulation</div>
          </div>
        </div>
      </div>

      {/* 4-Season Visual Pipeline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 relative">
        {succession.steps.map((step, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl border relative flex flex-col justify-between space-y-3 transition-all ${
              step.season_number === 2
                ? 'bg-gradient-to-b from-emerald-50 via-white to-white border-emerald-400 shadow-md ring-2 ring-emerald-500/20'
                : 'bg-stone-50/50 border-stone-200'
            }`}
          >
            {/* Step Top Badge */}
            <div className="flex items-center justify-between">
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                  step.season_number === 2
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                Phase {step.season_number} {step.season_number === 2 ? '(Next Recommended)' : ''}
              </span>
              <span className="text-xs font-black text-emerald-700">
                ₹{step.expected_net_profit_acre.toLocaleString('en-IN')}/ac
              </span>
            </div>

            {/* Crop Details */}
            <div>
              <div className="text-[11px] font-semibold text-stone-500 truncate">{step.season_name}</div>
              <h4 className="font-extrabold text-base text-stone-900 leading-snug mt-0.5">
                {step.crop_name}
              </h4>
              <p className="text-xs text-stone-500">{step.variety}</p>
            </div>

            {/* Water & Nitrogen Badges */}
            <div className="space-y-1 text-xs border-t border-stone-200/80 pt-2.5 text-stone-600">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center space-x-1">
                  <Droplets className="w-3 h-3 text-blue-500" />
                  <span>Water: <strong>{step.water_demand}</strong></span>
                </span>
                <span>{step.duration_days} Days</span>
              </div>

              {step.is_nitrogen_fixer ? (
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-900 text-[10px] font-bold flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-emerald-700" />
                  <span>Biological N-Fixer (Rhizobia)</span>
                </div>
              ) : (
                <div className="p-1.5 rounded-lg bg-stone-100 text-stone-600 text-[10px] font-medium">
                  High Biomass & Yield Crop
                </div>
              )}
            </div>

            {/* Soil Benefit summary */}
            <div className="p-2 rounded-xl bg-white border border-stone-200 text-[11px] text-stone-700 font-medium leading-relaxed">
              🌱 {step.soil_benefit}
            </div>
          </div>
        ))}
      </div>

      {/* Soil Health Improvement Banner */}
      <div className="p-4 rounded-xl bg-emerald-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-800 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-300">
              Integrated Soil Restoration Outcome
            </h4>
            <p className="text-xs text-emerald-100 mt-0.5 leading-relaxed">
              {succession.soil_health_improvement_summary}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
