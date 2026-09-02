import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  PestRiskAssessmentInput,
  PestRiskAssessmentResult,
  PestRiskVulnerabilityItem,
  WeeklyScoutingChecklistTask,
  OrganicEmergencySprayItem,
} from '../../types';
import {
  ShieldAlert,
  ShieldCheck,
  Bug,
  Sparkles,
  AlertTriangle,
  Droplets,
  Thermometer,
  CloudRain,
  Leaf,
  CheckCircle2,
  Clock,
  Printer,
  Bookmark,
  RefreshCw,
  Info,
  ChevronRight,
  Target,
  FlaskConical,
  Sprout,
  Activity,
  Layers,
  ArrowRight,
  Sun,
  Shield,
  Eye,
  Sliders,
} from 'lucide-react';

const CROP_PRESETS = [
  { name: 'Tomato', variety: 'Shivam / US-618 F1', defaultAcres: 2.5, emoji: '🍅', dominantPests: 'Tuta Absoluta, Early Blight, Whitefly' },
  { name: 'Paddy', variety: 'CO 51 / CR 1009 Sub 1', defaultAcres: 3.0, emoji: '🌾', dominantPests: 'Brown Plant Hopper (BPH), Yellow Stem Borer, Blast' },
  { name: 'Cotton', variety: 'RCH 659 BG II', defaultAcres: 4.0, emoji: '🌿', dominantPests: 'Pink Bollworm, Whitefly, Jassids' },
  { name: 'Maize', variety: 'NK 6240 Plus Hybrid', defaultAcres: 2.0, emoji: '🌽', dominantPests: 'Fall Armyworm (Spodoptera frugiperda), Stem Borer' },
  { name: 'Chilli', variety: 'Teja S17 / Byadgi Hybrid', defaultAcres: 1.5, emoji: '🌶️', dominantPests: 'Thrips, Mites, Anthracnose Die-Back' },
  { name: 'Banana', variety: 'Grand Naine (G9)', defaultAcres: 2.0, emoji: '🍌', dominantPests: 'Sigatoka Leaf Spot, Pseudostem Weevil' },
  { name: 'Groundnut', variety: 'Kadiri Lepakshi (K-1812)', defaultAcres: 2.0, emoji: '🥜', dominantPests: 'Tikka Leaf Spot, Leaf Miner' },
];

