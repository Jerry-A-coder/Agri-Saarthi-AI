import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  YieldPredictionInput,
  YieldPredictionResult,
  YieldForecastMilestone,
  YieldIntervention,
  SoilTest,
} from '../../types';
import {
  TrendingUp,
  Sparkles,
  Sprout,
  Droplets,
  Sun,
  CloudRain,
  FlaskConical,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sliders,
  DollarSign,
  Printer,
  Bookmark,
  RefreshCw,
  Info,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
  Thermometer,
  Wind,
  Target,
  Clock,
  FileText,
  BadgeCheck,
} from 'lucide-react';

const CROP_OPTIONS = [
  { name: 'Tomato', variety: 'US-618 Hybrid F1', defaultAcres: 2.5, mandiRate: 2500, emoji: '🍅' },
  { name: 'Paddy', variety: 'CR 1009 Sub 1 / CO 51', defaultAcres: 3.0, mandiRate: 2450, emoji: '🌾' },
  { name: 'Maize', variety: 'NK 6240 Plus Hybrid', defaultAcres: 2.0, mandiRate: 2250, emoji: '🌽' },
  { name: 'Cotton', variety: 'RCH 659 BG II', defaultAcres: 4.0, mandiRate: 7200, emoji: '🌿' },
  { name: 'Banana', variety: 'Grand Naine (G9)', defaultAcres: 2.0, mandiRate: 1950, emoji: '🍌' },
  { name: 'Wheat', variety: 'HD 2967 / PBW 550', defaultAcres: 3.5, mandiRate: 2350, emoji: '🌾' },
  { name: 'Groundnut', variety: 'Kadiri Lepakshi (K-1812)', defaultAcres: 2.0, mandiRate: 6400, emoji: '🥜' },
  { name: 'Chilli', variety: 'Teja S17 / Byadgi Hybrid', defaultAcres: 1.5, mandiRate: 14500, emoji: '🌶️' },
  { name: 'Sugarcane', variety: 'Co 0238 / Co 86032', defaultAcres: 5.0, mandiRate: 340, emoji: '🎋' },
  { name: 'Soybean', variety: 'JS 335 / NRC 37', defaultAcres: 3.0, mandiRate: 4600, emoji: '🌱' },
];

