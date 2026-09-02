import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Warehouse, WarehouseBooking, StorageProfitCalculation } from '../../types';
import {
  Warehouse as WarehouseIcon,
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Scale,
  ThermometerSnowflake,
  Clock,
  ArrowRight,
  ChevronRight,
  Layers,
  Sparkles,
  AlertCircle,
  Truck,
  Plus,
  Compass,
  X,
  Users,
} from 'lucide-react';

export const WarehouseFinderView: React.FC = () => {
  const { currentLocation, currentUser, farmerProfile, showToast, refreshNotifications, setActiveFarmerTab } = useApp();

  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [selectedType, setSelectedType] = useState('All');
  const [radiusKm, setRadiusKm] = useState(50);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'distance' | 'price' | 'capacity'>('distance');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected warehouse for detail / booking
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Comparison drawer state
  const [comparedWarehouseIds, setComparedWarehouseIds] = useState<string[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Storage Profit Calculator State
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcQuantity, setCalcQuantity] = useState(2000);
  const [calcCurrentPrice, setCalcCurrentPrice] = useState(18);
  const [calcProjectedPrice, setCalcProjectedPrice] = useState(30);
  const [calcDuration, setCalcDuration] = useState(30);
  const [calcRate, setCalcRate] = useState(0.45);
  const [calcTransport, setCalcTransport] = useState(1200);
  const [profitResult, setProfitResult] = useState<StorageProfitCalculation | null>(null);

  // Booking Form State
  const [bookingCrop, setBookingCrop] = useState('Tomato');
  const [bookingQty, setBookingQty] = useState(1000);
  const [bookingDuration, setBookingDuration] = useState(30);
  const [bookingStartDate, setBookingStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Load Warehouses based on current location & filters
  const loadWarehouses = async () => {
    try {
      const list = await api.getWarehouses({
        lat: currentLocation.latitude,
        lng: currentLocation.longitude,
        radius: radiusKm,
        crop: selectedCrop === 'All' ? undefined : selectedCrop,
        storageType: selectedType === 'All' ? undefined : selectedType,
        maxPrice: maxPrice || undefined,
        sort: sortBy,
      });
      setWarehouses(list);
      if (list.length > 0 && !selectedWarehouse) {
        setSelectedWarehouse(list[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, [currentLocation, radiusKm, selectedCrop, selectedType, maxPrice, sortBy]);

  // Run initial calculator
  useEffect(() => {
    handleRunProfitCalculator();
  }, [selectedCrop]);

  const handleRunProfitCalculator = async () => {
    try {
      const res = await api.calculateStorageProfit({
        cropName: selectedCrop,
        quantityKg: calcQuantity,
        currentMandiPricePerKg: calcCurrentPrice,
        projectedFuturePricePerKg: calcProjectedPrice,
        storageDurationDays: calcDuration,
        storageRatePerKgDay: calcRate,
        transportCostInr: calcTransport,
      });
      setProfitResult(res);
    } catch (e) {
      console.error(e);
    }
  };

  // Submit Booking
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarehouse) return;

    if (bookingQty > selectedWarehouse.available_capacity_kg) {
      showToast(`Requested quantity exceeds available capacity (${(selectedWarehouse.available_capacity_kg / 1000).toFixed(1)} MT).`);
      return;
    }

    setIsSubmittingBooking(true);
    try {
      await api.createBooking({
        warehouseId: selectedWarehouse.id,
        farmerId: currentUser?.id || 'usr_farmer_1',
        farmerName: farmerProfile?.farmer_name || 'Murugan Palaniswamy',
        farmerPhone: currentUser?.phone || '+91 98421 87654',
        cropName: bookingCrop,
        quantityKg: bookingQty,
        storageTypeRequested: selectedWarehouse.storage_types[0],
        startDate: bookingStartDate,
        durationDays: bookingDuration,
        rateApplied: selectedWarehouse.rate_inr,
      });

      showToast(`Booking request submitted for ${selectedWarehouse.name}. Provider notified.`);
      setIsBookingModalOpen(false);
      refreshNotifications();
      loadWarehouses();
    } catch (err: any) {
      showToast(err.message || 'Failed to complete booking');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Toggle Warehouse Comparison
  const toggleComparison = (id: string) => {
    if (comparedWarehouseIds.includes(id)) {
      setComparedWarehouseIds(comparedWarehouseIds.filter((item) => item !== id));
    } else {
      if (comparedWarehouseIds.length >= 4) {
        showToast('You can compare up to 4 warehouses at a time.');
        return;
      }
      setComparedWarehouseIds([...comparedWarehouseIds, id]);
    }
  };

  const filteredWarehouses = warehouses.filter((w) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      w.name.toLowerCase().includes(q) ||
      w.taluk.toLowerCase().includes(q) ||
      w.district.toLowerCase().includes(q) ||
      w.operator_type.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <WarehouseIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">Nearby Warehouses & Cold Chain Finder</h2>
              <p className="text-xs text-stone-500">
                Live capacity tracking, dynamic rental rates, and storage profitability calculator
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveFarmerTab('community-map')}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Switch to Community Map Layer</span>
          </button>

          {comparedWarehouseIds.length > 0 && (
            <button
              onClick={() => setShowComparisonModal(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold flex items-center space-x-1.5 hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare ({comparedWarehouseIds.length})</span>
            </button>
          )}

          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-1.5 hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{showCalculator ? 'Hide Profit ROI' : 'Storage Profit ROI'}</span>
          </button>
        </div>
      </div>

      {/* Storage Profit Calculator Banner (Collapsible) */}
      {showCalculator && (
        <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-2xl p-6 shadow-md space-y-6 border border-emerald-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-base text-white">Commodity Storage Profitability Calculator (Sell Now vs. Store)</h3>
            </div>
            <button onClick={() => setShowCalculator(false)} className="text-stone-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div>
              <label className="block text-emerald-300 font-semibold mb-1">Crop</label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-stone-900 border border-emerald-700 text-white text-xs"
              >
                <option>Tomato</option>
                <option>Onion</option>
                <option>Chilli</option>
                <option>Maize</option>
                <option>Paddy</option>
              </select>
            </div>

            <div>
              <label className="block text-emerald-300 font-semibold mb-1">Quantity (Kg)</label>
              <input
                type="number"
                value={calcQuantity}
                onChange={(e) => setCalcQuantity(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-stone-900 border border-emerald-700 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-emerald-300 font-semibold mb-1">Current Mandi Rate (₹/kg)</label>
              <input
                type="number"
                value={calcCurrentPrice}
                onChange={(e) => setCalcCurrentPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-stone-900 border border-emerald-700 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-emerald-300 font-semibold mb-1">Projected Peak (₹/kg)</label>
              <input
                type="number"
                value={calcProjectedPrice}
                onChange={(e) => setCalcProjectedPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-stone-900 border border-emerald-700 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-emerald-300 font-semibold mb-1">Hold Period (Days)</label>
              <input
                type="number"
                value={calcDuration}
                onChange={(e) => setCalcDuration(parseInt(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-stone-900 border border-emerald-700 text-white text-xs"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleRunProfitCalculator}
                className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs transition-colors"
              >
                Recalculate
              </button>
            </div>
          </div>

          {/* Calculator Output Cards */}
          {profitResult && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2 border-t border-emerald-800/80 text-xs">
              <div className="p-3 bg-stone-900/70 rounded-xl border border-emerald-800">
                <p className="text-stone-400">Sell Now Immediate Revenue</p>
                <p className="text-lg font-extrabold text-white mt-0.5">₹{profitResult.sellNowGrossRevenue.toLocaleString()}</p>
                <p className="text-[10px] text-stone-400 mt-1">@ ₹{profitResult.currentMandiPricePerKg}/kg spot mandi rate</p>
              </div>

              <div className="p-3 bg-stone-900/70 rounded-xl border border-emerald-800">
                <p className="text-stone-400">Projected Future Revenue</p>
                <p className="text-lg font-extrabold text-emerald-400 mt-0.5">₹{profitResult.futureGrossRevenue.toLocaleString()}</p>
                <p className="text-[10px] text-stone-400 mt-1">@ ₹{profitResult.projectedFuturePricePerKg}/kg peak projection</p>
              </div>

              <div className="p-3 bg-stone-900/70 rounded-xl border border-emerald-800">
                <p className="text-stone-400">Storage + Freight Expenses</p>
                <p className="text-lg font-extrabold text-amber-300 mt-0.5">₹{profitResult.totalCosts.toLocaleString()}</p>
                <p className="text-[10px] text-stone-400 mt-1">Rent ₹{profitResult.totalStorageCost} + Transport ₹{profitResult.transportCostInr}</p>
              </div>

              <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-400/40">
                <p className="text-emerald-300 font-semibold">Net Extra Storage Gain</p>
                <p className="text-xl font-black text-emerald-300 mt-0.5">+₹{profitResult.netBenefit.toLocaleString()}</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-400 text-stone-950 inline-block mt-1">
                  {profitResult.recommendedAction}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by depot name, taluk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Crop Filter */}
          <div>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Crops</option>
              <option value="Tomato">Tomato (Cold Storage)</option>
              <option value="Chilli">Chilli (Dry & Cold)</option>
              <option value="Onion">Onion (Ventilated)</option>
              <option value="Paddy">Paddy / Rice (Dry)</option>
              <option value="Maize">Maize (General)</option>
              <option value="Groundnut">Groundnut</option>
            </select>
          </div>

          {/* Storage Type */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Storage Types</option>
              <option value="Cold Storage (Multi-Chamber)">Cold Storage (Multi-Chamber)</option>
              <option value="General Warehouse">General Warehouse</option>
              <option value="Silo">Grain Silo</option>
            </select>
          </div>

          {/* Radius Filter */}
          <div>
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value={20}>Within 20 km</option>
              <option value={50}>Within 50 km</option>
              <option value={100}>Within 100 km</option>
              <option value={200}>Within 200 km</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="distance">Sort: Nearest First (Km)</option>
              <option value="price">Sort: Lowest Daily Rent</option>
              <option value="capacity">Sort: Highest Available MT</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map / Card List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Warehouse List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500 px-1">
            <span>Showing <strong>{filteredWarehouses.length}</strong> warehouses near <strong>{currentLocation.district}</strong></span>
            <span>Radius: {radiusKm} km</span>
          </div>

          <div className="space-y-3">
            {filteredWarehouses.length === 0 ? (
              <div className="p-8 text-center bg-white border border-stone-200 rounded-2xl text-xs text-stone-500">
                No warehouses match your current filter parameters. Try increasing the search radius.
              </div>
            ) : (
              filteredWarehouses.map((wh) => {
                const isSelected = selectedWarehouse?.id === wh.id;
                const isCompared = comparedWarehouseIds.includes(wh.id);
                const capacityPercent = Math.round((wh.used_capacity_kg / wh.total_capacity_kg) * 100);

                return (
                  <div
                    key={wh.id}
                    onClick={() => setSelectedWarehouse(wh)}
                    className={`bg-white border rounded-2xl p-5 shadow-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                            {wh.operator_type}
                          </span>
                          <h3 className="font-bold text-sm text-stone-900">{wh.name}</h3>
                          {wh.verified && (
                            <ShieldCheck className="w-4 h-4 text-emerald-600" title="State Verified Warehouse" />
                          )}
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5 flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-stone-400" />
                          <span>{wh.taluk}, {wh.district}</span>
                        </p>
                      </div>

                      {/* Distance & Price Badge */}
                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md">
                          {wh.distance_km} km away
                        </span>
                        <p className="text-[11px] font-semibold text-stone-600 mt-1">
                          ₹{wh.rate_inr} <span className="text-[10px] text-stone-400 font-normal">/kg/day</span>
                        </p>
                      </div>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="mt-3 pt-3 border-t border-stone-100 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-stone-600">
                          Capacity Available: <strong>{(wh.available_capacity_kg / 1000).toFixed(1)} MT</strong> / {(wh.total_capacity_kg / 1000).toFixed(0)} MT
                        </span>
                        <span className={`font-bold ${capacityPercent > 80 ? 'text-amber-600' : 'text-emerald-700'}`}>
                          {100 - capacityPercent}% Free
                        </span>
                      </div>
                      <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            capacityPercent > 80 ? 'bg-amber-500' : 'bg-emerald-600'
                          }`}
                          style={{ width: `${capacityPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Suitable Crops Badges */}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {(wh.storage_types || []).map((type: string, i: number) => (
                        <span key={i} className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md font-medium">
                          {type}
                        </span>
                      ))}
                      {wh.humidity_control && (
                        <span className="text-[10px] bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md font-medium flex items-center space-x-1">
                          <ThermometerSnowflake className="w-3 h-3" />
                          <span>Cold Chain</span>
                        </span>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleComparison(wh.id);
                        }}
                        className={`font-semibold text-[11px] flex items-center space-x-1 px-2 py-1 rounded-md transition-colors ${
                          isCompared ? 'bg-indigo-100 text-indigo-900' : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
                        }`}
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>{isCompared ? 'Remove from Compare' : 'Add to Compare'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWarehouse(wh);
                          setIsBookingModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center space-x-1 shadow-xs"
                      >
                        <span>Book Space</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Warehouse Details & Map Preview */}
        <div className="lg:col-span-5 space-y-4">
          {selectedWarehouse ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-6 sticky top-20">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    {selectedWarehouse.operator_type} Certified
                  </span>
                  <span className="text-xs text-stone-400">ID: {selectedWarehouse.id}</span>
                </div>
                <h3 className="text-lg font-extrabold text-stone-900">{selectedWarehouse.name}</h3>
                <p className="text-xs text-stone-600 flex items-start space-x-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{selectedWarehouse.address}, {selectedWarehouse.taluk}, {selectedWarehouse.district} - {selectedWarehouse.pincode}</span>
                </p>
              </div>

              {/* GIS Map Box (Simulation view) */}
              <div className="relative rounded-xl overflow-hidden aspect-16/9 bg-stone-900 border border-stone-200">
                <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white space-y-2">
                  <div className="p-3 bg-emerald-600 rounded-full text-white shadow-lg animate-bounce">
                    <WarehouseIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-xs">{selectedWarehouse.name}</p>
                    <p className="text-[10px] text-emerald-300">
                      Coordinates: {selectedWarehouse.latitude.toFixed(4)}°N, {selectedWarehouse.longitude.toFixed(4)}°E
                    </p>
                    <p className="text-[11px] font-bold text-amber-300 mt-1">
                      Estimated Road Transit: ~{Math.round((selectedWarehouse.distance_km || 10) * 1.8)} mins via NH / SH
                    </p>
                  </div>
                </div>
              </div>

              {/* Facility Specs Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/80">
                  <p className="text-stone-400 text-[10px] uppercase font-bold">Total Capacity</p>
                  <p className="font-extrabold text-stone-900 text-sm mt-0.5">
                    {(selectedWarehouse.total_capacity_kg / 1000).toLocaleString()} MT
                  </p>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/80">
                  <p className="text-stone-400 text-[10px] uppercase font-bold">Daily Rent Rate</p>
                  <p className="font-extrabold text-emerald-700 text-sm mt-0.5">
                    ₹{selectedWarehouse.rate_inr} <span className="text-[10px] text-stone-400 font-normal">/kg/day</span>
                  </p>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/80">
                  <p className="text-stone-400 text-[10px] uppercase font-bold">Cold & Humidity Control</p>
                  <p className="font-bold text-stone-800 mt-0.5">
                    {selectedWarehouse.humidity_control ? 'Yes (2°C - 8°C)' : 'Ambient Air'}
                  </p>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/80">
                  <p className="text-stone-400 text-[10px] uppercase font-bold">e-NWR & Insurance</p>
                  <p className="font-bold text-stone-800 mt-0.5">
                    {selectedWarehouse.insurance_covered ? 'Covered (WDRA)' : 'Basic'}
                  </p>
                </div>
              </div>

              {/* Suitable Crops */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Suitable Commodities</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedWarehouse.suitable_crops || []).map((crop: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-800 font-medium text-xs">
                      {crop}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact Facility */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs flex items-center justify-between">
                <div>
                  <p className="font-bold text-stone-900">{selectedWarehouse.contact_person}</p>
                  <p className="text-stone-500">{selectedWarehouse.contact_phone}</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                  Active Depot
                </span>
              </div>

              {/* Book Space CTA */}
              <button
                id="open-booking-modal-btn"
                type="button"
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
              >
                <Calendar className="w-4 h-4" />
                <span>Reserve Storage Space in {selectedWarehouse.name}</span>
              </button>
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center text-xs text-stone-500">
              Select a warehouse to view details, GPS routing, and booking forms.
            </div>
          )}
        </div>
      </div>

      {/* Warehouse Booking Modal */}
      {isBookingModalOpen && selectedWarehouse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-stone-900">Book Storage Space</h3>
                <p className="text-xs text-stone-500">{selectedWarehouse.name}</p>
              </div>
              <button onClick={() => setIsBookingModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Crop to Store</label>
                  <select
                    value={bookingCrop}
                    onChange={(e) => setBookingCrop(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    {(selectedWarehouse.suitable_crops || []).map((c: string) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Weight / Quantity (Kg)</label>
                  <input
                    type="number"
                    min={100}
                    max={selectedWarehouse.available_capacity_kg}
                    value={bookingQty}
                    onChange={(e) => setBookingQty(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-stone-400">
                    Max Available: {(selectedWarehouse.available_capacity_kg / 1000).toFixed(1)} MT
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={bookingStartDate}
                    onChange={(e) => setBookingStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    min={selectedWarehouse.minimum_storage_days}
                    value={bookingDuration}
                    onChange={(e) => setBookingDuration(parseInt(e.target.value) || 7)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Dynamic Price Calculation Summary */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs text-emerald-950 font-semibold">
                  <span>Estimated Total Rent ({bookingDuration} days):</span>
                  <span className="text-base font-black text-emerald-800">
                    ₹{Math.round(bookingQty * bookingDuration * selectedWarehouse.rate_inr).toLocaleString()}
                  </span>
                </div>
                <p className="text-[10px] text-emerald-800">
                  Rate applied: ₹{selectedWarehouse.rate_inr}/kg/day • Includes pest fumigation & WDRA insurance
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-semibold hover:bg-stone-100"
                >
                  Cancel
                </button>

                <button
                  id="confirm-booking-btn"
                  type="submit"
                  disabled={isSubmittingBooking}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-sm flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmittingBooking ? 'Submitting...' : 'Confirm & Reserve Space'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Multi-Warehouse Comparison Modal */}
      {showComparisonModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center space-x-2">
                <Scale className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-stone-900">Side-by-Side Warehouse Comparison</h3>
              </div>
              <button onClick={() => setShowComparisonModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-stone-200 divide-y divide-stone-200">
                <thead className="bg-stone-50 font-bold text-stone-700">
                  <tr>
                    <th className="p-3 border-r border-stone-200">Attribute</th>
                    {comparedWarehouseIds.map((id) => {
                      const wh = warehouses.find((w) => w.id === id);
                      return (
                        <th key={id} className="p-3 border-r border-stone-200 font-bold text-stone-900 min-w-[180px]">
                          {wh?.name}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  <tr>
                    <td className="p-3 font-semibold bg-stone-50 border-r border-stone-200">Distance from Farm</td>
                    {comparedWarehouseIds.map((id) => (
                      <td key={id} className="p-3 border-r border-stone-200 font-bold text-emerald-700">
                        {warehouses.find((w) => w.id === id)?.distance_km} km
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold bg-stone-50 border-r border-stone-200">Daily Rate (₹/kg/day)</td>
                    {comparedWarehouseIds.map((id) => (
                      <td key={id} className="p-3 border-r border-stone-200 font-bold">
                        ₹{warehouses.find((w) => w.id === id)?.rate_inr}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold bg-stone-50 border-r border-stone-200">Available Capacity</td>
                    {comparedWarehouseIds.map((id) => (
                      <td key={id} className="p-3 border-r border-stone-200">
                        {((warehouses.find((w) => w.id === id)?.available_capacity_kg || 0) / 1000).toFixed(1)} MT
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold bg-stone-50 border-r border-stone-200">Cold Chain / Climate Control</td>
                    {comparedWarehouseIds.map((id) => (
                      <td key={id} className="p-3 border-r border-stone-200">
                        {warehouses.find((w) => w.id === id)?.humidity_control ? '✅ Yes' : '❌ Ambient'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold bg-stone-50 border-r border-stone-200">Insurance & CCTV Security</td>
                    {comparedWarehouseIds.map((id) => (
                      <td key={id} className="p-3 border-r border-stone-200">
                        {warehouses.find((w) => w.id === id)?.insurance_covered ? '✅ Covered' : 'Basic'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowComparisonModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white font-bold text-xs"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