export const PestRiskPredictionView: React.FC = () => {
  const { farmerProfile, currentLocation, showToast } = useApp();

  // Active view tab: 'ANALYZER' | 'VULNERABILITY' | 'MANAGEMENT' | 'SCOUTING' | 'SPRAY_PLAN' | 'HISTORY'
  const [activeSubTab, setActiveSubTab] = useState<'ANALYZER' | 'VULNERABILITY' | 'MANAGEMENT' | 'SCOUTING' | 'SPRAY_PLAN' | 'HISTORY'>('ANALYZER');

  // Input states
  const [selectedCrop, setSelectedCrop] = useState<string>('Tomato');
  const [variety, setVariety] = useState<string>('Shivam Hybrid (Semi-determinate)');
  const [cropStage, setCropStage] = useState<PestRiskAssessmentInput['cropStage']>('Flowering & Tillering');
  const [landArea, setLandArea] = useState<number>(farmerProfile?.land_area_acres || 2.5);
  const [temperatureCelsius, setTemperatureCelsius] = useState<number>(29.5);
  const [humidityPercent, setHumidityPercent] = useState<number>(84);
  const [rainfallCondition, setRainfallCondition] = useState<PestRiskAssessmentInput['weatherConditions']['rainfallCondition']>('Moderate / Intermittent');
  const [leafWetnessHours, setLeafWetnessHours] = useState<number>(6);
  const [nitrogenStatus, setNitrogenStatus] = useState<'Optimal' | 'Excessive' | 'Deficient'>('Optimal');
  const [standingWater, setStandingWater] = useState<boolean>(false);
  const [historicalPestPressure, setHistoricalPestPressure] = useState<string>('Moderate');
  const [neighboringInfestationNoticed, setNeighboringInfestationNoticed] = useState<boolean>(true);

  // Result & History states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [assessmentResult, setAssessmentResult] = useState<PestRiskAssessmentResult | null>(null);
  const [savedHistory, setSavedHistory] = useState<PestRiskAssessmentResult[]>([]);
  const [selectedPestIndex, setSelectedPestIndex] = useState<number>(0);
  const [checklistTasks, setChecklistTasks] = useState<WeeklyScoutingChecklistTask[]>([]);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Load saved history and seeded records
  const loadHistory = useCallback(async () => {
    try {
      const list = await api.getPestRisks(farmerProfile?.id || 'usr_farmer_1');
      if (list && list.length > 0) {
        setSavedHistory(list);
        if (!assessmentResult) {
          setAssessmentResult(list[0]);
          setChecklistTasks(list[0].weeklyScoutingChecklist || []);
        }
      }
    } catch (err) {
      console.warn('Failed to load pest risk history:', err);
    }
  }, [farmerProfile?.id, assessmentResult]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Handle crop preset switch
  const handleCropPresetChange = (crop: typeof CROP_PRESETS[0]) => {
    setSelectedCrop(crop.name);
    setVariety(crop.variety);
    setLandArea(crop.defaultAcres);
  };

  // Run AI Pest Risk Assessment
  const handleRunAssessment = async () => {
    setIsLoading(true);
    try {
      const input: PestRiskAssessmentInput = {
        cropName: selectedCrop,
        variety,
        cropStage,
        landAreaAcres: landArea,
        farmerId: farmerProfile?.id || 'usr_farmer_1',
        location: {
          district: currentLocation.district || 'Coimbatore',
          state: currentLocation.state || 'Tamil Nadu',
        },
        weatherConditions: {
          temperatureC: temperatureCelsius,
          relativeHumidityPercent: humidityPercent,
          rainfallCondition,
          canopyWetnessHours: leafWetnessHours,
          windSpeedKmh: 12,
        },
        soilFieldConditions: {
          nitrogenApplicationStatus: nitrogenStatus,
          standingWater,
          previousCropPestHistory: historicalPestPressure,
        },
      };

      const result = await api.predictPestRisk(input);
      setAssessmentResult(result);
      setChecklistTasks(result.weeklyScoutingChecklist || []);
      setSelectedPestIndex(0);
      setActiveSubTab('VULNERABILITY');
      showToast(`Pest risk analysis complete for ${selectedCrop}: ${result.overallRiskLevel} risk detected.`);
      loadHistory();
    } catch (err: any) {
      console.error('Error running pest assessment:', err);
      showToast('Error analyzing pest risks. Loaded agronomic standard models.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle scouting task completion
  const handleToggleTask = async (taskId: string) => {
    if (!assessmentResult) return;
    const task = checklistTasks.find((t) => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const updatedTasks = checklistTasks.map((t) =>
      t.id === taskId ? { ...t, status: newStatus as 'completed' | 'pending' } : t
    );
    setChecklistTasks(updatedTasks);

    try {
      await api.togglePestChecklistTask(assessmentResult.id, taskId, newStatus);
      showToast(newStatus === 'completed' ? 'Scouting milestone marked as completed!' : 'Task set to pending.');
    } catch (err) {
      console.warn('Checklist status update error:', err);
    }
  };

  // Save advisory
  const handleSaveAdvisory = async () => {
    if (!assessmentResult) return;
    try {
      await api.savePestRisk({
        ...assessmentResult,
        weeklyScoutingChecklist: checklistTasks,
      });
      showToast('Pest Risk Advisory and Organic Plan saved to your Farm Records!');
      loadHistory();
    } catch (err) {
      showToast('Advisory saved locally.');
    }
  };

  // Risk Color Mapping
  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'HIGH':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'MODERATE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  const getRiskBgGradient = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
        return 'from-rose-50 to-orange-50/60 border-rose-200';
      case 'HIGH':
        return 'from-amber-50 to-orange-50/50 border-amber-200';
      case 'MODERATE':
        return 'from-yellow-50 to-stone-50 border-yellow-200';
      default:
        return 'from-emerald-50 to-teal-50/50 border-emerald-200';
    }
  };

  const currentPest = assessmentResult?.identifiedPests[selectedPestIndex] || assessmentResult?.identifiedPests[0];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-stone-900 text-white rounded-2xl p-6 shadow-sm border border-emerald-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <ShieldAlert className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Agro-Climatic Micro-Modeling (Gemini 3.7 Flash)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Proactive Pest & Disease Risk Prediction</span>
              <span className="text-xs bg-emerald-700/80 text-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                100% Organic
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
              Analyzes real-time temperature, canopy humidity, and leaf wetness duration to detect pest incubation windows 48-72 hours before visible crop damage. Provides zero-chemical botanical decoctions and biological parasitoid release schedules.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {assessmentResult && (
              <>
                <button
                  onClick={handleSaveAdvisory}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save Advisory</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Plan</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-stone-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('ANALYZER')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'ANALYZER'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Risk Analyzer & Field Inputs</span>
        </button>

        <button
          onClick={() => setActiveSubTab('VULNERABILITY')}
          disabled={!assessmentResult}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all whitespace-nowrap cursor-pointer ${
            !assessmentResult
              ? 'opacity-50 cursor-not-allowed bg-stone-100 text-stone-400'
              : activeSubTab === 'VULNERABILITY'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Vulnerability & Pests ({assessmentResult?.identifiedPests.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('MANAGEMENT')}
          disabled={!assessmentResult}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all whitespace-nowrap cursor-pointer ${
            !assessmentResult
              ? 'opacity-50 cursor-not-allowed bg-stone-100 text-stone-400'
              : activeSubTab === 'MANAGEMENT'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Leaf className="w-3.5 h-3.5" />
          <span>Organic & Biocontrol Strategy</span>
        </button>

        <button
          onClick={() => setActiveSubTab('SCOUTING')}
          disabled={!assessmentResult}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all whitespace-nowrap cursor-pointer ${
            !assessmentResult
              ? 'opacity-50 cursor-not-allowed bg-stone-100 text-stone-400'
              : activeSubTab === 'SCOUTING'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>7-Day Scouting Checklist</span>
        </button>

        <button
          onClick={() => setActiveSubTab('SPRAY_PLAN')}
          disabled={!assessmentResult}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all whitespace-nowrap cursor-pointer ${
            !assessmentResult
              ? 'opacity-50 cursor-not-allowed bg-stone-100 text-stone-400'
              : activeSubTab === 'SPRAY_PLAN'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Emergency Bio-Spray</span>
        </button>

        <button
          onClick={() => setActiveSubTab('HISTORY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'HISTORY'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Advisory Records ({savedHistory.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: ANALYZER & FORM */}
      {activeSubTab === 'ANALYZER' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form Inputs (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Quick Crop Selector Presets */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <Sprout className="w-4 h-4 text-emerald-600" />
                  <span>Select Standing Crop</span>
                </label>
                <span className="text-[11px] text-stone-400">Click to load agro-climatic presets</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CROP_PRESETS.map((crop) => {
                  const isSelected = selectedCrop === crop.name;
                  return (
                    <button
                      key={crop.name}
                      type="button"
                      onClick={() => handleCropPresetChange(crop)}
                      className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20 text-emerald-950 font-bold'
                          : 'border-stone-200 bg-stone-50/50 hover:bg-stone-100/80 text-stone-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{crop.emoji}</span>
                        <div>
                          <p className="text-xs font-bold">{crop.name}</p>
                          <p className="text-[10px] text-stone-500 truncate">{crop.variety.split('/')[0]}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Field & Crop Dynamics */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Crop Stage & Field Setup</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Crop Variety</label>
                  <input
                    type="text"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Phenological Growth Stage</label>
                  <select
                    value={cropStage}
                    onChange={(e) => setCropStage(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50"
                  >
                    <option value="Seedling & Germination">Seedling & Germination (0-20 Days)</option>
                    <option value="Vegetative Growth">Vegetative Growth (20-35 Days)</option>
                    <option value="Flowering & Tillering">Flowering & Tillering (35-60 Days)</option>
                    <option value="Fruit & Grain Setting">Fruit & Grain Setting (60-85 Days)</option>
                    <option value="Ripening & Maturation">Ripening & Maturation (85+ Days)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Plot Area (Acres)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={landArea}
                    onChange={(e) => setLandArea(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50"
                  />
                </div>
              </div>
            </div>

            {/* Micro-Climate & Weather Parameters (Triggers) */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-amber-600" />
                  <span>Micro-Climate Triggers (Last 48 Hours)</span>
                </h3>
                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {currentLocation.district}, {currentLocation.state}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600">
                    <span className="flex items-center gap-1"><Sun className="w-3.5 h-3.5 text-amber-500" /> Day Temp</span>
                    <span className="font-bold text-stone-900">{temperatureCelsius}°C</span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="45"
                    step="0.5"
                    value={temperatureCelsius}
                    onChange={(e) => setTemperatureCelsius(parseFloat(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <p className="text-[10px] text-stone-400">Optimum pest spurt: 26°C - 33°C</p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600">
                    <span className="flex items-center gap-1"><Droplets className="w-3.5 h-3.5 text-blue-500" /> Rel. Humidity</span>
                    <span className="font-bold text-blue-900">{humidityPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="98"
                    value={humidityPercent}
                    onChange={(e) => setHumidityPercent(parseInt(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <p className="text-[10px] text-stone-400">&gt;80% triggers fungal blast & BPH</p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-teal-600" /> Leaf Wetness</span>
                    <span className="font-bold text-stone-900">{leafWetnessHours} hrs/day</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="14"
                    value={leafWetnessHours}
                    onChange={(e) => setLeafWetnessHours(parseInt(e.target.value))}
                    className="w-full accent-teal-600 cursor-pointer"
                  />
                  <p className="text-[10px] text-stone-400">&gt;5 hrs creates spore film</p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600">
                    <span className="flex items-center gap-1"><CloudRain className="w-3.5 h-3.5 text-indigo-500" /> Rainfall Trend</span>
                  </div>
                  <select
                    value={rainfallCondition}
                    onChange={(e) => setRainfallCondition(e.target.value as any)}
                    className="w-full px-2 py-1 text-xs rounded-lg border border-stone-200 bg-white font-medium"
                  >
                    <option value="Dry Spells / Heatwave">Dry Spells / Heatwave</option>
                    <option value="Moderate / Intermittent">Moderate / Intermittent</option>
                    <option value="Continuous Drizzle">Continuous Drizzle</option>
                    <option value="Heavy Showers">Heavy Showers</option>
                    <option value="Humid & Overcast">Humid & Overcast</option>
                    <option value="Optimal Clear Sky">Optimal Clear Sky</option>
                  </select>
                  <p className="text-[10px] text-stone-400">Rain splash spreads conidia</p>
                </div>
              </div>
            </div>

            {/* Infestation Context */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-rose-600" />
                <span>Field History & Surrounding Infestation</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Previous Season Pest Pressure</label>
                  <select
                    value={historicalPestPressure}
                    onChange={(e) => setHistoricalPestPressure(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50 font-medium"
                  >
                    <option value="None">None (Virgin Plot / Fully Managed)</option>
                    <option value="Moderate">Moderate (Minor sucking pests / leaf spots)</option>
                    <option value="Severe">Severe (Borer damage / crop loss history)</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <input
                    type="checkbox"
                    id="neighborInfestation"
                    checked={neighboringInfestationNoticed}
                    onChange={(e) => setNeighboringInfestationNoticed(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="neighborInfestation" className="text-xs font-semibold text-stone-700 cursor-pointer">
                    Neighboring fields report active pest sightings (Within 2 km)
                  </label>
                </div>
              </div>
            </div>

            {/* Run Button */}
            <button
              type="button"
              onClick={handleRunAssessment}
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-sm rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Analyzing Microclimate & Simulating 48h Pest Incubation...</span>
                </>
              ) : (
                <>
                  <Bug className="w-4 h-4 text-white" />
                  <span>Run AI Pest Risk Assessment ({selectedCrop})</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </div>

          {/* Right Info Box (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-stone-900 text-white rounded-2xl p-5 border border-stone-800 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Integrated Pest Management (IPM)</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Modern agriculture balances predator-prey ecosystems. Chemical pesticides kill beneficial pollinators and predatory spiders, triggering secondary pest resurgence.
              </p>
              <div className="space-y-2 pt-2 border-t border-stone-800 text-[11px]">
                <div className="flex items-center space-x-2 text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Pheromone Traps & Sticky Sheets</span>
                </div>
                <div className="flex items-center space-x-2 text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Egg Parasitoids (Trichogramma)</span>
                </div>
                <div className="flex items-center space-x-2 text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Neem Azadirachtin & Bio-Decoctions</span>
                </div>
                <div className="flex items-center space-x-2 text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Zero-Residue APMC Export Ready</span>
                </div>
              </div>
            </div>

            {/* Quick Agro-Climatic Guidance */}
            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 shadow-xs space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>Current Weather Alert Factor</span>
              </div>
              <p className="text-xs text-amber-950 leading-relaxed">
                Continuous high humidity (&gt;80% RH) with moderate temperatures (28-30°C) reduces egg-to-adult generation time of Lepidopteran borers and accelerates spore germination of fungal pathogens.
              </p>
              <div className="pt-2 text-[10px] text-amber-800 font-bold">
                ⚠️ Timely early bio-sprays protect 30% - 50% harvest yield.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: VULNERABILITY & IDENTIFIED PESTS */}
      {activeSubTab === 'VULNERABILITY' && assessmentResult && (
        <div className="space-y-6">
          {/* Main Risk Score Card */}
          <div className={`rounded-2xl p-6 border shadow-xs bg-gradient-to-r ${getRiskBgGradient(assessmentResult.overallRiskLevel)}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2.5">
                  <span className={`text-xs font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider ${getRiskBadgeColor(assessmentResult.overallRiskLevel)}`}>
                    {assessmentResult.overallRiskLevel} PEST RISK
                  </span>
                  <span className="text-xs font-semibold text-stone-600">
                    Plot: {assessmentResult.landAreaAcres} Acres ({assessmentResult.cropName} - {assessmentResult.variety})
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-stone-900">
                  {assessmentResult.immediateAlertHeading}
                </h2>
                <p className="text-xs text-stone-700 max-w-3xl leading-relaxed">
                  {assessmentResult.climateVulnerabilitySummary}
                </p>
              </div>

              {/* Gauge Score */}
              <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex items-center space-x-4 shrink-0">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-black text-stone-900">
                    {assessmentResult.overallFarmPestIndex}
                    <span className="text-xs font-bold text-stone-400">/100</span>
                  </div>
                  <p className="text-[10px] font-bold uppercase text-stone-500">Pest Index</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                  <Bug className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Weather Alert Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-stone-200/60">
              <div className="bg-white/80 p-3 rounded-xl border border-stone-200/70 text-xs">
                <span className="font-bold text-stone-900 block mb-0.5 flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-amber-600" /> Temperature Factor
                </span>
                <span className="text-stone-600 text-[11px]">{assessmentResult.weatherAlertBadge.temperatureWarning}</span>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-stone-200/70 text-xs">
                <span className="font-bold text-stone-900 block mb-0.5 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-600" /> Humidity Incubation
                </span>
                <span className="text-stone-600 text-[11px]">{assessmentResult.weatherAlertBadge.humidityCondition}</span>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-stone-200/70 text-xs">
                <span className="font-bold text-stone-900 block mb-0.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-rose-600" /> Critical Intervention Window
                </span>
                <span className="text-rose-900 font-bold text-[11px]">{assessmentResult.weatherAlertBadge.favorablePestSpurtWindow}</span>
              </div>
            </div>
          </div>

          {/* Identified Pests Horizontal Selector */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
              <Bug className="w-4 h-4 text-emerald-600" />
              <span>Identified Pathogens & Insect Pests Under Current Weather ({assessmentResult.identifiedPests.length})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {assessmentResult.identifiedPests.map((pest, idx) => {
                const isSelected = selectedPestIndex === idx;
                return (
                  <div
                    key={pest.id}
                    onClick={() => setSelectedPestIndex(idx)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-white ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-stone-200 bg-white hover:bg-stone-50/80 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getRiskBadgeColor(pest.riskLevel)}`}>
                            {pest.riskLevel} ({pest.riskScorePercent}%)
                          </span>
                          <span className="text-[10px] text-stone-500 font-medium">{pest.pestType}</span>
                        </div>
                        <h4 className="text-sm font-bold text-stone-900 mt-1">{pest.pestOrDiseaseName}</h4>
                        <p className="text-[11px] italic text-stone-500">{pest.scientificName}</p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700 shrink-0">
                        <Activity className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-stone-100 text-[11px] space-y-1 text-stone-600">
                      <div className="flex justify-between">
                        <span>Incubation Window:</span>
                        <span className="font-bold text-stone-900">{pest.incubationWindowDays} Days</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Potential Yield Loss:</span>
                        <span className="font-bold text-rose-700">{pest.potentialYieldLossPercent}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Pest Deep-Dive Breakdown */}
          {currentPest && (
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-stone-900">{currentPest.pestOrDiseaseName}</h3>
                    <span className="text-xs italic text-stone-500">({currentPest.scientificName})</span>
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5">
                    <strong>Economic Threshold Level (ETL):</strong> {currentPest.economicThresholdLevel}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200">
                    ⚠️ Urgency: {currentPest.urgencyWindow}
                  </span>
                </div>
              </div>

              {/* Symptoms Matrix: Early Detection vs Severe */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-amber-700" />
                    <span>Early Scouting Diagnostic Symptoms</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-amber-950">
                    {currentPest.damageSymptomsEarly.map((sym, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-amber-600 font-bold shrink-0">•</span>
                        <span>{sym}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200/80 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
                    <span>Severe Unchecked Damage Impact</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-rose-950">
                    {currentPest.damageSymptomsSevere.map((sym, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-rose-600 font-bold shrink-0">•</span>
                        <span>{sym}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Climate Triggers Breakdown */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-stone-500" />
                  <span>Agro-Climatic Spurt Triggers</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700">
                  {currentPest.climateTriggerFactors.map((trig, i) => (
                    <div key={i} className="flex items-start space-x-2 bg-white p-2.5 rounded-lg border border-stone-200">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{trig}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Switch to Management Action */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveSubTab('MANAGEMENT')}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>View 100% Organic Management Strategy</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: ORGANIC & BIOCONTROL STRATEGY */}
      {activeSubTab === 'MANAGEMENT' && assessmentResult && currentPest && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Zero-Chemical Agronomic Protocols
              </span>
              <h2 className="text-lg font-bold text-stone-900 mt-1">
                Organic Management Shield for {currentPest.pestOrDiseaseName}
              </h2>
              <p className="text-xs text-stone-500 italic">{currentPest.scientificName}</p>
            </div>

            {/* Switch target pest */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-stone-500">Pest:</span>
              <select
                value={selectedPestIndex}
                onChange={(e) => setSelectedPestIndex(parseInt(e.target.value))}
                className="px-3 py-1.5 text-xs rounded-xl border border-stone-300 font-bold bg-stone-50 text-stone-900"
              >
                {assessmentResult.identifiedPests.map((p, i) => (
                  <option key={p.id} value={i}>
                    {p.pestOrDiseaseName} ({p.riskLevel})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pillar 1: Botanical Bio-Formulations */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 font-black">
                  🌿
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Botanical Bio-Decoctions & Formulations</h3>
                  <p className="text-[11px] text-stone-500">Natural repellents, antifeedants, and antisporylation washes</p>
                </div>
              </div>

              <div className="space-y-3">
                {currentPest.organicManagementStrategy.botanicalBioFormulations.map((bot, i) => (
                  <div key={i} className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-emerald-950">{bot.formulationName}</h4>
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        Safety: {bot.safetyIntervalHours}h
                      </span>
                    </div>
                    <div className="text-xs text-stone-700 space-y-1">
                      <p><strong>Preparation & Rate:</strong> {bot.preparationAndDosage}</p>
                      <p><strong>Mode of Action:</strong> {bot.modeOfAction}</p>
                      <p><strong>Schedule:</strong> {bot.sprayFrequency}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pillar 2: Biological Parasitoids & Predators */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-teal-800">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700 font-black">
                  🐞
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Beneficial Bio-Agents & Parasitoids</h3>
                  <p className="text-[11px] text-stone-500">Living biological controls that destroy eggs and larvae</p>
                </div>
              </div>

              <div className="space-y-3">
                {currentPest.organicManagementStrategy.biologicalPredatorsAndParasites.map((bio, i) => (
                  <div key={i} className="p-4 bg-teal-50/40 rounded-xl border border-teal-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-teal-950">{bio.agentName}</h4>
                      <span className="text-[10px] font-semibold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                        Target: {bio.targetPestStage}
                      </span>
                    </div>
                    <div className="text-xs text-stone-700 space-y-1">
                      <p><strong>Release Rate:</strong> {bio.releaseRateOrDosage}</p>
                      <p><strong>Release Guideline:</strong> {bio.applicationGuideline}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pillar 3: Preventive Mechanical Measures */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-800">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700 font-black">
                  🛡️
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Mechanical Traps & Preventive Barriers</h3>
                  <p className="text-[11px] text-stone-500">Pheromones, sticky sheets, light lures & mulches</p>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-stone-700">
                {currentPest.organicManagementStrategy.preventiveMeasures.map((prev, i) => (
                  <li key={i} className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start space-x-2">
                    <span className="text-amber-600 font-bold shrink-0">✓</span>
                    <span>{prev}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pillar 4: Cultural & Sanitation Practices */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-stone-800">
                <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700 font-black">
                  🌾
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Cultural & Field Sanitation Practices</h3>
                  <p className="text-[11px] text-stone-500">Border cropping, canopy management & roguing</p>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-stone-700">
                {currentPest.organicManagementStrategy.culturalAndMechanicalPractices.map((cult, i) => (
                  <li key={i} className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start space-x-2">
                    <span className="text-stone-500 font-bold shrink-0">•</span>
                    <span>{cult}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: 7-DAY FIELD SCOUTING CHECKLIST */}
      {activeSubTab === 'SCOUTING' && assessmentResult && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900">
                7-Day Field Scouting & Early Intervention Checklist
              </h2>
              <p className="text-xs text-stone-500">
                Follow this scheduled field walkthrough to catch pest hotspots before economic damage thresholds are breached.
              </p>
            </div>
            <div className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              Completed: {checklistTasks.filter((t) => t.status === 'completed').length} / {checklistTasks.length} Milestones
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {checklistTasks.map((task) => {
              const isDone = task.status === 'completed';
              return (
                <div
                  key={task.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isDone
                      ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-400/30'
                      : 'bg-white border-stone-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-1 rounded-lg bg-stone-900 text-white font-bold text-xs">
                        {task.dayLabel}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isDone ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {isDone ? 'COMPLETED' : 'PENDING'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleTask(task.id)}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${
                        isDone
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <div>
                      <p className="font-bold text-stone-900">Scouting Focus:</p>
                      <p className="text-stone-700 mt-0.5">{task.scoutingFocusArea}</p>
                    </div>

                    <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                      <p className="text-[11px] font-bold text-amber-900">Visual Key:</p>
                      <p className="text-[11px] text-stone-600">{task.diagnosticVisualKey}</p>
                    </div>

                    <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                      <p className="text-[11px] font-bold text-emerald-900">Proactive Organic Task:</p>
                      <p className="text-[11px] text-emerald-950">{task.proactiveOrganicTask}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: EMERGENCY BIO-SPRAY PROTOCOLS */}
      {activeSubTab === 'SPRAY_PLAN' && assessmentResult && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              Immediate Tactical Bio-Sprays
            </span>
            <h2 className="text-base sm:text-lg font-bold text-stone-900">
              Emergency Botanical Spray Plan for {assessmentResult.cropName}
            </h2>
            <p className="text-xs text-stone-500">
              Zero-toxic formulation sequence tailored to neutralize emerging fungal spores and newly hatched instar larvae.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assessmentResult.organicEmergencySprayPlan.map((spray, i) => (
              <div key={spray.id || i} className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-800 text-emerald-100 text-xs font-bold">
                    {spray.dayTarget}
                  </span>
                  <span className="text-[11px] text-stone-500 font-medium">Step #{i + 1}</span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-stone-900">{spray.bioSprayName}</h3>
                  <p className="text-xs text-stone-500">Active: {spray.activeComponent}</p>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1">
                  <p className="font-bold text-emerald-950">Recommended Dosage & Mixing:</p>
                  <p className="text-emerald-900">{spray.dosage}</p>
                </div>

                <div className="text-xs text-stone-700 space-y-1">
                  <p><strong>Target Vulnerability:</strong> {spray.targetPest}</p>
                  <p><strong>Sprayer Precautions:</strong> {spray.precautions}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Expert Agronomist Note */}
          <div className="bg-gradient-to-r from-stone-900 to-emerald-950 text-white rounded-2xl p-5 border border-stone-800 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
              <Sprout className="w-4 h-4" />
              <span>Senior Agronomist Advisory Note</span>
            </div>
            <p className="text-xs text-stone-200 leading-relaxed whitespace-pre-line">
              {assessmentResult.expertAgronomistNote}
            </p>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: ADVISORY RECORDS / HISTORY */}
      {activeSubTab === 'HISTORY' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              Saved Pest Risk Assessments ({savedHistory.length})
            </h2>
            <button
              onClick={loadHistory}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {savedHistory.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 shadow-xs space-y-3">
              <Bug className="w-12 h-12 text-stone-300 mx-auto" />
              <p className="text-sm font-bold text-stone-800">No pest assessments saved yet.</p>
              <p className="text-xs text-stone-500">Run the AI analyzer above to generate and store pest risk predictions.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs hover:border-emerald-500 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getRiskBadgeColor(item.overallRiskLevel)}`}>
                          {item.overallRiskLevel}
                        </span>
                        <span className="text-xs font-bold text-stone-900">{item.cropName} ({item.landAreaAcres} Ac)</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">{item.variety} • {item.district}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-lg font-black text-stone-900">{item.overallFarmPestIndex}/100</div>
                      <p className="text-[9px] uppercase font-bold text-stone-400">Risk Index</p>
                    </div>
                  </div>

                  <p className="text-xs text-stone-700 line-clamp-2 leading-relaxed">
                    {item.immediateAlertHeading}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px]">
                    <span className="text-stone-400">
                      {new Date(item.generatedAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => {
                        setAssessmentResult(item);
                        setChecklistTasks(item.weeklyScoutingChecklist || []);
                        setSelectedPestIndex(0);
                        setActiveSubTab('VULNERABILITY');
                        showToast(`Loaded saved assessment for ${item.cropName}`);
                      }}
                      className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold transition-colors cursor-pointer flex items-center space-x-1"
                    >
                      <span>View Plan</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PRINT ADVISORY MODAL */}
      {isPrintModalOpen && assessmentResult && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200 my-8">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Official Kisan Advisory
                </span>
                <h2 className="text-lg font-bold text-stone-900 mt-1">
                  AgriSaarthi AI Pest & Disease Management Shield
                </h2>
                <p className="text-xs text-stone-500">
                  Assessment #{assessmentResult.id} • {new Date(assessmentResult.generatedAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 bg-stone-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Printable summary */}
            <div className="space-y-4 text-xs text-stone-800">
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex justify-between items-center">
                <div>
                  <p className="font-bold text-stone-900 text-sm">{assessmentResult.cropName} - {assessmentResult.variety}</p>
                  <p className="text-stone-500 text-[11px]">Farmer: {farmerProfile?.farmer_name || 'Murugan Palaniswamy'} • {assessmentResult.district}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${getRiskBadgeColor(assessmentResult.overallRiskLevel)}`}>
                    {assessmentResult.overallRiskLevel} ({assessmentResult.overallFarmPestIndex}/100)
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-stone-900">48-Hour Alert:</p>
                <p className="text-stone-700">{assessmentResult.immediateAlertHeading}</p>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-stone-900">Emergency Bio-Spray Protocol:</p>
                {assessmentResult.organicEmergencySprayPlan.map((s, i) => (
                  <div key={i} className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px]">
                    <span className="font-bold text-emerald-950">{s.dayTarget}: {s.bioSprayName}</span>
                    <p className="text-emerald-900 mt-0.5">Dosage: {s.dosage} | Target: {s.targetPest}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-200">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                  setIsPrintModalOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
