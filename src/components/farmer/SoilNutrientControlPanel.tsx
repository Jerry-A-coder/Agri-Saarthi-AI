import React from 'react';
import {
  SoilNutrientProfile,
  SeasonalClimateParameters,
  SoilTest,
  Field,
} from '../../types';
import {
  FlaskConical,
  Sliders,
  Sparkles,
  RefreshCw,
  Droplets,
  Calendar,
  Layers,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

interface SoilNutrientControlPanelProps {
  soil: SoilNutrientProfile;
  onSoilChange: (soil: SoilNutrientProfile) => void;
  seasonal: SeasonalClimateParameters;
  onSeasonalChange: (seasonal: SeasonalClimateParameters) => void;
  availableSoilTests: SoilTest[];
  availableFields: Field[];
  selectedFieldId: string;
  onFieldSelect: (fieldId: string) => void;
  onRunAIEngine: () => void;
  isAiGenerating: boolean;
}

export const SoilNutrientControlPanel: React.FC<SoilNutrientControlPanelProps> = ({
  soil,
  onSoilChange,
  seasonal,
  onSeasonalChange,
  availableSoilTests,
  availableFields,
  selectedFieldId,
  onFieldSelect,
  onRunAIEngine,
  isAiGenerating,
}) => {
  const handleSoilTestSelect = (testId: string) => {
    const found = availableSoilTests.find((t) => t.id === testId);
    if (found) {
      onSoilChange({
        ...soil,
        soil_type: found.soil_type || soil.soil_type,
        ph: found.ph,
        organic_carbon_percent: found.organic_carbon_percent,
        nitrogen_kg_ha: found.nitrogen_kg_ha,
        nitrogen_status: found.nitrogen_status,
        phosphorus_kg_ha: found.phosphorus_kg_ha,
        phosphorus_status: found.phosphorus_status,
        potassium_kg_ha: found.potassium_kg_ha,
        potassium_status: found.potassium_status,
        ec_ds_m: found.ec_ds_m,
        zinc_ppm: found.zinc_ppm,
        iron_ppm: found.iron_ppm,
        boron_ppm: found.boron_ppm,
        source_soil_test_id: found.id,
        source_sample_code: found.sample_code,
      });
      if (found.field_id) {
        onFieldSelect(found.field_id);
      }
    }
  };

  const getStatusBadge = (status: 'Low' | 'Medium' | 'High') => {
    switch (status) {
      case 'Low':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Medium':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'High':
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-stone-900 text-sm sm:text-base">
              Soil Nutrient Profile & Regional Climate Input
            </h3>
            <p className="text-xs text-stone-500">
              Synchronized with lab Soil Health Card & agro-climatic seasonal parameters
            </p>
          </div>
        </div>

        {/* Quick Sync Dropdown */}
        {availableSoilTests.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-stone-500 font-medium">Load Soil Card:</span>
            <select
              value={soil.source_soil_test_id || ''}
              onChange={(e) => handleSoilTestSelect(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-xl border border-stone-300 bg-stone-50 font-bold text-stone-800"
            >
              <option value="">-- Select Lab Report --</option>
              {availableSoilTests.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.sample_code} ({t.soil_type || 'Red Loam'} - pH {t.ph})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Grid: Left = Soil Nutrients, Right = Seasonal & Standing Crop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Soil Health Card Metrics */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-stone-700 flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Current Soil Chemistry (NPK & pH)</span>
            </span>
            <span className="text-[11px] text-stone-500 italic">
              {soil.source_sample_code ? `Ref: ${soil.source_sample_code}` : 'Custom Values'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            {/* Soil Type */}
            <div className="col-span-2 sm:col-span-3">
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                Soil Classification
              </label>
              <select
                value={soil.soil_type}
                onChange={(e) => onSoilChange({ ...soil, soil_type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium"
              >
                <option value="Red Sandy Loam">Red Sandy Loam</option>
                <option value="Black Clayey Soil (Regur)">Black Clayey Soil (Regur)</option>
                <option value="Alluvial Loam">Alluvial Loam</option>
                <option value="Laterite Acidic Soil">Laterite Acidic Soil</option>
                <option value="Coastal Saline Sandy Loam">Coastal Saline Sandy Loam</option>
              </select>
            </div>

            {/* pH */}
            <div className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/50">
              <label className="block text-[10px] font-bold text-stone-500 uppercase">
                Soil pH Level
              </label>
              <div className="flex items-center space-x-1.5 mt-1">
                <input
                  type="number"
                  step="0.1"
                  min="4.0"
                  max="9.5"
                  value={soil.ph}
                  onChange={(e) =>
                    onSoilChange({ ...soil, ph: parseFloat(e.target.value) || 7.0 })
                  }
                  className="w-16 px-2 py-1 rounded-lg border border-stone-300 text-xs font-bold text-stone-800 bg-white"
                />
                <span className="text-[11px] font-semibold text-stone-600">
                  {soil.ph < 6.5 ? 'Acidic' : soil.ph > 7.5 ? 'Alkaline' : 'Ideal'}
                </span>
              </div>
            </div>

            {/* Organic Carbon */}
            <div className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/50">
              <label className="block text-[10px] font-bold text-stone-500 uppercase">
                Organic Carbon (OC)
              </label>
              <div className="flex items-center space-x-1.5 mt-1">
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="2.5"
                  value={soil.organic_carbon_percent}
                  onChange={(e) =>
                    onSoilChange({
                      ...soil,
                      organic_carbon_percent: parseFloat(e.target.value) || 0.5,
                    })
                  }
                  className="w-16 px-2 py-1 rounded-lg border border-stone-300 text-xs font-bold text-stone-800 bg-white"
                />
                <span className="text-[11px] font-semibold text-stone-600">%</span>
              </div>
            </div>

            {/* Nitrogen */}
            <div className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/50">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-bold text-stone-500 uppercase">
                  Nitrogen (N)
                </label>
                <span
                  className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${getStatusBadge(
                    soil.nitrogen_status
                  )}`}
                >
                  {soil.nitrogen_status}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 mt-1">
                <input
                  type="number"
                  value={soil.nitrogen_kg_ha}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    onSoilChange({
                      ...soil,
                      nitrogen_kg_ha: val,
                      nitrogen_status: val < 240 ? 'Low' : val > 380 ? 'High' : 'Medium',
                    });
                  }}
                  className="w-20 px-2 py-1 rounded-lg border border-stone-300 text-xs font-bold text-stone-800 bg-white"
                />
                <span className="text-[10px] text-stone-500 font-medium">kg/ha</span>
              </div>
            </div>

            {/* Phosphorus */}
            <div className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/50">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-bold text-stone-500 uppercase">
                  Phosphorus (P)
                </label>
                <span
                  className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${getStatusBadge(
                    soil.phosphorus_status
                  )}`}
                >
                  {soil.phosphorus_status}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 mt-1">
                <input
                  type="number"
                  step="0.5"
                  value={soil.phosphorus_kg_ha}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    onSoilChange({
                      ...soil,
                      phosphorus_kg_ha: val,
                      phosphorus_status: val < 15 ? 'Low' : val > 30 ? 'High' : 'Medium',
                    });
                  }}
                  className="w-20 px-2 py-1 rounded-lg border border-stone-300 text-xs font-bold text-stone-800 bg-white"
                />
                <span className="text-[10px] text-stone-500 font-medium">kg/ha</span>
              </div>
            </div>

            {/* Potassium */}
            <div className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/50">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-bold text-stone-500 uppercase">
                  Potassium (K)
                </label>
                <span
                  className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${getStatusBadge(
                    soil.potassium_status
                  )}`}
                >
                  {soil.potassium_status}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 mt-1">
                <input
                  type="number"
                  value={soil.potassium_kg_ha}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    onSoilChange({
                      ...soil,
                      potassium_kg_ha: val,
                      potassium_status: val < 140 ? 'Low' : val > 280 ? 'High' : 'Medium',
                    });
                  }}
                  className="w-20 px-2 py-1 rounded-lg border border-stone-300 text-xs font-bold text-stone-800 bg-white"
                />
                <span className="text-[10px] text-stone-500 font-medium">kg/ha</span>
              </div>
            </div>

            {/* Electrical Conductivity */}
            <div className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/50">
              <label className="block text-[10px] font-bold text-stone-500 uppercase">
                Salinity / EC
              </label>
              <div className="flex items-center space-x-1.5 mt-1">
                <input
                  type="number"
                  step="0.05"
                  value={soil.ec_ds_m || 0.42}
                  onChange={(e) =>
                    onSoilChange({ ...soil, ec_ds_m: parseFloat(e.target.value) || 0.4 })
                  }
                  className="w-16 px-2 py-1 rounded-lg border border-stone-300 text-xs font-bold text-stone-800 bg-white"
                />
                <span className="text-[10px] text-stone-500">dS/m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Seasonal Trends & Standing Crop Setup */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-stone-700 flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              <span>Standing Crop & Regional Season Parameters</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Standing Crop */}
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                Current Standing / Prior Crop
              </label>
              <select
                value={seasonal.current_standing_crop}
                onChange={(e) =>
                  onSeasonalChange({
                    ...seasonal,
                    current_standing_crop: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium"
              >
                <option value="Tomato">Tomato (Solanaceae - Heavy N/K Drain)</option>
                <option value="Chilli">Chilli (Solanaceae - Potash / Blight Risk)</option>
                <option value="Brinjal">Brinjal (Solanaceae - Borer / Wilt Risk)</option>
                <option value="Maize">Maize (Poaceae - Heavy N / Armyworm)</option>
                <option value="Paddy">Paddy (Poaceae - Hardpan / Blast Risk)</option>
                <option value="Cotton">Cotton (Malvaceae - Deep Taproot / Potash)</option>
                <option value="Turmeric">Turmeric (Zingiberaceae - 8-9 Mo Potash)</option>
                <option value="Groundnut">Groundnut (Fabaceae - Calcium / Pods)</option>
                <option value="Sugarcane">Sugarcane (Poaceae - Heavy 12-Mo Drain)</option>
                <option value="Onion">Onion (Alliaceae - Shallow Sulfur)</option>
              </select>
            </div>

            {/* Target Season */}
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                Target Next Sowing Season
              </label>
              <select
                value={seasonal.target_season}
                onChange={(e) =>
                  onSeasonalChange({
                    ...seasonal,
                    target_season: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium"
              >
                <option value="Kharif (Monsoon)">Kharif (Monsoon: Jun - Oct)</option>
                <option value="Rabi (Winter/Post-Monsoon)">
                  Rabi (Winter/Post-Monsoon: Nov - Feb)
                </option>
                <option value="Zaid (Summer)">Zaid (Summer: Mar - May)</option>
              </select>
            </div>

            {/* Expected Rainfall Trend */}
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                Expected Rainfall Trend
              </label>
              <select
                value={seasonal.expected_rainfall_trend}
                onChange={(e) =>
                  onSeasonalChange({
                    ...seasonal,
                    expected_rainfall_trend: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium"
              >
                <option value="Normal Monsoon">Normal Seasonal Monsoon</option>
                <option value="Deficit">Deficit / Drought Risk (-25%)</option>
                <option value="Heavy / Excess">Heavy / Excess Showers (+30%)</option>
                <option value="Dry Summer">Dry High-Heat Summer</option>
              </select>
            </div>

            {/* Water Source & Capacity */}
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                Water Source & Capacity
              </label>
              <select
                value={seasonal.water_source}
                onChange={(e) =>
                  onSeasonalChange({
                    ...seasonal,
                    water_source: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium"
              >
                <option value="Borewell + Drip Irrigation">Borewell + Drip (High Efficiency)</option>
                <option value="Canal / Flood Irrigation">Canal / Surface Flood (Medium)</option>
                <option value="Rainfed (Monsoon Dependent)">Rainfed (Deficit / Low)</option>
                <option value="Open Well + Sprinklers">Open Well + Sprinklers</option>
              </select>
            </div>

            {/* Optimization Priority Focus */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                Strategic Agronomic Priority
              </label>
              <select
                value={seasonal.priority_focus}
                onChange={(e) =>
                  onSeasonalChange({
                    ...seasonal,
                    priority_focus: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-bold text-emerald-900"
              >
                <option value="BALANCED">⚖️ Balanced: Soil Restoration + Stable Profit</option>
                <option value="MAX_SOIL_HEALTH">
                  🌱 Maximize Soil Health & Biological Nitrogen Fixation
                </option>
                <option value="MAX_PROFIT">💰 Maximize Net Profit & ROI (Mandi Economics)</option>
                <option value="WATER_SAVING">
                  💧 Water Conservation & Drought Resilience (Low Demand)
                </option>
                <option value="PEST_BREAK">
                  🛡️ Pathogen, Wilt & Nematode Cleanse (Strict Family Shift)
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Run AI Advisor Trigger Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-stone-100">
        <div className="text-xs text-stone-500 flex items-center space-x-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Recommendations dynamically recalculated based on NPK depletion and botanical family
            succession.
          </span>
        </div>

        <button
          type="button"
          onClick={onRunAIEngine}
          disabled={isAiGenerating}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-xs transition-colors disabled:opacity-60"
        >
          {isAiGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing Soil & Seasonal Data...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Run Gemini 3.7 AI Crop Advisor</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