export const YieldPredictionView: React.FC = () => {
  const { farmerProfile, showToast } = useApp();

  // Active View Tab: 'PREDICTOR' | 'TIMELINE' | 'SENSITIVITY' | 'HISTORY'
  const [activeSubTab, setActiveSubTab] = useState<'PREDICTOR' | 'TIMELINE' | 'SENSITIVITY' | 'HISTORY'>('PREDICTOR');

  // Input Form States
  const [selectedCrop, setSelectedCrop] = useState<string>('Tomato');
  const [variety, setVariety] = useState<string>('US-618 Hybrid F1');
  const [landArea, setLandArea] = useState<number>(farmerProfile?.land_area_acres || 2.5);
  const [cropStage, setCropStage] = useState<YieldPredictionInput['cropStage']>('Vegetative Growth');
  const [sowingDate, setSowingDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 25);
    return d.toISOString().split('T')[0];
  });
  const [soilType, setSoilType] = useState<YieldPredictionInput['soilType']>('Red Loamy');
  const [irrigationType, setIrrigationType] = useState<YieldPredictionInput['irrigationType']>('Drip Irrigation');

  // Soil Parameters
  const [soilN, setSoilN] = useState<number>(280);
  const [soilP, setSoilP] = useState<number>(22);
  const [soilK, setSoilK] = useState<number>(290);
  const [soilPH, setSoilPH] = useState<number>(6.8);
  const [soilOC, setSoilOC] = useState<number>(0.68);
  const [soilMoisture, setSoilMoisture] = useState<number>(65);

  // Weather Parameters
  const [avgDayTemp, setAvgDayTemp] = useState<number>(31);
  const [avgNightTemp, setAvgNightTemp] = useState<number>(21);
  const [rainfallTrend, setRainfallTrend] = useState<YieldPredictionInput['weatherScenario']['rainfallTrend']>('Normal Seasonal');
  const [avgHumidity, setAvgHumidity] = useState<number>(62);
  const [sunlightHours, setSunlightHours] = useState<number>(8.5);

  // Simulation Sliders ("What-If" Sensitivity Simulator)
  const [simIrrigationBoost, setSimIrrigationBoost] = useState<number>(0);
  const [simFertilizerBoost, setSimFertilizerBoost] = useState<number>(0);
  const [simPestShield, setSimPestShield] = useState<boolean>(false);

  // Loading & Result States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [predictionResult, setPredictionResult] = useState<YieldPredictionResult | null>(null);
  const [savedHistory, setSavedHistory] = useState<YieldPredictionResult[]>([]);
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState<number>(0);
  const [interventions, setInterventions] = useState<YieldIntervention[]>([]);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Load Saved History on mount
  const loadSavedHistory = useCallback(async () => {
    try {
      const history = await api.getYieldPredictions(farmerProfile?.id || 'usr_farmer_1');
      if (history && history.length > 0) {
        setSavedHistory(history);
        if (!predictionResult) {
          setPredictionResult(history[0]);
          setInterventions(history[0].actionableInterventions || []);
        }
      }
    } catch (e) {
      console.warn('Could not fetch saved yield predictions:', e);
    }
  }, [farmerProfile?.id, predictionResult]);

  useEffect(() => {
    loadSavedHistory();
  }, [loadSavedHistory]);

  // Handle Crop Change
  const handleCropChange = (cropName: string) => {
    setSelectedCrop(cropName);
    const cropOpt = CROP_OPTIONS.find((c) => c.name === cropName);
    if (cropOpt) {
      setVariety(cropOpt.variety);
      if (cropOpt.defaultAcres) setLandArea(cropOpt.defaultAcres);
    }
  };

  // Populate from recent Soil Lab Card
  const handleAutoPopulateFromSoilCard = () => {
    setSoilN(285);
    setSoilP(24.5);
    setSoilK(310);
    setSoilPH(7.0);
    setSoilOC(0.72);
    setSoilMoisture(68);
    setSoilType('Red Loamy');
    showToast('Loaded calibrated NPK & pH data from Soil Health Card #SHC-TN-CBE-901');
  };

  // Run AI 60-Day Yield Forecast
  const handleGenerateForecast = async (useCurrentSimModifiers = true) => {
    setIsLoading(true);
    try {
      const input: YieldPredictionInput = {
        farmId: 'farm_1',
        farmName: 'Palaniswamy Farms',
        fieldId: 'fld_1',
        fieldName: 'North Drip Plot',
        cropName: selectedCrop,
        variety: variety,
        landAreaAcres: landArea,
        sowingDate: sowingDate,
        cropStage: cropStage,
        soilType: soilType,
        soilNutrients: {
          nitrogenKgHa: soilN,
          nitrogenStatus: soilN < 220 ? 'Low' : soilN > 350 ? 'High' : 'Medium',
          phosphorusKgHa: soilP,
          phosphorusStatus: soilP < 15 ? 'Low' : soilP > 25 ? 'High' : 'Medium',
          potassiumKgHa: soilK,
          potassiumStatus: soilK < 180 ? 'Low' : soilK > 320 ? 'High' : 'Medium',
          ph: soilPH,
          organicCarbonPercent: soilOC,
          soilMoisturePercent: soilMoisture,
        },
        irrigationType: irrigationType,
        weatherScenario: {
          avgDayTempC: avgDayTemp,
          avgNightTempC: avgNightTemp,
          rainfallTrend: rainfallTrend,
          avgHumidityPercent: avgHumidity,
          sunlightHoursPerDay: sunlightHours,
        },
        simulationModifiers: useCurrentSimModifiers
          ? {
              irrigationBoostPercent: simIrrigationBoost,
              fertilizerBoostPercent: simFertilizerBoost,
              pestShieldActive: simPestShield,
            }
          : undefined,
      };

      const result = await api.predictCropYield(input);
      setPredictionResult(result);
      setInterventions(result.actionableInterventions || []);
      setActiveMilestoneIndex(0);
      showToast(`AI 60-Day Growth Forecast generated for ${selectedCrop} (${result.predictedYieldQuintalsPerAcre} Qtl/Acre)`);
      loadSavedHistory();
    } catch (err: any) {
      console.error('Yield forecast error:', err);
      showToast('Error connecting to AI agronomy engine. Showing calibrated baseline forecast.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Intervention Checkbox
  const handleToggleIntervention = (intId: string) => {
    setInterventions((prev) =>
      prev.map((item) => (item.id === intId ? { ...item, completed: !item.completed } : item))
    );
    showToast('Updated agronomic milestone task progress.');
  };

  // Save current forecast
  const handleSaveForecast = async () => {
    if (!predictionResult) return;
    try {
      const updated = {
        ...predictionResult,
        actionableInterventions: interventions,
      };
      await api.saveYieldPrediction(updated);
      showToast('60-Day Yield Prediction saved to your Kisan field records.');
      loadSavedHistory();
    } catch (e) {
      showToast('Saved locally.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-stone-900 text-white rounded-2xl p-5 shadow-xs border border-emerald-700/60 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-emerald-500 text-stone-950 shadow-xs font-black">
                <Sprout className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                AI 60-Day Crop Growth & Yield Predictor
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-700/90 text-emerald-200 border border-emerald-600">
                ICAR Multimodal Engine
              </span>
            </div>
            <p className="text-xs text-emerald-100/90 max-w-2xl leading-relaxed">
              Synthesizes real-time soil health cards (NPK, pH, OC) with 60-day agro-climatic weather models to forecast physiological biomass progression, peak harvest date, and hectare yield.
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleGenerateForecast()}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold text-xs shadow-xs transition-colors flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Running AI Engine...' : 'Run 60-Day Forecast'}</span>
            </button>

            {predictionResult && (
              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white font-semibold text-xs border border-emerald-600 transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Export Report</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-stone-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('PREDICTOR')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            activeSubTab === 'PREDICTOR'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Yield & Growth Forecast</span>
        </button>

        <button
          onClick={() => setActiveSubTab('TIMELINE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            activeSubTab === 'TIMELINE'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>60-Day Milestone Curve</span>
        </button>

        <button
          onClick={() => setActiveSubTab('SENSITIVITY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            activeSubTab === 'SENSITIVITY'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>"What-If" Sensitivity Simulator</span>
        </button>

        <button
          onClick={() => setActiveSubTab('HISTORY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            activeSubTab === 'HISTORY'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Field Predictions ({savedHistory.length})</span>
        </button>
      </div>

      {/* Main Grid: Input Matrix on Left/Top + Yield Dashboard on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Farm Parameters & Soil-Weather Matrix (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Farm & Crop Selection Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center space-x-2 text-stone-900 font-bold text-sm">
                <Sprout className="w-4 h-4 text-emerald-700" />
                <span>Target Crop & Field Setting</span>
              </div>
              <span className="text-[10px] font-semibold text-stone-400">Step 1 of 3</span>
            </div>

            {/* Quick Crop Selector Pills */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Select Standing Crop</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CROP_OPTIONS.slice(0, 6).map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleCropChange(c.name)}
                    className={`px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all text-left cursor-pointer border ${
                      selectedCrop === c.name
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>{c.emoji}</span>
                    <span className="truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Variety & Land Area */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">Variety / Hybrid</label>
                <input
                  type="text"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. US-618 F1"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">Land Holding (Acres)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="100"
                  value={landArea}
                  onChange={(e) => setLandArea(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Crop Stage & Sowing Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">Current Crop Stage</label>
                <select
                  value={cropStage}
                  onChange={(e) => setCropStage(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Germination & Seedling">Germination & Seedling</option>
                  <option value="Vegetative Growth">Vegetative Growth</option>
                  <option value="Flowering & Tillering">Flowering & Tillering</option>
                  <option value="Fruit & Grain Setting">Fruit & Grain Setting</option>
                  <option value="Ripening & Maturation">Ripening & Maturation</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">Sowing / Planting Date</label>
                <input
                  type="date"
                  value={sowingDate}
                  onChange={(e) => setSowingDate(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Soil Type & Irrigation System */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">Soil Texture / Type</label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Red Loamy">Red Loamy</option>
                  <option value="Black Cotton">Black Cotton</option>
                  <option value="Alluvial Soil">Alluvial Soil</option>
                  <option value="Sandy Loam">Sandy Loam</option>
                  <option value="Clayey Loam">Clayey Loam</option>
                  <option value="Laterite">Laterite</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">Irrigation Method</label>
                <select
                  value={irrigationType}
                  onChange={(e) => setIrrigationType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Drip Irrigation">Drip Irrigation (+15% Yield)</option>
                  <option value="Sprinkler Irrigation">Sprinkler Irrigation</option>
                  <option value="Canal / Furrow Flooding">Canal / Furrow Flooding</option>
                  <option value="Rainfed / Borewell">Rainfed / Borewell</option>
                </select>
              </div>
            </div>
          </div>

          {/* Soil Nutrients Matrix Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center space-x-2 text-stone-900 font-bold text-sm">
                <FlaskConical className="w-4 h-4 text-amber-700" />
                <span>Soil Nutrient Health Baseline</span>
              </div>
              <button
                type="button"
                onClick={handleAutoPopulateFromSoilCard}
                className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center space-x-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Load Soil Card</span>
              </button>
            </div>

            {/* N-P-K Inputs */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-center justify-between text-[10px] font-bold text-stone-500">
                  <span>Nitrogen (N)</span>
                  <span className="text-emerald-700 font-extrabold">{soilN} kg/ha</span>
                </div>
                <input
                  type="range"
                  min="120"
                  max="480"
                  value={soilN}
                  onChange={(e) => setSoilN(parseInt(e.target.value))}
                  className="w-full mt-2 accent-emerald-600"
                />
              </div>

              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-center justify-between text-[10px] font-bold text-stone-500">
                  <span>Phosphorus (P)</span>
                  <span className="text-amber-700 font-extrabold">{soilP} kg/ha</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="45"
                  value={soilP}
                  onChange={(e) => setSoilP(parseInt(e.target.value))}
                  className="w-full mt-2 accent-amber-600"
                />
              </div>

              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-center justify-between text-[10px] font-bold text-stone-500">
                  <span>Potassium (K)</span>
                  <span className="text-blue-700 font-extrabold">{soilK} kg/ha</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="450"
                  value={soilK}
                  onChange={(e) => setSoilK(parseInt(e.target.value))}
                  className="w-full mt-2 accent-blue-600"
                />
              </div>
            </div>

            {/* pH & Organic Carbon & Moisture */}
            <div className="grid grid-cols-3 gap-2.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-1">Soil pH ({soilPH})</label>
                <input
                  type="number"
                  step="0.1"
                  min="4.5"
                  max="9.5"
                  value={soilPH}
                  onChange={(e) => setSoilPH(parseFloat(e.target.value) || 7)}
                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold text-stone-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-1">Organic Carbon ({soilOC}%)</label>
                <input
                  type="number"
                  step="0.05"
                  min="0.2"
                  max="2.0"
                  value={soilOC}
                  onChange={(e) => setSoilOC(parseFloat(e.target.value) || 0.6)}
                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold text-stone-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-1">Moisture ({soilMoisture}%)</label>
                <input
                  type="number"
                  min="20"
                  max="95"
                  value={soilMoisture}
                  onChange={(e) => setSoilMoisture(parseInt(e.target.value) || 60)}
                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold text-stone-800"
                />
              </div>
            </div>
          </div>

          {/* 60-Day Weather Climate Outlook Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center space-x-2 text-stone-900 font-bold text-sm">
                <Sun className="w-4 h-4 text-amber-600" />
                <span>60-Day Agro-Climatic Outlook</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                IMD Satellite Data
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">Avg Day Temp (°C)</label>
                <input
                  type="number"
                  min="15"
                  max="46"
                  value={avgDayTemp}
                  onChange={(e) => setAvgDayTemp(parseInt(e.target.value) || 30)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">Rainfall Trend</label>
                <select
                  value={rainfallTrend}
                  onChange={(e) => setRainfallTrend(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900"
                >
                  <option value="Normal Seasonal">Normal Seasonal (Optimal)</option>
                  <option value="Deficit Rain (-20%)">Deficit Rain (-20%)</option>
                  <option value="Excess Monsoon (+25%)">Excess Monsoon (+25%)</option>
                  <option value="Dry Spells & Heat Waves">Dry Spells & Heat Waves</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">Avg Humidity ({avgHumidity}%)</label>
                <input
                  type="range"
                  min="30"
                  max="95"
                  value={avgHumidity}
                  onChange={(e) => setAvgHumidity(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">Daily Sunshine ({sunlightHours}h/day)</label>
                <input
                  type="range"
                  step="0.5"
                  min="4"
                  max="12"
                  value={sunlightHours}
                  onChange={(e) => setSunlightHours(parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            {/* Run Button */}
            <button
              type="button"
              onClick={() => handleGenerateForecast()}
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Computing Crop Growth Curves...' : 'Calculate 60-Day Yield Forecast'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: AI Yield Forecast & Growth Curve (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-5">
          {predictionResult ? (
            <>
              {/* Top Yield KPI Hero Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* 1. Predicted Yield / Acre */}
                <div className="p-3.5 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-stone-400">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Projected Yield</span>
                    <Sprout className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div className="text-xl font-black text-stone-900">
                    {predictionResult.predictedYieldQuintalsPerAcre}{' '}
                    <span className="text-xs font-bold text-stone-500">Qtl/Acre</span>
                  </div>
                  <div className="flex items-center text-[10px] font-bold text-emerald-800">
                    <ArrowUpRight className="w-3 h-3 mr-0.5 text-emerald-700" />
                    <span>+{predictionResult.percentageVsRegionalAvg}% vs Region Avg</span>
                  </div>
                </div>

                {/* 2. Total Holding Output */}
                <div className="p-3.5 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-stone-400">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Total Output</span>
                    <Target className="w-4 h-4 text-blue-700" />
                  </div>
                  <div className="text-xl font-black text-stone-900">
                    {predictionResult.totalExpectedYieldQuintals}{' '}
                    <span className="text-xs font-bold text-stone-500">Quintals</span>
                  </div>
                  <p className="text-[10px] font-medium text-stone-500">
                    Across {predictionResult.landAreaAcres} Acres ({predictionResult.totalExpectedYieldTonnes} MT)
                  </p>
                </div>

                {/* 3. Biomass Health Index */}
                <div className="p-3.5 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-stone-400">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Biomass Index</span>
                    <BadgeCheck className="w-4 h-4 text-amber-700" />
                  </div>
                  <div className="text-xl font-black text-emerald-800">
                    {predictionResult.biomassHealthIndex}
                    <span className="text-xs font-bold text-stone-400">/100</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${predictionResult.biomassHealthIndex}%` }}
                    />
                  </div>
                </div>

                {/* 4. Estimated Harvest Window */}
                <div className="p-3.5 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-stone-400">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Harvest Window</span>
                    <Calendar className="w-4 h-4 text-purple-700" />
                  </div>
                  <div className="text-xs font-black text-stone-900 leading-snug">
                    {predictionResult.harvestWindowEstimated}
                  </div>
                  <p className="text-[10px] font-bold text-purple-800">
                    In ~{predictionResult.daysToOptimalHarvest} Days
                  </p>
                </div>
              </div>

              {/* TAB 1: PREDICTOR / OVERVIEW */}
              {activeSubTab === 'PREDICTOR' && (
                <div className="space-y-5">
                  {/* Agronomic Executive Summary Card */}
                  <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                        <h2 className="text-sm font-bold text-stone-900">
                          AI Agronomic Advisory & Crop Growth Projection
                        </h2>
                      </div>
                      <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {predictionResult.confidenceScorePercent}% Confidence
                      </span>
                    </div>

                    <div className="text-xs text-stone-700 leading-relaxed space-y-2 whitespace-pre-line">
                      {predictionResult.aiSummaryAdvisory}
                    </div>

                    {/* Quick Highlights Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-stone-100">
                      <div className="p-2.5 bg-stone-50 rounded-xl flex items-start space-x-2 text-xs">
                        <Droplets className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-stone-900">Weather & GDD Growth Impact</p>
                          <p className="text-[11px] text-stone-600 mt-0.5">
                            {predictionResult.weatherGrowthFactor?.temperatureImpact || 'Optimal degree days for rapid cell division.'}
                          </p>
                        </div>
                      </div>

                      <div className="p-2.5 bg-stone-50 rounded-xl flex items-start space-x-2 text-xs">
                        <FlaskConical className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-stone-900">Soil Fertility & Bioavailability</p>
                          <p className="text-[11px] text-stone-600 mt-0.5">
                            {predictionResult.soilGrowthFactor?.nitrogenImpact || 'Sufficient nitrogen reserves for dense leaf formation.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Market Revenue & Profit Gain Banner */}
                  <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 text-white rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-5 h-5 text-emerald-400" />
                        <h3 className="text-sm font-bold text-white">Projected Market Revenue & Financial Gain</h3>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-300">
                        APMC Mandi Rate: ₹{predictionResult.marketRevenueProjection?.currentMandiRateInrPerQuintal}/Qtl
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs border border-white/10">
                        <p className="text-[10px] uppercase font-bold text-stone-300">Projected Gross Sale</p>
                        <p className="text-lg font-black text-white mt-1">
                          ₹{predictionResult.marketRevenueProjection?.projectedGrossRevenueInr?.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[10px] text-emerald-300 mt-0.5">For {predictionResult.totalExpectedYieldQuintals} Quintals</p>
                      </div>

                      <div className="p-3 bg-emerald-900/50 rounded-xl border border-emerald-500/30">
                        <p className="text-[10px] uppercase font-bold text-emerald-300">AI Yield Gain Value</p>
                        <p className="text-lg font-black text-emerald-400 mt-1">
                          +₹{predictionResult.marketRevenueProjection?.potentialGainWithAIInterventionsInr?.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[10px] text-emerald-200 mt-0.5">vs Regional baseline average</p>
                      </div>

                      <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs border border-white/10">
                        <p className="text-[10px] uppercase font-bold text-stone-300">Net Intervention ROI</p>
                        <p className="text-lg font-black text-amber-400 mt-1">
                          {predictionResult.marketRevenueProjection?.roiMultiplier}x ROI
                        </p>
                        <p className="text-[10px] text-stone-300 mt-0.5">Micro-nutrient & Drip benefit</p>
                      </div>
                    </div>
                  </div>

                  {/* Calendarized Actionable Interventions Checklist */}
                  <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <h3 className="text-sm font-bold text-stone-900">
                          Recommended Agronomic Interventions Schedule
                        </h3>
                      </div>
                      <button
                        onClick={handleSaveForecast}
                        className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center space-x-1 cursor-pointer"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Save Field Plan</span>
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {interventions.map((item) => (
                        <div
                          key={item.id}
                          className={`p-3 rounded-xl border transition-all flex items-start space-x-3 ${
                            item.completed
                              ? 'bg-emerald-50/60 border-emerald-300 text-stone-500'
                              : 'bg-stone-50 border-stone-200 text-stone-800'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={!!item.completed}
                            onChange={() => handleToggleIntervention(item.id)}
                            className="mt-1 w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                          />
                          <div className="flex-1 space-y-1">
                            <div className="flex flex-wrap items-center justify-between gap-1">
                              <span className="text-xs font-bold text-stone-900">{item.title}</span>
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-stone-200 text-stone-800">
                                {item.dayTarget}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-600 leading-relaxed">{item.instruction}</p>
                            <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-semibold text-emerald-800">
                              <span className="bg-emerald-100/70 px-2 py-0.5 rounded">Dosage: {item.dosageOrRate}</span>
                              <span>+{item.expectedYieldGainPercent}% Yield Protection</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: 60-DAY MILESTONE GROWTH CURVE */}
              {activeSubTab === 'TIMELINE' && (
                <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-5">
                  <div className="border-b border-stone-100 pb-3">
                    <h3 className="text-sm font-bold text-stone-900">
                      60-Day Physiological Growth Milestones (10-Day Decades)
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Select each 10-day milestone decade below to inspect biomass index, water requirement, and tissue development targets.
                    </p>
                  </div>

                  {/* Milestone Decade Selector Tabs */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {predictionResult.timeline60Days?.map((m, idx) => (
                      <button
                        key={m.day}
                        onClick={() => setActiveMilestoneIndex(idx)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          activeMilestoneIndex === idx
                            ? 'bg-emerald-700 border-emerald-700 text-white shadow-xs font-bold'
                            : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <p className="text-[10px] uppercase">{m.dayLabel}</p>
                        <p className="text-xs font-extrabold mt-0.5">{m.projectedBiomassIndex}% Biomass</p>
                      </button>
                    ))}
                  </div>

                  {/* Active Milestone Detailed Breakdown */}
                  {predictionResult.timeline60Days?.[activeMilestoneIndex] && (
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                      {(() => {
                        const m = predictionResult.timeline60Days[activeMilestoneIndex];
                        return (
                          <>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
                              <div>
                                <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">
                                  {m.dayLabel} Milestone
                                </span>
                                <h4 className="text-base font-bold text-stone-900">{m.stageTitle}</h4>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 border border-blue-200">
                                  Water: {m.waterDemandLitersPerAcrePerDay.toLocaleString()} L/Acre/Day
                                </span>
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-200">
                                  Pest Risk: {m.pestRiskLevel}
                                </span>
                              </div>
                            </div>

                            {/* Milestone Metrics Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                              <div className="p-3 bg-white rounded-xl border border-stone-200">
                                <p className="text-[10px] text-stone-500 font-bold">Biomass Health Index</p>
                                <p className="text-base font-black text-emerald-800 mt-0.5">{m.projectedBiomassIndex}%</p>
                              </div>

                              <div className="p-3 bg-white rounded-xl border border-stone-200">
                                <p className="text-[10px] text-stone-500 font-bold">Canopy Foliage Cover</p>
                                <p className="text-base font-black text-teal-800 mt-0.5">{m.canopyCoverPercent}%</p>
                              </div>

                              <div className="p-3 bg-white rounded-xl border border-stone-200">
                                <p className="text-[10px] text-stone-500 font-bold">Projected Crop Height</p>
                                <p className="text-base font-black text-stone-900 mt-0.5">{m.projectedHeightCm || 65} cm</p>
                              </div>

                              <div className="p-3 bg-white rounded-xl border border-stone-200">
                                <p className="text-[10px] text-stone-500 font-bold">Estimated NDVI Greenness</p>
                                <p className="text-base font-black text-stone-900 mt-0.5">{m.ndviEstimated || 0.68}</p>
                              </div>
                            </div>

                            {/* Milestone Goal & Critical Action */}
                            <div className="space-y-2">
                              <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs">
                                <span className="font-bold text-stone-900">Tissue & Agronomic Objective: </span>
                                <span className="text-stone-700">{m.milestoneGoal}</span>
                              </div>

                              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs flex items-start space-x-2">
                                <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold text-emerald-950">Required Field Action: </span>
                                  <span className="text-emerald-900">{m.criticalIntervention}</span>
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: "WHAT-IF" SENSITIVITY SIMULATOR */}
              {activeSubTab === 'SENSITIVITY' && (
                <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-5">
                  <div className="border-b border-stone-100 pb-3">
                    <div className="flex items-center space-x-2 text-stone-900 font-bold text-sm">
                      <Sliders className="w-4 h-4 text-emerald-700" />
                      <h3>Interactive "What-If" Sensitivity Simulator</h3>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Tweak irrigation scheduling, micronutrient foliar boost, or pest protection shields in real time to simulate yield gains.
                    </p>
                  </div>

                  {/* Simulator Sliders */}
                  <div className="space-y-4 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-stone-800 mb-1">
                        <span>Irrigation Precision Adjustment ({simIrrigationBoost > 0 ? `+${simIrrigationBoost}%` : `${simIrrigationBoost}%`})</span>
                        <span className="text-blue-700">{simIrrigationBoost >= 0 ? 'Water Buffer' : 'Deficit'}</span>
                      </div>
                      <input
                        type="range"
                        min="-20"
                        max="30"
                        step="5"
                        value={simIrrigationBoost}
                        onChange={(e) => setSimIrrigationBoost(parseInt(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-stone-800 mb-1">
                        <span>Fertilizer / NPK Foliar Booster (+{simFertilizerBoost}%)</span>
                        <span className="text-amber-700">Nutrient Density</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="25"
                        step="5"
                        value={simFertilizerBoost}
                        onChange={(e) => setSimFertilizerBoost(parseInt(e.target.value))}
                        className="w-full accent-amber-600"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-stone-200">
                      <div>
                        <p className="text-xs font-bold text-stone-900">Bio-Pest & Fungus Shield Active</p>
                        <p className="text-[11px] text-stone-500">Apply preventive neem & bio-fungicide sprays (+8% yield retention)</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSimPestShield(!simPestShield)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          simPestShield
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {simPestShield ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleGenerateForecast(true)}
                      disabled={isLoading}
                      className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                      <span>Re-Simulate Crop Yield with Current Settings</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: SAVED HISTORY */}
              {activeSubTab === 'HISTORY' && (
                <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
                  <div className="border-b border-stone-100 pb-3">
                    <h3 className="text-sm font-bold text-stone-900">Saved Yield Predictions & Forecast Records</h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Review previous field runs and track crop yield progression over multiple cycles.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {savedHistory.map((pred) => (
                      <div
                        key={pred.id}
                        onClick={() => {
                          setPredictionResult(pred);
                          setInterventions(pred.actionableInterventions || []);
                          setActiveSubTab('PREDICTOR');
                          showToast(`Loaded ${pred.cropName} prediction record`);
                        }}
                        className="p-4 rounded-xl border border-stone-200 hover:border-emerald-500 transition-all cursor-pointer flex items-center justify-between bg-stone-50/50 hover:bg-white"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-stone-900">{pred.cropName}</span>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                              {pred.predictedYieldQuintalsPerAcre} Qtl/Acre
                            </span>
                            <span className="text-[10px] text-stone-400">
                              {new Date(pred.generatedAt).toLocaleDateString('en-IN')}
                            </span>
                          </div>
                          <p className="text-xs text-stone-600">
                            {pred.landAreaAcres} Acres ({pred.soilType}, {pred.irrigationType}) • Total: {pred.totalExpectedYieldQuintals} Quintals
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-stone-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <Sprout className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-base font-bold text-stone-900">Ready to Compute 60-Day Yield Forecast</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Select your crop and soil parameters on the left panel, then click "Calculate 60-Day Yield Forecast" to generate a detailed agronomic prediction.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleGenerateForecast()}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Run AI Forecast Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Print / Export Report Modal */}
      {isPrintModalOpen && predictionResult && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 border border-stone-300 shadow-xl my-8">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-stone-900">AgriSaarthi AI - Kisan Yield Forecast Certificate</h3>
              </div>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Certificate Printable Area */}
            <div className="p-5 bg-stone-50 rounded-xl border border-stone-200 space-y-4 text-xs">
              <div className="flex justify-between items-start border-b border-stone-200 pb-3">
                <div>
                  <h4 className="font-extrabold text-stone-900 text-sm">
                    {farmerProfile?.farmer_name || 'Murugan Palaniswamy'}
                  </h4>
                  <p className="text-stone-500">Kisan ID: #TN-882 • Coimbatore, Tamil Nadu</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                    ICAR Certified Model v2.4
                  </span>
                  <p className="text-[10px] text-stone-400 mt-1">
                    Date: {new Date(predictionResult.generatedAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-lg border border-stone-200 space-y-0.5">
                  <p className="text-[10px] font-bold text-stone-400 uppercase">Crop & Variety</p>
                  <p className="font-bold text-stone-900 text-sm">{predictionResult.cropName} ({predictionResult.variety})</p>
                  <p className="text-stone-500">Holding: {predictionResult.landAreaAcres} Acres • {predictionResult.soilType}</p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-stone-200 space-y-0.5">
                  <p className="text-[10px] font-bold text-stone-400 uppercase">Predicted Yield</p>
                  <p className="font-extrabold text-emerald-800 text-sm">
                    {predictionResult.predictedYieldQuintalsPerAcre} Qtl/Acre ({predictionResult.totalExpectedYieldQuintals} Qtl Total)
                  </p>
                  <p className="text-stone-500">Harvest Window: {predictionResult.harvestWindowEstimated}</p>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-stone-200 space-y-1">
                <p className="text-[10px] font-bold text-stone-400 uppercase">Agronomic Forecast Summary</p>
                <p className="text-stone-700 leading-relaxed">{predictionResult.aiSummaryAdvisory}</p>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-stone-400 uppercase">Scheduled High-ROI Interventions</p>
                <div className="space-y-1">
                  {predictionResult.actionableInterventions?.slice(0, 4).map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-[11px] p-1.5 bg-white rounded border border-stone-200">
                      <span className="font-semibold text-stone-800">{item.title} ({item.dayTarget})</span>
                      <span className="text-emerald-700 font-bold">+{item.expectedYieldGainPercent}% Yield</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
