import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { CropGrowthLog, CropGrowthStage, GrowthStageTask } from '../../types';
import {
  Sprout,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Plus,
  Trash2,
  Edit3,
  Droplets,
  FlaskConical,
  Bug,
  Compass,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Layers,
  ShoppingBag,
  Bell,
  Warehouse,
  FileSpreadsheet,
  Check,
  X,
  Info,
  RefreshCw,
  Sun,
  ShieldCheck,
  Scale,
  DollarSign,
  Tag
} from 'lucide-react';

export const CropGrowthTrackerView: React.FC = () => {
  const { farmerProfile, showToast, setActiveFarmerTab } = useApp();

  const [cropLogs, setCropLogs] = useState<CropGrowthLog[]>([]);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isNewLogModalOpen, setIsNewLogModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<CropGrowthLog | null>(null);

  // Form state for creating a new crop growth track
  const [formCropName, setFormCropName] = useState('Tomato');
  const [formVariety, setFormVariety] = useState('US-440 Hybrid');
  const [formPlotName, setFormPlotName] = useState('Plot A - North Polyhouse Field');
  const [formPlantingDate, setFormPlantingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [formSowingMethod, setFormSowingMethod] = useState<CropGrowthLog['sowingMethod']>('Drip Fertigated Bed');
  const [formLandArea, setFormLandArea] = useState<number>(2.5);
  const [formNotes, setFormNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available crop options
  const cropOptions = [
    { name: 'Tomato', varieties: ['US-440 Hybrid', 'Abhinav Syngenta', 'Arka Rakshak', 'Pusa Ruby'], category: 'Vegetables', icon: '🍅', standardDays: 95 },
    { name: 'Small Onion (Shallots)', varieties: ['CO-5 Indigenous Shallot', 'Aggregatum White', 'Bhima Super', 'Nasik Red'], category: 'Vegetables', icon: '🧅', standardDays: 110 },
    { name: 'Paddy (Rice)', varieties: ['CR-1009 Sub-1', 'BPT 5204 Samba Mahsuri', 'ADT 45', 'CO 51'], category: 'Cereals & Grains', icon: '🌾', standardDays: 125 },
    { name: 'Groundnut', varieties: ['Kadiri-6 (K-6)', 'TMV-7', 'TAG-24', 'Greeshma Hybrid'], category: 'Oilseeds & Pulses', icon: '🥜', standardDays: 105 },
    { name: 'Maize', varieties: ['Pioneer 3396', 'NK 6240', 'Dekalb 9108', 'CoH(M) 8'], category: 'Cereals & Grains', icon: '🌽', standardDays: 100 },
    { name: 'Green Chilli', varieties: ['Sitara F1 Hybrid', 'Demon G4', 'Arka Harita', 'Teja Deluxe'], category: 'Vegetables', icon: '🌶️', standardDays: 120 },
    { name: 'Banana', varieties: ['Grand Naine (G9)', 'Robusta', 'Red Banana (Sevvazhai)', 'Nendran'], category: 'Fruits', icon: '🍌', standardDays: 330 },
  ];

  // Fetch crop logs
  const loadCropLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getCropGrowthLogs(farmerProfile?.user_id || 'usr_farmer_1');
      setCropLogs(data);
      if (data.length > 0 && !selectedLogId) {
        setSelectedLogId(data[0].id);
        const currentStage = data[0].stages[data[0].currentStageIndex] || data[0].stages[0];
        setSelectedStageId(currentStage.id);
      }
    } catch (err) {
      console.error('Failed to load crop growth logs:', err);
      showToast('Failed to load crop growth logs. Refreshing...');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCropLogs();
  }, []);

  const activeLog = cropLogs.find((l) => l.id === selectedLogId) || cropLogs[0];
  const activeStage = activeLog?.stages.find((s) => s.id === selectedStageId) || activeLog?.stages[activeLog?.currentStageIndex || 0];

  // Auto-sync active stage if active log changes
  useEffect(() => {
    if (activeLog) {
      const curStage = activeLog.stages[activeLog.currentStageIndex] || activeLog.stages[0];
      setSelectedStageId(curStage.id);
    }
  }, [selectedLogId]);

  // Update variety automatically when crop changes
  const handleCropChange = (cropName: string) => {
    setFormCropName(cropName);
    const matched = cropOptions.find((c) => c.name.toLowerCase().includes(cropName.toLowerCase()));
    if (matched && matched.varieties.length > 0) {
      setFormVariety(matched.varieties[0]);
    }
  };

  // Quick planting date preset buttons
  const setPlantingDaysAgo = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    setFormPlantingDate(d.toISOString().split('T')[0]);
  };

  // Handle create crop log
  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const newLog = await api.createCropGrowthLog({
        cropName: formCropName,
        variety: formVariety,
        plotName: formPlotName,
        plantingDate: formPlantingDate,
        sowingMethod: formSowingMethod,
        landAreaAcres: Number(formLandArea),
        notes: formNotes,
        userId: farmerProfile?.user_id || 'usr_farmer_1',
      });
      showToast(`🌱 Logged planting date for ${newLog.cropName} in "${newLog.plotName}"`);
      setIsNewLogModalOpen(false);
      setFormNotes('');
      await loadCropLogs();
      setSelectedLogId(newLog.id);
    } catch (err) {
      console.error('Failed to create crop log:', err);
      showToast('Error logging crop planting date');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle toggle task completion
  const handleToggleTask = async (stageId: string, taskId: string, currentCompleted: boolean) => {
    if (!activeLog) return;
    try {
      // Optimistic update
      const updatedLogs = cropLogs.map((log) => {
        if (log.id === activeLog.id) {
          const updatedStages = log.stages.map((stg) => {
            if (stg.id === stageId) {
              const updatedTasks = stg.tasks.map((t) => {
                if (t.id === taskId) {
                  return {
                    ...t,
                    completed: !currentCompleted,
                    completedAt: !currentCompleted ? new Date().toISOString().split('T')[0] : undefined,
                  };
                }
                return t;
              });
              return { ...stg, tasks: updatedTasks };
            }
            return stg;
          });
          return { ...log, stages: updatedStages };
        }
        return log;
      });
      setCropLogs(updatedLogs);

      await api.toggleCropGrowthTask(activeLog.id, stageId, taskId, !currentCompleted);
      showToast(!currentCompleted ? '✓ Task marked completed' : 'Task reopened');
    } catch (err) {
      console.error('Failed to toggle task:', err);
      showToast('Failed to update task status');
      loadCropLogs();
    }
  };

  // Handle delete crop log
  const handleDeleteLog = async (id: string, cropName: string) => {
    if (window.confirm(`Are you sure you want to remove the growth log for ${cropName}?`)) {
      try {
        await api.deleteCropGrowthLog(id);
        showToast(`Removed growth track for ${cropName}`);
        const remaining = cropLogs.filter((l) => l.id !== id);
        setCropLogs(remaining);
        if (remaining.length > 0) {
          setSelectedLogId(remaining[0].id);
        } else {
          setSelectedLogId(null);
        }
      } catch (err) {
        showToast('Failed to delete log');
      }
    }
  };

  // Filter crop logs
  const filteredLogs = cropLogs.filter((log) => {
    const matchesCategory =
      filterCategory === 'ALL' ||
      (filterCategory === 'READY' && log.status === 'HARVEST_READY') ||
      log.category.toUpperCase().includes(filterCategory);

    const matchesSearch =
      log.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.plotName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.variety.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Aggregate metrics
  const totalAcreage = cropLogs.reduce((acc, l) => acc + l.landAreaAcres, 0);
  const totalYieldQuintals = cropLogs.reduce((acc, l) => acc + l.targetYieldQuintals, 0);
  const harvestReadyCount = cropLogs.filter((l) => l.status === 'HARVEST_READY').length;
  const closestHarvestDays = Math.min(...cropLogs.map((l) => l.daysRemaining), 999);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-stone-900 text-white rounded-3xl p-6 sm:p-7 shadow-sm border border-emerald-800/80 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-bold tracking-wider uppercase border border-emerald-400/30 flex items-center gap-1.5">
                <Sprout className="w-3.5 h-3.5" />
                Agronomic Lifecycle Tracker
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/10 text-stone-200 text-[11px] font-medium">
                {cropLogs.length} Plots Logged
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Crop Growth & Harvest Cycle Tracker
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              Log crop planting dates, monitor expected harvest cycle milestones, check stage-specific agronomic care guides, and prepare for peak mandi dispatch.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="log-new-planting-btn"
              onClick={() => setIsNewLogModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Crop Planting Date</span>
            </button>

            <button
              onClick={loadCropLogs}
              className="p-2.5 bg-emerald-800/80 hover:bg-emerald-800 text-white rounded-xl border border-emerald-600/60 transition-colors"
              title="Refresh logs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="mt-6 pt-5 border-t border-emerald-700/50 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-emerald-950/50 border border-emerald-700/40 rounded-2xl p-3.5">
            <div className="flex items-center space-x-2 text-emerald-300 text-[11px] font-semibold mb-1">
              <Sprout className="w-3.5 h-3.5" />
              <span>Standing Acreage</span>
            </div>
            <p className="text-xl font-black text-white">{totalAcreage.toFixed(1)} <span className="text-xs font-normal text-emerald-200">Acres</span></p>
            <p className="text-[10px] text-emerald-300/80 mt-0.5">{cropLogs.length} active crop plots</p>
          </div>

          <div className="bg-emerald-950/50 border border-emerald-700/40 rounded-2xl p-3.5">
            <div className="flex items-center space-x-2 text-amber-300 text-[11px] font-semibold mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Next Harvest Window</span>
            </div>
            <p className="text-xl font-black text-amber-300">
              {closestHarvestDays !== 999 ? `${closestHarvestDays} Days` : 'N/A'}
            </p>
            <p className="text-[10px] text-stone-300 mt-0.5">
              {activeLog?.cropName || 'Tomato'}: {activeLog?.estimatedHarvestStartDate || 'Active'}
            </p>
          </div>

          <div className="bg-emerald-950/50 border border-emerald-700/40 rounded-2xl p-3.5">
            <div className="flex items-center space-x-2 text-teal-300 text-[11px] font-semibold mb-1">
              <Scale className="w-3.5 h-3.5" />
              <span>Target Farm Yield</span>
            </div>
            <p className="text-xl font-black text-white">{totalYieldQuintals.toFixed(0)} <span className="text-xs font-normal text-teal-200">Quintals</span></p>
            <p className="text-[10px] text-teal-300/80 mt-0.5">Across all registered blocks</p>
          </div>

          <div className="bg-emerald-950/50 border border-emerald-700/40 rounded-2xl p-3.5">
            <div className="flex items-center space-x-2 text-emerald-300 text-[11px] font-semibold mb-1">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Harvest Ready</span>
            </div>
            <p className="text-xl font-black text-white">
              {harvestReadyCount > 0 ? (
                <span className="text-emerald-300 flex items-center gap-1">
                  {harvestReadyCount} Plot{harvestReadyCount > 1 ? 's' : ''}
                </span>
              ) : (
                '0 Plots'
              )}
            </p>
            <p className="text-[10px] text-emerald-300/80 mt-0.5">Ready for APMC Mandi</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Selector List & Right Stage Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Crop Plot Selector Carousel / List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-700" />
                <span>Logged Crop Plots</span>
              </h2>
              <span className="text-xs font-semibold text-stone-500">{filteredLogs.length} items</span>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'VEGETABLES', label: 'Vegetables' },
                { id: 'CEREALS', label: 'Grains' },
                { id: 'OILSEEDS', label: 'Oilseeds' },
                { id: 'READY', label: 'Ready 🔔' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setFilterCategory(pill.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    filterCategory === pill.id
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Crop Plot List */}
            <div className="space-y-2.5 pt-2 max-h-[580px] overflow-y-auto pr-1">
              {filteredLogs.length === 0 ? (
                <div className="p-8 text-center bg-stone-50 rounded-xl border border-dashed border-stone-200">
                  <Sprout className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-stone-700">No crop logs match filter</p>
                  <p className="text-[11px] text-stone-500 mt-1">Log a new planting date above to start tracking!</p>
                </div>
              ) : (
                filteredLogs.map((log) => {
                  const isSelected = selectedLogId === log.id;
                  const curStage = log.stages[log.currentStageIndex] || log.stages[0];

                  return (
                    <div
                      key={log.id}
                      id={`crop-log-card-${log.id}`}
                      onClick={() => setSelectedLogId(log.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left relative ${
                        isSelected
                          ? 'bg-emerald-50/70 border-emerald-600 shadow-sm ring-1 ring-emerald-600'
                          : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2.5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shadow-xs ${
                            isSelected ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {log.cropName.toLowerCase().includes('tomato') ? '🍅' :
                             log.cropName.toLowerCase().includes('onion') ? '🧅' :
                             log.cropName.toLowerCase().includes('paddy') || log.cropName.toLowerCase().includes('rice') ? '🌾' :
                             log.cropName.toLowerCase().includes('groundnut') ? '🥜' :
                             log.cropName.toLowerCase().includes('banana') ? '🍌' :
                             log.cropName.toLowerCase().includes('maize') ? '🌽' : '🌱'}
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <h3 className="text-xs font-bold text-stone-900">{log.cropName}</h3>
                              {log.status === 'HARVEST_READY' && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500 text-stone-950 font-black text-[9px] uppercase">
                                  Harvest Ready
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-stone-500 font-medium truncate max-w-[170px]">{log.plotName}</p>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                          {log.landAreaAcres} Ac
                        </span>
                      </div>

                      {/* Progress Bar in Card */}
                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-emerald-800 truncate max-w-[150px]">
                            {curStage.stageShortName || curStage.stageName}
                          </span>
                          <span className="font-bold text-stone-900">{log.overallProgressPercent}%</span>
                        </div>
                        <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              log.overallProgressPercent >= 90 ? 'bg-amber-500' : 'bg-emerald-600'
                            }`}
                            style={{ width: `${log.overallProgressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Card Footer Dates & Action */}
                      <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-500">
                        <span>Planted: {log.plantingDate} ({log.daysElapsed}d ago)</span>
                        <span className="font-bold text-stone-800">{log.daysRemaining}d left</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Sowing Presets */}
            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-left space-y-1.5">
              <p className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Multi-Plot Harvest Synchronizer</span>
              </p>
              <p className="text-[10px] text-emerald-800 leading-relaxed">
                Log distinct sowing dates per field plot to stagger harvesting and avoid APMC glut price crashes.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Crop Interactive Stage Progress Visualization & Agronomic Guide */}
        <div className="lg:col-span-8 space-y-5">
          {activeLog ? (
            <>
              {/* Active Crop Detail Hero Card */}
              <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl font-bold shadow-xs">
                      {activeLog.cropName.toLowerCase().includes('tomato') ? '🍅' :
                       activeLog.cropName.toLowerCase().includes('onion') ? '🧅' :
                       activeLog.cropName.toLowerCase().includes('paddy') || activeLog.cropName.toLowerCase().includes('rice') ? '🌾' :
                       activeLog.cropName.toLowerCase().includes('groundnut') ? '🥜' :
                       activeLog.cropName.toLowerCase().includes('banana') ? '🍌' :
                       activeLog.cropName.toLowerCase().includes('maize') ? '🌽' : '🌱'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="text-lg font-bold text-stone-900">{activeLog.cropName}</h2>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                          {activeLog.variety}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                          {activeLog.category}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        <span className="font-semibold text-stone-700">{activeLog.plotName}</span> • {activeLog.landAreaAcres} Acres • {activeLog.sowingMethod}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingLog(activeLog);
                        setIsEditModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors flex items-center space-x-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Log</span>
                    </button>
                    <button
                      onClick={() => handleDeleteLog(activeLog.id, activeLog.cropName)}
                      className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Overall Timeline Progress Meter */}
                <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Overall Growth Cycle</span>
                      <p className="text-sm font-bold text-stone-900">
                        Day <span className="text-emerald-700 text-base">{activeLog.daysElapsed}</span> of {activeLog.totalCycleDurationDays} Days Total
                      </p>
                    </div>
                    <div className="text-left sm:text-right space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Estimated Harvest Window</span>
                      <p className="text-xs font-bold text-stone-900 flex items-center sm:justify-end gap-1.5 text-emerald-800">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{activeLog.estimatedHarvestStartDate} to {activeLog.estimatedHarvestEndDate}</span>
                      </p>
                    </div>
                  </div>

                  {/* Visual Timeline Bar */}
                  <div className="space-y-1.5">
                    <div className="w-full bg-stone-200 rounded-full h-3 overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-700 transition-all duration-700 relative"
                        style={{ width: `${activeLog.overallProgressPercent}%` }}
                      >
                        <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/60 rounded-full animate-pulse" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-stone-500">
                      <span>Planted: {activeLog.plantingDate}</span>
                      <span className="font-bold text-emerald-800">{activeLog.overallProgressPercent}% Completed ({activeLog.daysRemaining} Days Remaining)</span>
                      <span>Target Yield: {activeLog.targetYieldQuintals} Quintals</span>
                    </div>
                  </div>
                </div>

                {/* Expected Harvest Cycle Stages: Visual Stepper Roadmap (Core Feature) */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-emerald-700" />
                      <span>5-Stage Agronomic Growth Lifecycle</span>
                    </h3>
                    <span className="text-[11px] text-stone-500">Click any stage to view care guides</span>
                  </div>

                  {/* Interactive Stepper Nodes */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                    {activeLog.stages.map((stage, idx) => {
                      const isCurActive = stage.status === 'IN_PROGRESS';
                      const isDone = stage.status === 'COMPLETED';
                      const isSelected = selectedStageId === stage.id;

                      return (
                        <div
                          key={stage.id}
                          id={`stage-card-${stage.id}`}
                          onClick={() => setSelectedStageId(stage.id)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between text-left ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-600/30 shadow-xs'
                              : isCurActive
                              ? 'border-amber-400 bg-amber-50/50 hover:bg-amber-50'
                              : isDone
                              ? 'border-emerald-200 bg-stone-50/80 hover:bg-stone-100'
                              : 'border-stone-200 bg-white hover:bg-stone-50 opacity-80'
                          }`}
                        >
                          {/* Top indicator tag */}
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-stone-400">0{idx + 1}</span>
                            {isDone ? (
                              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            ) : isCurActive ? (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500 text-stone-950 font-black text-[9px] uppercase animate-pulse">
                                Active
                              </span>
                            ) : (
                              <span className="w-4 h-4 rounded-full border border-stone-300 flex items-center justify-center text-[9px] text-stone-400">
                                <Clock className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-stone-900 leading-snug">
                              {stage.stageShortName || stage.stageName}
                            </h4>
                            <p className="text-[10px] text-stone-500 font-medium">
                              Days {stage.startDay}-{stage.endDay} ({stage.durationDays}d)
                            </p>
                          </div>

                          {/* Stage Progress Mini Bar */}
                          <div className="mt-3 pt-2 border-t border-stone-200/60">
                            <div className="w-full bg-stone-200 rounded-full h-1 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  isDone ? 'bg-emerald-600' : isCurActive ? 'bg-amber-500' : 'bg-transparent'
                                }`}
                                style={{ width: `${stage.progressPercent}%` }}
                              />
                            </div>
                            <p className="text-[9px] text-stone-500 mt-1 truncate">
                              {stage.startDate}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Selected Stage Comprehensive Agronomic Care & Task Checklist */}
              {activeStage && (
                <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Stage {activeStage.stageOrder} of 5
                        </span>
                        <h3 className="text-base font-bold text-stone-900">{activeStage.stageName}</h3>
                      </div>
                      <p className="text-xs text-stone-500">
                        Active Window: {activeStage.startDate} to {activeStage.endDate} ({activeStage.durationDays} Days Duration)
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        activeStage.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : activeStage.status === 'IN_PROGRESS'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-100 text-stone-600'
                      }`}>
                        {activeStage.status === 'COMPLETED' ? '✓ Stage Completed' : activeStage.status === 'IN_PROGRESS' ? '⚡ Currently in Progress' : '⏳ Upcoming Milestone'}
                      </span>
                    </div>
                  </div>

                  {/* Stage Agronomic Advisory Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Irrigation & Water Management */}
                    <div className="p-3.5 rounded-xl bg-sky-50/60 border border-sky-200/80 text-left space-y-1.5">
                      <div className="flex items-center space-x-2 text-sky-800 font-bold text-xs">
                        <Droplets className="w-4 h-4 text-sky-600" />
                        <span>Irrigation & Soil Moisture Protocol</span>
                      </div>
                      <p className="text-xs text-stone-700 leading-relaxed">
                        {activeStage.agronomicGuidelines.watering}
                      </p>
                    </div>

                    {/* Nutrient & Bio-Fertilizer Focus */}
                    <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-left space-y-1.5">
                      <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                        <FlaskConical className="w-4 h-4 text-emerald-600" />
                        <span>Nutrient & Bio-Fertilizer Schedule</span>
                      </div>
                      <p className="text-xs text-stone-700 leading-relaxed">
                        {activeStage.agronomicGuidelines.nutrientFocus}
                      </p>
                    </div>

                    {/* Pest & Disease Scouting Watchlist */}
                    <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200/80 text-left space-y-1.5">
                      <div className="flex items-center space-x-2 text-rose-800 font-bold text-xs">
                        <Bug className="w-4 h-4 text-rose-600" />
                        <span>Critical Pest & Disease Watchlist</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {activeStage.agronomicGuidelines.pestThreats.map((pest, pIdx) => (
                          <span key={pIdx} className="px-2 py-0.5 rounded-md bg-white text-rose-900 text-[11px] font-semibold border border-rose-200 shadow-2xs">
                            ⚠️ {pest}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Critical Agronomic Check */}
                    <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-left space-y-1.5">
                      <div className="flex items-center space-x-2 text-amber-800 font-bold text-xs">
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        <span>Agronomist Inspection Milestone</span>
                      </div>
                      <p className="text-xs text-stone-700 leading-relaxed font-medium">
                        {activeStage.agronomicGuidelines.criticalCheck}
                      </p>
                    </div>
                  </div>

                  {/* Interactive Actionable Tasks for this Stage */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>Stage {activeStage.stageOrder} Actionable Farm Tasks</span>
                      </h4>
                      <span className="text-[11px] text-stone-500">
                        {activeStage.tasks.filter((t) => t.completed).length} of {activeStage.tasks.length} Completed
                      </span>
                    </div>

                    <div className="space-y-2">
                      {activeStage.tasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => handleToggleTask(activeStage.id, task.id, task.completed)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 text-left ${
                            task.completed
                              ? 'bg-stone-50 border-stone-200 opacity-75'
                              : 'bg-white border-stone-200 hover:border-emerald-400 hover:shadow-2xs'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                              task.completed
                                ? 'bg-emerald-600 text-white'
                                : 'border-2 border-stone-300 hover:border-emerald-500'
                            }`}>
                              {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <div className="space-y-0.5">
                              <p className={`text-xs font-bold ${task.completed ? 'line-through text-stone-500' : 'text-stone-900'}`}>
                                {task.title}
                              </p>
                              <p className="text-[11px] text-stone-600 leading-relaxed">{task.description}</p>
                              {task.recommendedInput && (
                                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                                  📦 Recommended Formulation: {task.recommendedInput}
                                </span>
                              )}
                            </div>
                          </div>

                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 whitespace-nowrap">
                            Day {task.dayTarget}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pre-Harvest & Market Dispatch Quick Actions */}
                  <div className="p-4 bg-gradient-to-r from-stone-900 to-emerald-950 text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-amber-300">Live Mandi Benchmark</span>
                        <span className="text-xs font-black text-white">
                          ₹{activeLog.currentMandiRateINR || 2450} / Quintal
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-300">
                        Projected gross realization for {activeLog.targetYieldQuintals} Quintals: <span className="font-bold text-emerald-300">₹{((activeLog.currentMandiRateINR || 2450) * activeLog.targetYieldQuintals).toLocaleString('en-IN')}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setActiveFarmerTab('market')}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors flex items-center space-x-1 cursor-pointer"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>Set Price Alert</span>
                      </button>
                      <button
                        onClick={() => setActiveFarmerTab('warehouses')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition-colors flex items-center space-x-1 cursor-pointer"
                      >
                        <Warehouse className="w-3.5 h-3.5" />
                        <span>Locate Cold Store</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center space-y-4">
              <Sprout className="w-12 h-12 text-emerald-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-stone-900">No Crop Growth Track Selected</h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  Select a plot from the left sidebar or click the button below to log your crop planting date and calculate expected harvest cycle milestones.
                </p>
              </div>
              <button
                onClick={() => setIsNewLogModalOpen(true)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center space-x-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Log New Crop Planting Date</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Log New Crop Planting Date */}
      {isNewLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-5 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">Log Crop Planting Date</h3>
                  <p className="text-[11px] text-stone-500">Calculate harvest milestones & agronomic timeline</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewLogModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLog} className="space-y-4">
              {/* Crop Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Crop Commodity</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {cropOptions.map((crop) => (
                    <button
                      type="button"
                      key={crop.name}
                      onClick={() => handleCropChange(crop.name)}
                      className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        formCropName.toLowerCase() === crop.name.toLowerCase()
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600'
                          : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <span className="text-xl mb-1">{crop.icon}</span>
                      <div>
                        <p className="text-xs font-bold leading-tight">{crop.name}</p>
                        <p className="text-[10px] text-stone-500">{crop.standardDays} Days</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Variety Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Variety / Hybrid Cultivar</label>
                <input
                  type="text"
                  required
                  value={formVariety}
                  onChange={(e) => setFormVariety(e.target.value)}
                  placeholder="e.g. US-440 Hybrid / CO-5 Shallot"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Plot Name & Acreage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Field Plot Name</label>
                  <input
                    type="text"
                    required
                    value={formPlotName}
                    onChange={(e) => setFormPlotName(e.target.value)}
                    placeholder="e.g. Plot A - North Field"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Land Area (Acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="100"
                    required
                    value={formLandArea}
                    onChange={(e) => setFormLandArea(parseFloat(e.target.value) || 1)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Planting Date & Presets */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Planting / Sowing Date</label>
                <input
                  type="date"
                  required
                  value={formPlantingDate}
                  onChange={(e) => setFormPlantingDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                {/* Date presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-stone-500 self-center">Presets:</span>
                  {[
                    { label: 'Today', days: 0 },
                    { label: '15d ago', days: 15 },
                    { label: '30d ago', days: 30 },
                    { label: '45d ago', days: 45 },
                    { label: '60d ago', days: 60 },
                  ].map((preset) => (
                    <button
                      type="button"
                      key={preset.label}
                      onClick={() => setPlantingDaysAgo(preset.days)}
                      className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-semibold transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sowing Method */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Sowing / Planting Method</label>
                <select
                  value={formSowingMethod}
                  onChange={(e) => setFormSowingMethod(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                >
                  <option value="Drip Fertigated Bed">Drip Fertigated Raised Bed</option>
                  <option value="Nursery Bed Transplanting">Nursery Bed Transplanting</option>
                  <option value="Furrow & Ridge">Furrow & Ridge Irrigation</option>
                  <option value="Direct Seed Sowing">Direct Seed Sowing</option>
                  <option value="Broadcasting">Broadcasting</option>
                </select>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Agronomic Notes / Seed Treatment</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Treated with Pseudomonas fluorescens. Staking installed."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setIsNewLogModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmitting ? 'Calculating Timeline...' : 'Save & Calculate Stages'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Crop Log */}
      {isEditModalOpen && editingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">Update Growth Log</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Field Plot Name</label>
                <input
                  type="text"
                  value={editingLog.plotName}
                  onChange={(e) => setEditingLog({ ...editingLog, plotName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Planting Date</label>
                <input
                  type="date"
                  value={editingLog.plantingDate}
                  onChange={(e) => setEditingLog({ ...editingLog, plantingDate: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Acreage</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingLog.landAreaAcres}
                  onChange={(e) => setEditingLog({ ...editingLog, landAreaAcres: parseFloat(e.target.value) || 1 })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Status</label>
                <select
                  value={editingLog.status}
                  onChange={(e) => setEditingLog({ ...editingLog, status: e.target.value as any })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white"
                >
                  <option value="ACTIVE">ACTIVE (Standing Crop)</option>
                  <option value="HARVEST_READY">HARVEST_READY (Peak Picking)</option>
                  <option value="HARVESTED">HARVESTED (Completed)</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-end space-x-2">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-stone-600 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await api.updateCropGrowthLog(editingLog.id, editingLog);
                    showToast('Crop log updated successfully');
                    setIsEditModalOpen(false);
                    loadCropLogs();
                  } catch (err) {
                    showToast('Failed to update log');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
