import React, { useState } from 'react';
import {
  CropRotationRecommendation,
} from '../../types';
import {
  Sprout,
  ShieldCheck,
  Droplets,
  TrendingUp,
  Award,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Check,
} from 'lucide-react';

interface CropRotationCandidateCardProps {
  crop: CropRotationRecommendation;
  isTopPick?: boolean;
  onSelectAndSave: (crop: CropRotationRecommendation) => void;
  isSaved?: boolean;
}

export const CropRotationCandidateCard: React.FC<CropRotationCandidateCardProps> = ({
  crop,
  isTopPick,
  onSelectAndSave,
  isSaved,
}) => {
  const [expanded, setExpanded] = useState(isTopPick);

  const getVerdictStyle = (verdict: CropRotationRecommendation['verdict']) => {
    switch (verdict) {
      case 'STRONGLY_RECOMMENDED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'HIGHLY_SUITABLE':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'MODERATELY_VIABLE':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 75) return 'text-teal-700 bg-teal-50 border-teal-200';
    if (score >= 60) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  return (
    <div
      id={`crop-rec-${crop.id}`}
      className={`rounded-2xl border transition-all ${
        isTopPick
          ? 'bg-gradient-to-b from-emerald-50/40 via-white to-white border-emerald-300 shadow-sm ring-1 ring-emerald-400/30'
          : 'bg-white border-stone-200 shadow-xs hover:border-stone-300'
      } p-5 space-y-4`}
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border ${
              isTopPick
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                : 'bg-stone-100 text-stone-700 border-stone-200'
            }`}
          >
            #{crop.rank}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span
                className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getVerdictStyle(
                  crop.verdict
                )}`}
              >
                {crop.verdict.replace(/_/g, ' ')}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                {crop.crop_family}
              </span>
              {crop.soil_compatibility.nitrogen_net_change_kg_ha > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>+{crop.soil_compatibility.nitrogen_net_change_kg_ha} kg/ha N Fixation</span>
                </span>
              )}
            </div>
            <h3 className="text-lg font-extrabold text-stone-900 leading-tight">
              {crop.crop_name}
            </h3>
            <p className="text-xs text-stone-500 italic">{crop.scientific_name}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:self-start">
          <div
            className={`px-3 py-1.5 rounded-xl border text-center font-extrabold ${getScoreColor(
              crop.suitability_score
            )}`}
          >
            <div className="text-xs font-medium text-stone-500">Suitability</div>
            <div className="text-lg leading-tight font-black">{crop.suitability_score}%</div>
          </div>
        </div>
      </div>

      {/* Summary Rationale */}
      <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100">
        <strong>Agronomic Insight:</strong> {crop.summary_rationale}
      </p>

      {/* High-Level Key Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70">
          <div className="flex items-center space-x-1 text-stone-500 text-[11px] mb-0.5">
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            <span>Optimal Window</span>
          </div>
          <div className="font-bold text-stone-800 text-[12px] truncate">
            {crop.seasonal_fit.optimal_sowing_window}
          </div>
          <div className="text-[10px] text-stone-500">{crop.seasonal_fit.duration_days} Days duration</div>
        </div>

        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70">
          <div className="flex items-center space-x-1 text-stone-500 text-[11px] mb-0.5">
            <Droplets className="w-3.5 h-3.5 text-blue-500" />
            <span>Water Need</span>
          </div>
          <div className="font-bold text-stone-800 text-[12px]">
            {crop.seasonal_fit.water_requirement} Demand
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold">
            {crop.seasonal_fit.water_saving_vs_previous_crop_percent}% water saving
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70">
          <div className="flex items-center space-x-1 text-stone-500 text-[11px] mb-0.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Est. Net Profit</span>
          </div>
          <div className="font-extrabold text-emerald-700 text-[13px]">
            ₹{crop.economic_projection.net_profit_per_acre.toLocaleString('en-IN')}/acre
          </div>
          <div className="text-[10px] text-stone-500 font-medium">
            ROI: {crop.economic_projection.roi_percent}%
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70">
          <div className="flex items-center space-x-1 text-stone-500 text-[11px] mb-0.5">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Mandi Modal Price</span>
          </div>
          <div className="font-bold text-stone-800 text-[12px]">
            ₹{crop.economic_projection.mandi_modal_price_per_quintal.toLocaleString('en-IN')}/Q
          </div>
          <div className="text-[10px] text-stone-500">
            Yield ~{crop.economic_projection.estimated_yield_quintal_acre} Q/acre
          </div>
        </div>
      </div>

      {/* Recommended Varieties Chips */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
          Recommended High-Yielding Varieties:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {crop.recommended_varieties.map((v, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-lg bg-emerald-50/80 border border-emerald-200 text-emerald-800 text-xs font-semibold"
            >
              🌱 {v}
            </span>
          ))}
        </div>
      </div>

      {/* Expandable Agronomic In-Depth Details */}
      {expanded && (
        <div className="space-y-4 pt-3 border-t border-stone-100 text-xs">
          {/* Soil Compatibility & Biological Balance */}
          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-emerald-900 flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-emerald-700" />
                <span>Soil Nutrient Dynamics & Biological Impact</span>
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                Score: {crop.soil_compatibility.score}/100
              </span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-700">
              <li className="flex items-start space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Nitrogen:</strong> {crop.soil_compatibility.nitrogen_impact}</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>pH Match:</strong> {crop.soil_compatibility.ph_suitability}</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Phosphorus:</strong> {crop.soil_compatibility.phosphorus_tolerance}</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Organic Matter:</strong> {crop.soil_compatibility.organic_matter_contribution}</span>
              </li>
            </ul>
          </div>

          {/* Pathogen & Disease Disruption Panel */}
          <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-teal-900 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-700" />
                <span>Pathogen & Nematode Cycle Interruption</span>
              </span>
              <span className="text-[11px] font-bold text-teal-700 bg-white px-2 py-0.5 rounded-md border border-teal-200">
                Pest Break: {crop.pathogen_breakdown.pest_suppression_score}%
              </span>
            </div>
            <p className="text-stone-700">{crop.pathogen_breakdown.family_shift_benefit}</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase text-teal-800 self-center">Suppresses:</span>
              {crop.pathogen_breakdown.breaks_diseases.map((dis, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-white text-teal-800 text-[11px] font-medium border border-teal-200"
                >
                  ✓ {dis}
                </span>
              ))}
            </div>
          </div>

          {/* Recommended Field Practices */}
          <div className="space-y-1.5">
            <span className="font-bold text-stone-800 text-xs">Agronomic Best Management Practices:</span>
            <ul className="space-y-1 text-stone-600 text-xs">
              {crop.key_management_practices.map((practice, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-emerald-600 font-bold shrink-0">▸</span>
                  <span>{practice}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Green Manure & Residue Tip */}
          {crop.companion_or_green_manure_tip && (
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-start space-x-2">
              <span className="text-base leading-none">💡</span>
              <div>
                <strong>Soil Residue Advisory: </strong>
                {crop.companion_or_green_manure_tip}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-stone-100">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center space-x-1"
        >
          <span>{expanded ? 'Hide Technical Agronomy' : 'View In-Depth Soil & Disease Analysis'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <button
          type="button"
          onClick={() => onSelectAndSave(crop)}
          disabled={isSaved}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors ${
            isSaved
              ? 'bg-emerald-100 text-emerald-800 cursor-default'
              : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
          }`}
        >
          {isSaved ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Plan Adopted</span>
            </>
          ) : (
            <>
              <Bookmark className="w-3.5 h-3.5" />
              <span>Adopt as Next Crop</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
