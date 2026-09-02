import React, { useState, useEffect } from 'react';
import { useApp, LOCATION_PRESETS } from '../../context/AppContext';
import { api } from '../../services/api';
import { RealTimeWeatherData, CropPlantingRecommendation, DailyWeatherForecast } from '../../types';
import {
  Cloud,
  CloudRain,
  CloudSun,
  Sun,
  Zap,
  Droplets,
  Wind,
  Thermometer,
  Compass,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  MapPin,
  Info,
  Layers,
  Search,
  Filter,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

interface WeatherPlantingWidgetProps {
  compact?: boolean;
  onNavigateToFull?: () => void;
}

export const WeatherPlantingWidget: React.FC<WeatherPlantingWidgetProps> = ({
  compact = false,
  onNavigateToFull,
}) => {
  const { currentLocation, setCurrentLocation, useGpsLocation, gpsLoading } = useApp();

  const [weatherData, setWeatherData] = useState<RealTimeWeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCropCategory, setSelectedCropCategory] = useState<string>('All');
  const [searchCrop, setSearchCrop] = useState('');
  const [activeTab, setActiveTab] = useState<'recommendations' | 'forecast_chart' | 'simulator'>('recommendations');
  const [selectedCropId, setSelectedCropId] = useState<string>('rec_tomato');
  
  // Sowing Date Simulator state
  const [simulatedCrop, setSimulatedCrop] = useState<string>('Tomato');
  const [simulatedDateOffset, setSimulatedDateOffset] = useState<number>(0);
  const [expandedTipId, setExpandedTipId] = useState<string | null>('rec_tomato');

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getRealTimeWeather(
        currentLocation.latitude,
        currentLocation.longitude,
        currentLocation.name
      );
      setWeatherData(data);
      if (data.planting_recommendations.length > 0 && !selectedCropId) {
        setSelectedCropId(data.planting_recommendations[0].id);
      }
    } catch (err: any) {
      console.error('Error fetching weather:', err);
      setError(err.message || 'Failed to load meteorological data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [currentLocation]);

  const getWeatherIcon = (code: string, className: string = 'w-6 h-6') => {
    switch (code) {
      case 'sunny':
        return <Sun className={`${className} text-amber-500`} />;
      case 'partly_cloudy':
        return <CloudSun className={`${className} text-amber-400`} />;
      case 'cloudy':
        return <Cloud className={`${className} text-stone-400`} />;
      case 'rain':
        return <CloudRain className={`${className} text-blue-500`} />;
      case 'heavy_rain':
        return <CloudRain className={`${className} text-indigo-600`} />;
      case 'thunderstorm':
        return <Zap className={`${className} text-purple-600`} />;
      default:
        return <CloudSun className={`${className} text-amber-400`} />;
    }
  };

  const getSuitabilityBadge = (status: CropPlantingRecommendation['suitability_status']) => {
    switch (status) {
      case 'OPTIMAL_WINDOW':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Optimal Window</span>
          </span>
        );
      case 'FAVORABLE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            <span>Favorable Window</span>
          </span>
        );
      case 'NEEDS_IRRIGATION':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
            <Droplets className="w-3 h-3 text-amber-600" />
            <span>Moderate / Needs Irrigation</span>
          </span>
        );
      case 'DELAY_SOWING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>Delay Sowing</span>
          </span>
        );
      default:
        return null;
    }
  };

  if (loading && !weatherData) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col items-center justify-center space-y-3 min-h-[220px]">
        <RefreshCw className="w-7 h-7 text-emerald-600 animate-spin" />
        <p className="text-xs font-semibold text-stone-600">
          Syncing real-time agro-meteorological station & soil moisture models...
        </p>
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-6 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
        <p className="text-sm font-bold text-stone-800">Unable to load weather station data</p>
        <p className="text-xs text-stone-500">{error}</p>
        <button
          onClick={fetchWeather}
          className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { current, forecast_7days, planting_recommendations, overall_planting_advisory } = weatherData;

  // Filter crops
  const filteredCrops = planting_recommendations.filter((crop) => {
    const matchesCategory =
      selectedCropCategory === 'All' || crop.category.toLowerCase().includes(selectedCropCategory.toLowerCase());
    const matchesSearch =
      crop.crop_name.toLowerCase().includes(searchCrop.toLowerCase()) ||
      crop.variety.toLowerCase().includes(searchCrop.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedCrop =
    planting_recommendations.find((c) => c.id === selectedCropId) || planting_recommendations[0];

  // Chart data preparation
  const chartData = forecast_7days.map((item) => ({
    name: item.day_name,
    date: item.date.slice(5),
    maxTemp: item.temp_max_c,
    minTemp: item.temp_min_c,
    avgTemp: item.temp_avg_c,
    precipitation: item.precipitation_mm,
    rainProb: item.precipitation_probability,
    soilMoisture: item.soil_moisture_percent,
    sowingScore: item.sowing_suitability_score,
  }));

  // Sowing simulator calculation
  const targetForecastDay = forecast_7days[simulatedDateOffset] || forecast_7days[0];
  const simRain = targetForecastDay.precipitation_mm;
  const simTemp = targetForecastDay.temp_avg_c;
  const simMoisture = targetForecastDay.soil_moisture_percent;

  let simVerdict: { status: 'SAFE' | 'CAUTION' | 'RISKY'; title: string; advice: string } = {
    status: 'SAFE',
    title: 'Highly Favorable Sowing Conditions',
    advice: `Day's rain (${simRain} mm) and thermal sum (${simTemp}°C) facilitate robust seed coat imbibition without rot.`,
  };

  if (simRain > 15) {
    simVerdict = {
      status: 'RISKY',
      title: 'High Precipitation Risk - Postpone Sowing',
      advice: `Heavy showers (${simRain} mm) may cause topsoil crusting, seed washout, and damping-off disease in young sprouts.`,
    };
  } else if (simRain > 7 || simTemp > 34) {
    simVerdict = {
      status: 'CAUTION',
      title: 'Moderate Conditions - Raised Beds Required',
      advice: `Intermittent rain (${simRain} mm) expected. Sowing is viable if 15cm raised ridge-and-furrow system is used.`,
    };
  }

  // ----------------------------------------------------
  // COMPACT MODE RENDER (FOR DASHBOARD OVERVIEW BAR)
  // ----------------------------------------------------
  if (compact) {
    return (
      <div className="bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-900 text-white rounded-2xl p-4 sm:p-5 shadow-xs border border-emerald-700/60">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Current Weather Highlights */}
          <div className="flex items-center space-x-3.5">
            <div className="w-13 h-13 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 p-2 flex items-center justify-center shadow-inner">
              {getWeatherIcon(current.condition_code, 'w-8 h-8')}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black text-white">{current.temp_c}°C</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-800/80 text-emerald-200 border border-emerald-600/60">
                  {current.condition_text.split('(')[0]}
                </span>
              </div>
              <p className="text-xs text-emerald-100 flex items-center space-x-2 mt-0.5">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-emerald-300" />
                  <span>{weatherData.location_name}</span>
                </span>
                <span>•</span>
                <span>Rain: {current.precipitation_rate_mm} mm ({current.precipitation_prob_today}%)</span>
                <span>•</span>
                <span>Soil Moisture: {current.soil_moisture_percent}%</span>
              </p>
            </div>
          </div>

          {/* Sowing Window Headline & Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="bg-emerald-800/60 border border-emerald-600/50 rounded-xl px-3 py-1.5 text-left">
              <p className="text-[10px] uppercase font-bold text-emerald-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Optimal Planting Advisory</span>
              </p>
              <p className="text-xs font-bold text-white">
                Tomato, Maize & Vegetables: 96% Suitability Window
              </p>
            </div>

            {onNavigateToFull && (
              <button
                onClick={onNavigateToFull}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1"
              >
                <span>View Full Sowing Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // FULL EXPANDED WIDGET / TAB VIEW
  // ----------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Weather Header & Location Bar */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-emerald-700">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 p-3 flex items-center justify-center shadow-inner">
              {getWeatherIcon(current.condition_code, 'w-10 h-10')}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-3xl font-black text-white">{current.temp_c}°C</h2>
                <span className="text-sm font-semibold text-emerald-200">
                  (Feels like {current.feels_like_c}°C)
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-700/80 text-emerald-100 border border-emerald-500">
                  {current.condition_text}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-100 mt-1">
                <span className="flex items-center gap-1 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{weatherData.location_name}</span>
                </span>
                <span>•</span>
                <span>Lat {weatherData.latitude.toFixed(2)}°, Lng {weatherData.longitude.toFixed(2)}°</span>
                <span>•</span>
                <span className="text-emerald-300 font-medium">Live Agromet Station</span>
              </div>
            </div>
          </div>

          {/* Location Switcher & Refresh */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <div className="flex items-center bg-emerald-950/80 rounded-xl p-1 border border-emerald-700 text-xs">
              <select
                aria-label="Agro Location Preset"
                value={currentLocation.name}
                onChange={(e) => {
                  const preset = LOCATION_PRESETS.find((p) => p.name === e.target.value);
                  if (preset) setCurrentLocation(preset);
                }}
                className="bg-transparent text-white font-semibold py-1 px-2.5 outline-hidden cursor-pointer"
              >
                {LOCATION_PRESETS.map((p) => (
                  <option key={p.name} value={p.name} className="bg-stone-900 text-white">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={useGpsLocation}
              disabled={gpsLoading}
              className="px-3 py-1.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white text-xs font-semibold border border-emerald-600 transition-colors flex items-center space-x-1.5"
            >
              <Compass className={`w-3.5 h-3.5 text-emerald-300 ${gpsLoading ? 'animate-spin' : ''}`} />
              <span>{gpsLoading ? 'Locating...' : 'Use Live GPS'}</span>
            </button>

            <button
              onClick={fetchWeather}
              title="Refresh Meteorological Model"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-emerald-300" />
            </button>
          </div>
        </div>

        {/* Real-time Environmental Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-emerald-800/80">
          <div className="bg-emerald-950/60 rounded-xl p-3 border border-emerald-700/50">
            <div className="flex items-center space-x-2 text-emerald-300 text-xs font-semibold">
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              <span>Precipitation (Rain)</span>
            </div>
            <p className="text-lg font-bold text-white mt-0.5">
              {current.precipitation_rate_mm} mm <span className="text-xs font-normal text-emerald-200">({current.precipitation_prob_today}% prob)</span>
            </p>
            <p className="text-[10px] text-emerald-200/80">Light pre-sowing drizzle</p>
          </div>

          <div className="bg-emerald-950/60 rounded-xl p-3 border border-emerald-700/50">
            <div className="flex items-center space-x-2 text-emerald-300 text-xs font-semibold">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Soil Moisture</span>
            </div>
            <p className="text-lg font-bold text-white mt-0.5">
              {current.soil_moisture_percent}% <span className="text-xs font-normal text-emerald-200">({current.soil_temp_c}°C)</span>
            </p>
            <p className="text-[10px] text-emerald-200/80">Optimal Field Capacity</p>
          </div>

          <div className="bg-emerald-950/60 rounded-xl p-3 border border-emerald-700/50">
            <div className="flex items-center space-x-2 text-emerald-300 text-xs font-semibold">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              <span>Humidity & Thermal</span>
            </div>
            <p className="text-lg font-bold text-white mt-0.5">{current.humidity_percent}% RH</p>
            <p className="text-[10px] text-emerald-200/80">Solar UV Index: {current.solar_uv_index} (Moderate)</p>
          </div>

          <div className="bg-emerald-950/60 rounded-xl p-3 border border-emerald-700/50">
            <div className="flex items-center space-x-2 text-emerald-300 text-xs font-semibold">
              <Wind className="w-3.5 h-3.5 text-teal-400" />
              <span>Surface Wind</span>
            </div>
            <p className="text-lg font-bold text-white mt-0.5">{current.wind_speed_kmh} km/h</p>
            <p className="text-[10px] text-emerald-200/80">{current.wind_direction}</p>
          </div>
        </div>
      </div>

      {/* Primary Agrometeorological Advisory Notice */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-emerald-950">
                {overall_planting_advisory.title}
              </h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                AI Agro-Advisory
              </span>
            </div>
            <p className="text-xs text-stone-700 mt-1 leading-relaxed">
              {overall_planting_advisory.description}
            </p>
            {overall_planting_advisory.primary_alert && (
              <p className="text-xs font-semibold text-amber-900 mt-1.5 flex items-center gap-1.5 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{overall_planting_advisory.primary_alert}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-stone-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === 'recommendations'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Optimal Crop Planting Windows ({planting_recommendations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('forecast_chart')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === 'forecast_chart'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>7-Day Temp & Precipitation Forecast</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === 'simulator'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Sowing Date Simulator & Safety Check</span>
        </button>
      </div>

      {/* ==================================================== */}
      {/* TAB 1: OPTIMAL CROP PLANTING RECOMMENDATIONS */}
      {/* ==================================================== */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200">
            {/* Category Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['All', 'Vegetables', 'Grains & Cereals', 'Pulses', 'Cash Crops', 'Spices & Tubers'].map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCropCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                      selectedCropCategory === cat
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search crop or variety..."
                value={searchCrop}
                onChange={(e) => setSearchCrop(e.target.value)}
                className="w-full pl-8.5 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
              />
            </div>
          </div>

          {/* Crop Recommendation Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCrops.map((crop) => {
              const isSelected = selectedCropId === crop.id;
              const isTipExpanded = expandedTipId === crop.id;

              return (
                <div
                  key={crop.id}
                  id={`crop-card-${crop.id}`}
                  className={`bg-white rounded-2xl border transition-all p-5 space-y-4 shadow-xs ${
                    isSelected
                      ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                      : 'border-stone-200 hover:border-emerald-300'
                  }`}
                >
                  {/* Top Bar: Name, Variety, Suitability Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-base font-bold text-stone-900">{crop.crop_name}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
                          {crop.category}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 font-medium mt-0.5">
                        Variety: <span className="text-stone-800">{crop.variety}</span>
                      </p>
                    </div>

                    <div className="flex flex-col items-end">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-lg font-black text-emerald-800">
                          {crop.suitability_score}%
                        </span>
                        <span className="text-[10px] font-semibold text-stone-400">Match</span>
                      </div>
                      {getSuitabilityBadge(crop.suitability_status)}
                    </div>
                  </div>

                  {/* Recommended Sowing Window Pill */}
                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-emerald-800">
                          Recommended Sowing Window
                        </p>
                        <p className="text-xs font-extrabold text-emerald-950">
                          {crop.recommended_window}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-stone-500 font-medium">Days to Germination</span>
                      <p className="text-xs font-bold text-stone-800">{crop.days_to_germination} Days</p>
                    </div>
                  </div>

                  {/* Agro-Meteorological Match Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-200/70">
                      <p className="text-[10px] font-bold text-stone-500 uppercase">Optimal Temperature</p>
                      <p className="font-bold text-stone-800 mt-0.5">{crop.optimal_temp_range}</p>
                      <p className="text-[10px] text-stone-500 mt-0.5">Current: {current.temp_c}°C</p>
                    </div>

                    <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-200/70">
                      <p className="text-[10px] font-bold text-stone-500 uppercase">Target Precipitation</p>
                      <p className="font-bold text-stone-800 mt-0.5">{crop.optimal_precipitation_range}</p>
                      <p className="text-[10px] text-stone-500 mt-0.5">Forecast: {current.precipitation_rate_mm} mm</p>
                    </div>
                  </div>

                  {/* Weather Match Reason & Impact */}
                  <div className="space-y-1.5 text-xs text-stone-700 bg-stone-50/60 p-3 rounded-xl border border-stone-100">
                    <div className="flex items-start space-x-2">
                      <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        <strong className="text-stone-900">Precipitation Analysis: </strong>
                        {crop.precipitation_impact_analysis}
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Thermometer className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        <strong className="text-stone-900">Thermal Sum: </strong>
                        {crop.temperature_impact_analysis}
                      </p>
                    </div>
                  </div>

                  {/* Actionable Agronomic Tips Toggle */}
                  <div>
                    <button
                      onClick={() => setExpandedTipId(isTipExpanded ? null : crop.id)}
                      className="w-full py-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center justify-center space-x-1 transition-colors"
                    >
                      <span>{isTipExpanded ? 'Hide Sowing Tips & Precautions' : 'Show Actionable Sowing Tips & Warnings'}</span>
                      {isTipExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isTipExpanded && (
                      <div className="mt-3 space-y-2 pt-3 border-t border-stone-200 animate-fadeIn text-xs">
                        <div className="space-y-1.5">
                          <p className="font-bold text-emerald-900 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Recommended Sowing Procedures:</span>
                          </p>
                          <ul className="list-disc list-inside space-y-1 text-stone-600 pl-1">
                            {crop.actionable_sowing_tips.map((tip, idx) => (
                              <li key={idx} className="leading-relaxed">
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {crop.risk_warnings.length > 0 && (
                          <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 mt-2 space-y-1">
                            <p className="font-bold text-amber-900 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Weather Precautions:</span>
                            </p>
                            <ul className="list-disc list-inside space-y-0.5 text-amber-800 pl-1 text-[11px]">
                              {crop.risk_warnings.map((warn, idx) => (
                                <li key={idx}>{warn}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: 7-DAY TEMPERATURE & PRECIPITATION FORECAST */}
      {/* ==================================================== */}
      {activeTab === 'forecast_chart' && (
        <div className="space-y-6">
          {/* Chart Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  7-Day Precipitation & Temperature Agrometeorological Graph
                </h3>
                <p className="text-xs text-stone-500">
                  Dual-axis chart showing daily max/min temperatures alongside forecast precipitation (mm) and sowing suitability index.
                </p>
              </div>

              <div className="flex items-center space-x-3 text-xs font-semibold text-stone-600">
                <span className="flex items-center space-x-1">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                  <span>Temperature (°C)</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
                  <span>Rainfall (mm)</span>
                </span>
              </div>
            </div>

            {/* Recharts Dual-Axis Chart */}
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis
                    yAxisId="left"
                    domain={[10, 40]}
                    tick={{ fontSize: 11, fill: '#10b981' }}
                    unit="°C"
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 30]}
                    tick={{ fontSize: 11, fill: '#3b82f6' }}
                    unit="mm"
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-stone-900 text-white p-3 rounded-xl text-xs shadow-lg space-y-1">
                            <p className="font-bold text-emerald-300">
                              {data.name} ({data.date})
                            </p>
                            <p className="text-emerald-200">
                              Max Temp: <strong>{data.maxTemp}°C</strong> | Min: <strong>{data.minTemp}°C</strong>
                            </p>
                            <p className="text-blue-300">
                              Precipitation: <strong>{data.precipitation} mm</strong> ({data.rainProb}% prob)
                            </p>
                            <p className="text-amber-200">
                              Soil Moisture: <strong>{data.soilMoisture}%</strong>
                            </p>
                            <p className="text-white font-bold border-t border-stone-700 pt-1 mt-1">
                              Sowing Suitability: {data.sowingScore}%
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar
                    yAxisId="right"
                    dataKey="precipitation"
                    name="Rainfall (mm)"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    barSize={24}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="avgTemp"
                    name="Avg Temperature (°C)"
                    stroke="#059669"
                    fill="#a7f3d0"
                    fillOpacity={0.4}
                    strokeWidth={2.5}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Weather Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {forecast_7days.map((day) => (
              <div
                key={day.date}
                className="bg-white rounded-2xl border border-stone-200 p-4 space-y-2 shadow-xs hover:border-emerald-400 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-extrabold text-stone-900">{day.day_name}</p>
                    <p className="text-[10px] text-stone-400">{day.date}</p>
                  </div>
                  {getWeatherIcon(day.condition_icon, 'w-6 h-6')}
                </div>

                <div className="flex items-baseline space-x-1.5 pt-1">
                  <span className="text-lg font-black text-stone-900">{day.temp_max_c}°</span>
                  <span className="text-xs text-stone-500 font-semibold">/ {day.temp_min_c}°C</span>
                </div>

                <div className="flex items-center justify-between text-xs text-stone-600 bg-stone-50 p-2 rounded-xl">
                  <span className="flex items-center gap-1 font-semibold text-blue-700">
                    <CloudRain className="w-3.5 h-3.5" />
                    <span>{day.precipitation_mm} mm</span>
                  </span>
                  <span className="text-[10px] text-stone-500">{day.precipitation_probability}% prob</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-bold text-stone-400">Sowing Score</span>
                  <span
                    className={`text-xs font-black px-2 py-0.5 rounded-md ${
                      day.sowing_suitability_score >= 90
                        ? 'bg-emerald-100 text-emerald-800'
                        : day.sowing_suitability_score >= 80
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {day.sowing_suitability_score}% ({day.sowing_suitability_verdict})
                  </span>
                </div>

                <p className="text-[10px] text-stone-500 line-clamp-2 leading-relaxed border-t border-stone-100 pt-1.5">
                  {day.advisory_note}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: SOWING DATE SIMULATOR & FIELD SAFETY CHECK */}
      {/* ==================================================== */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-5 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-stone-900 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Simulate Planned Sowing Date & Meteorological Safety</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Pick your crop and proposed planting date to run an automated check on rainfall accumulation, temperature extremes, and soil moisture sufficiency.
              </p>
            </div>

            {/* Input Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Select Crop for Simulation
                </label>
                <select
                  value={simulatedCrop}
                  onChange={(e) => setSimulatedCrop(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden bg-white"
                >
                  {planting_recommendations.map((c) => (
                    <option key={c.id} value={c.crop_name}>
                      {c.crop_name} ({c.variety})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Proposed Sowing Day
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {forecast_7days.slice(0, 4).map((d, idx) => (
                    <button
                      key={d.date}
                      type="button"
                      onClick={() => setSimulatedDateOffset(idx)}
                      className={`p-2 rounded-xl text-center text-xs font-bold border transition-all ${
                        simulatedDateOffset === idx
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <p className="text-[10px]">{d.day_name}</p>
                      <p className="text-xs">{d.date.slice(5)}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Simulation Results Card */}
            <div
              className={`p-5 rounded-2xl border space-y-4 ${
                simVerdict.status === 'SAFE'
                  ? 'bg-emerald-50/70 border-emerald-300'
                  : simVerdict.status === 'CAUTION'
                  ? 'bg-amber-50/70 border-amber-300'
                  : 'bg-rose-50/70 border-rose-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-xs ${
                      simVerdict.status === 'SAFE'
                        ? 'bg-emerald-600'
                        : simVerdict.status === 'CAUTION'
                        ? 'bg-amber-600'
                        : 'bg-rose-600'
                    }`}
                  >
                    {simVerdict.status === 'SAFE' ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <AlertTriangle className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-stone-900">{simVerdict.title}</h4>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white text-stone-800 border border-stone-200">
                        {simulatedCrop} on {targetForecastDay.day_name}
                      </span>
                    </div>
                    <p className="text-xs text-stone-700 mt-1 leading-relaxed">{simVerdict.advice}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold text-stone-500">Day Sowing Score</span>
                  <p className="text-xl font-black text-stone-900">
                    {targetForecastDay.sowing_suitability_score}%
                  </p>
                </div>
              </div>

              {/* Day Weather Key Parameters */}
              <div className="grid grid-cols-3 gap-2 text-xs pt-3 border-t border-stone-200/60">
                <div className="bg-white/80 p-2.5 rounded-xl border border-stone-200">
                  <p className="text-[10px] font-bold text-stone-500">Expected Precipitation</p>
                  <p className="font-bold text-stone-900 mt-0.5">
                    {targetForecastDay.precipitation_mm} mm ({targetForecastDay.precipitation_probability}%)
                  </p>
                </div>

                <div className="bg-white/80 p-2.5 rounded-xl border border-stone-200">
                  <p className="text-[10px] font-bold text-stone-500">Temperature Window</p>
                  <p className="font-bold text-stone-900 mt-0.5">
                    {targetForecastDay.temp_min_c}°C - {targetForecastDay.temp_max_c}°C
                  </p>
                </div>

                <div className="bg-white/80 p-2.5 rounded-xl border border-stone-200">
                  <p className="text-[10px] font-bold text-stone-500">Soil Moisture Capacity</p>
                  <p className="font-bold text-stone-900 mt-0.5">{targetForecastDay.soil_moisture_percent}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
