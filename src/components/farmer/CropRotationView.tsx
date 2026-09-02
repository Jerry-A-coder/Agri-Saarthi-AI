import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  CropRotationAdvisorResponse,
  CropRotationRecommendation,
  CropRotationPlan,
  SoilNutrientProfile,
  SeasonalClimateParameters,
  SoilTest,
  Field,
} from '../../types';
import { SoilNutrientControlPanel } from './SoilNutrientControlPanel';
import { CropRotationCandidateCard } from './CropRotationCandidateCard';
import { FourSeasonSuccessionRoadmap } from './FourSeasonSuccessionRoadmap';
import {
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Layers,
  Calendar,
  CheckCircle2,
  Bookmark,
  TrendingUp,
  RefreshCw,
  Info,
  Droplets,
  Sprout,
  ShieldAlert,
} from 'lucide-react';

export const CropRotationView: React.FC = () => {
  const { farmerProfile, showToast } = useApp();

  // Active View Tab: 'ADVISOR' | 'SUCCESSION' | 'SAVED_PLANS'
  const [activeTab, setActiveTab] = useState<'ADVISOR' | 'SUCCESSION' | 'SAVED_PLANS'>('ADVISOR');

  // Soil & Seasonal States
  const [soil, setSoil] = useState<SoilNutrientProfile>({
    soil_type: farmerProfile?.soil_type || 'Red Sandy Loam',
    ph: 6.8,
    organic_carbon_percent: 0.58,
    nitrogen_kg_ha: 210,
    nitrogen_status: 'Low',
    phosphorus_kg_ha: 19.5,
    phosphorus_status: 'Medium',
    potassium_kg_ha: 265,
    potassium_status: 'Medium',
    ec_ds_m: 0.42,
    zinc_ppm: 0.82,
    iron_ppm: 5.1,
    boron_ppm: 0.48,
    source_sample_code: 'SHC-TN-CBE-2025-901',
  });

  const [seasonal, setSeasonal] = useState<SeasonalClimateParameters>({
    current_standing_crop: farmerProfile?.primary_crops?.[0] || 'Tomato',
    standing_crop_family: 'Solanaceae (Nightshade)',
    target_season: 'Kharif (Monsoon)',
    region_agro_climatic_zone: 'Southern Semi-Arid Agro-Zone (Tamil Nadu / Western Ghats Rainshadow)',
    expected_rainfall_trend: 'Normal Monsoon',
    water_source: 'Borewell + Drip Irrigation',
    irrigation_capacity: 'Medium',
    priority_focus: 'BALANCED',
  });

  const [selectedFieldId, setSelectedFieldId] = useState<string>('fld_1');
  const [availableSoilTests, setAvailableSoilTests] = useState<SoilTest[]>([]);
  const [availableFields, setAvailableFields] = useState<Field[]>([]);
  const [savedPlans, setSavedPlans] = useState<CropRotationPlan[]>([]);

  // Advisor Data Output
  const [advisorData, setAdvisorData] = useState<CropRotationAdvisorResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [adoptedCropIds, setAdoptedCropIds] = useState<string[]>([]);

  // 1. Initial Data Fetching
  const loadInitialData = useCallback(async () => {
    try {
      const [tests, fields, plans] = await Promise.all([
        api.getSoilTests(farmerProfile?.user_id || 'usr_farmer_1'),
        api.getFields(),
        api.getCropRotations(),
      ]);

      setAvailableSoilTests(tests || []);
      setAvailableFields(fields || []);
      setSavedPlans(plans || []);

      // If soil tests exist, load the latest one
      if (tests && tests.length > 0) {
        const latest = tests[0];
        setSoil({
          soil_type: latest.soil_type || 'Red Sandy Loam',
          ph: latest.ph || 6.8,
          organic_carbon_percent: latest.organic_carbon_percent || 0.58,
          nitrogen_kg_ha: latest.nitrogen_kg_ha || 210,
          nitrogen_status: latest.nitrogen_status || 'Low',
          phosphorus_kg_ha: latest.phosphorus_kg_ha || 19.5,
          phosphorus_status: latest.phosphorus_status || 'Medium',
          potassium_kg_ha: latest.potassium_kg_ha || 265,
          potassium_status: latest.potassium_status || 'Medium',
          ec_ds_m: latest.ec_ds_m || 0.42,
          zinc_ppm: latest.zinc_ppm,
          iron_ppm: latest.iron_ppm,
          boron_ppm: latest.boron_ppm,
          source_soil_test_id: latest.id,
          source_sample_code: latest.sample_code,
        });
      }
    } catch (err) {
      console.error('Failed to load soil test data:', err);
    }
  }, [farmerProfile]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // 2. Fetch Advisor Recommendations when soil or seasonal parameters change
  const fetchAdvisory = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.getCropRotationAdvisory({
        fieldId: selectedFieldId,
        farmerId: farmerProfile?.user_id || 'usr_farmer_1',
        soilType: soil.soil_type,
        ph: soil.ph,
        nitrogenKgHa: soil.nitrogen_kg_ha,
        phosphorusKgHa: soil.phosphorus_kg_ha,
        potassiumKgHa: soil.potassium_kg_ha,
        organicCarbonPercent: soil.organic_carbon_percent,
        currentCrop: seasonal.current_standing_crop,
        targetSeason: seasonal.target_season,
        expectedRainfall: seasonal.expected_rainfall_trend,
        waterSource: seasonal.water_source,
        irrigationCapacity: seasonal.irrigation_capacity,
        priorityFocus: seasonal.priority_focus,
      });

      if (res) {
        setAdvisorData(res);
      }
    } catch (err) {
      console.error('Advisory fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFieldId, farmerProfile, soil, seasonal]);

  useEffect(() => {
    fetchAdvisory();
  }, [fetchAdvisory]);

  // 3. Gemini 3.7 Flash Advanced AI Generation
  const handleRunAIAdvisory = async () => {
    setIsAiGenerating(true);
    try {
      const res = await api.generateCropRotationAIAdvisor({
        soil,
        seasonal,
        fieldAreaAcres: farmerProfile?.land_area_acres || 6.5,
      });

      if (res && res.data) {
        setAdvisorData(res.data);
        showToast(
          res.source === 'GEMINI_3.7_FLASH'
            ? '✨ AI Agronomic Advisory generated with Gemini 3.7 Flash!'
            : 'Advisory updated based on latest soil nutrients & seasonal trends.'
        );
      }
    } catch (err) {
      showToast('AI generation failed. Fallback agronomic engine engaged.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  // 4. Adopt & Save Crop Rotation Plan
  const handleAdoptPlan = async (crop: CropRotationRecommendation) => {
    try {
      const planName = `${crop.crop_name} Restorative Rotation (Post-${seasonal.current_standing_crop})`;
      const saved = await api.saveCropRotationPlan({
        fieldId: selectedFieldId,
        farmerId: farmerProfile?.user_id || 'usr_farmer_1',
        planName,
        currentCrop: seasonal.current_standing_crop,
        soilTypeTarget: soil.soil_type,
        recommendedSequence: advisorData?.succession_cycle.steps.map((s) => ({
          season: s.season_name,
          crop: s.crop_name,
          variety: s.variety,
          nitrogen_fixation: s.is_nitrogen_fixer,
          water_requirement: s.water_demand,
          soil_benefit: s.soil_benefit,
          pest_break_effect: crop.pathogen_breakdown.family_shift_benefit,
          estimated_profit_per_acre: s.expected_net_profit_acre,
        })),
        rationale: crop.summary_rationale,
      });

      if (saved) {
        setSavedPlans((prev) => [saved, ...prev]);
        setAdoptedCropIds((prev) => [...prev, crop.id]);
        showToast(`🌱 "${crop.crop_name}" adopted as next crop for ${selectedFieldId}!`);
      }
    } catch (err) {
      showToast('Failed to save crop rotation plan.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-black text-stone-900">
                Intelligent Crop Rotation & Soil Health Advisor
              </h2>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                AI + Soil NPK Engine
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Recommends the next best crop to plant based on real-time soil nutrient data, botanical family pathogen interruption, and regional climate trends.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('ADVISOR')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'ADVISOR'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Recommended Next Crops
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SUCCESSION')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'SUCCESSION'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            4-Season Roadmap
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SAVED_PLANS')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'SAVED_PLANS'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Saved Field Plans ({savedPlans.length})
          </button>
        </div>
      </div>

      {/* Soil Nutrient & Seasonal Control Panel */}
      <SoilNutrientControlPanel
        soil={soil}
        onSoilChange={setSoil}
        seasonal={seasonal}
        onSeasonalChange={setSeasonal}
        availableSoilTests={availableSoilTests}
        availableFields={availableFields}
        selectedFieldId={selectedFieldId}
        onFieldSelect={setSelectedFieldId}
        onRunAIEngine={handleRunAIAdvisory}
        isAiGenerating={isAiGenerating}
      />

      {/* Standing Crop Depletion & Pathogen Warning Banner */}
      {advisorData?.standing_crop_summary && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="text-xs space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-amber-900">
                  Standing Crop Exhaustion: {advisorData.standing_crop_summary.crop_name} (
                  {advisorData.standing_crop_summary.family})
                </span>
              </div>
              <p className="text-amber-900">
                <strong>Soil Depletion:</strong> {advisorData.standing_crop_summary.depletion_profile}
              </p>
              <p className="text-amber-800 text-[11px]">
                <strong>Pathogen Risk If Repeated:</strong>{' '}
                {advisorData.standing_crop_summary.pathogen_risk_if_repeated}
              </p>
            </div>
          </div>

          <div className="shrink-0 bg-white/80 px-3 py-2 rounded-xl border border-amber-200 text-center">
            <span className="text-[10px] uppercase font-bold text-amber-800 block">
              Soil NPK State
            </span>
            <span className="text-xs font-black text-amber-950">
              N: {advisorData.soil_status_analyzed.nitrogen_status} • P:{' '}
              {advisorData.soil_status_analyzed.phosphorus_status} • K:{' '}
              {advisorData.soil_status_analyzed.potassium_status}
            </span>
          </div>
        </div>
      )}

      {/* AI Agronomic Advisory Paragraph */}
      {advisorData?.ai_agronomic_advisory && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white shadow-xs flex items-start space-x-3.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-700/80 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
              AI Agronomist Synthesis (ICAR / TNAU Scientific Guidelines)
            </span>
            <p className="text-emerald-50 leading-relaxed font-medium">
              {advisorData.ai_agronomic_advisory}
            </p>
          </div>
        </div>
      )}

      {/* Tab 1: Recommended Next Crops */}
      {activeTab === 'ADVISOR' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-stone-900 text-base flex items-center space-x-2">
              <Sprout className="w-5 h-5 text-emerald-700" />
              <span>Ranked Best Next Crops for {seasonal.target_season}</span>
            </h3>
            <span className="text-xs text-stone-500">
              Ranked by biological synergy, soil restoration & market yield
            </span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center bg-white border border-stone-200 rounded-2xl space-y-3">
              <RefreshCw className="w-7 h-7 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs text-stone-600 font-semibold">
                Calculating multi-factor crop suitability & soil NPK balance...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {advisorData?.top_recommendations.map((crop, idx) => (
                <CropRotationCandidateCard
                  key={crop.id || idx}
                  crop={crop}
                  isTopPick={idx === 0}
                  onSelectAndSave={handleAdoptPlan}
                  isSaved={adoptedCropIds.includes(crop.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: 4-Season Succession Roadmap */}
      {activeTab === 'SUCCESSION' && advisorData?.succession_cycle && (
        <FourSeasonSuccessionRoadmap succession={advisorData.succession_cycle} />
      )}

      {/* Tab 3: Saved Rotation Plans */}
      {activeTab === 'SAVED_PLANS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-stone-900 text-base">
              Saved Field Crop Rotation Schedules
            </h3>
            <span className="text-xs text-stone-500">
              Active succession cycles tracked for your agricultural holdings
            </span>
          </div>

          {savedPlans.length === 0 ? (
            <div className="p-12 text-center bg-white border border-stone-200 rounded-2xl space-y-3">
              <RotateCcw className="w-8 h-8 text-stone-400 mx-auto" />
              <p className="text-xs text-stone-600 font-medium">
                No saved rotation plans yet. Select a recommended crop in the Advisor tab and click
                "Adopt as Next Crop" to save a sequence.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {savedPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Field #{plan.field_id}
                        </span>
                        <span className="text-xs text-stone-500">
                          Created {new Date(plan.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-base text-stone-900 mt-1">
                        {plan.plan_name}
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200 self-start sm:self-auto">
                      Target Soil: {plan.soil_type_target}
                    </span>
                  </div>

                  {plan.rationale && (
                    <p className="text-xs text-stone-600 italic">
                      <strong>Agronomic Rationale:</strong> {plan.rationale}
                    </p>
                  )}

                  {/* Sequence steps */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    {(plan.recommended_sequence || []).map((step, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1"
                      >
                        <div className="text-[10px] font-bold uppercase text-stone-500">
                          {step.season}
                        </div>
                        <div className="font-bold text-stone-900 text-sm">{step.crop}</div>
                        <div className="text-[11px] text-stone-500">{step.variety}</div>
                        <div className="text-[11px] text-emerald-700 font-semibold pt-1">
                          ₹{step.estimated_profit_per_acre.toLocaleString('en-IN')}/acre net
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
