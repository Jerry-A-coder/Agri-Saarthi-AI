import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { MarketPrice, BuyerListing, CropListing, DemandCropSuggestion } from '../../types';
import {
  TrendingUp,
  ShoppingBag,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Phone,
  MapPin,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  DollarSign,
  Building,
  X,
  Sprout,
  BarChart3,
  Award,
  Warehouse,
  ChevronRight,
  BellRing,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { InquiryChatbotModal } from '../common/InquiryChatbotModal';
import { PriceAlertNotificationSection } from './PriceAlertNotificationSection';

export const MarketView: React.FC = () => {
  const { currentUser, farmerProfile, showToast, setActiveFarmerTab } = useApp();

  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [buyers, setBuyers] = useState<BuyerListing[]>([]);
  const [cropListings, setCropListings] = useState<CropListing[]>([]);
  const [demandCrops, setDemandCrops] = useState<DemandCropSuggestion[]>([]);
  const [activeMarketTab, setActiveMarketTab] = useState<
    'price_alerts' | 'mandi' | 'demand_crops' | 'buyers' | 'my_listings'
  >('price_alerts');
  const [selectedCrop, setSelectedCrop] = useState<MarketPrice | null>(null);
  const [selectedDemandCategory, setSelectedDemandCategory] = useState<'ALL' | 'FRUIT' | 'VEGETABLE'>('ALL');

  // New Listing Form
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [listingCrop, setListingCrop] = useState('Tomato');
  const [listingQty, setListingQty] = useState(25);
  const [listingPrice, setListingPrice] = useState(2400);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [prices, bList, cList, dList] = await Promise.all([
        api.getMarketPrices(),
        api.getBuyers(),
        api.getCropListings(),
        api.getDemandCrops(),
      ]);
      setMarketPrices(prices);
      setBuyers(bList);
      setCropListings(cList);
      setDemandCrops(dList);
      if (prices.length > 0) setSelectedCrop(prices[0]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createCropListing({
        farmerId: currentUser?.id || 'usr_farmer_1',
        farmerName: farmerProfile?.farmer_name || 'Murugan Palaniswamy',
        cropName: listingCrop,
        variety: 'Hybrid Regular',
        quantityQuintals: listingQty,
        expectedPrice: listingPrice,
      });

      showToast(`Listing created for ${listingQty} Quintals of ${listingCrop}. Buyers will contact you.`);
      setIsListingModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDemandCrops = demandCrops.filter((c) => {
    if (selectedDemandCategory === 'ALL') return true;
    return c.category.toUpperCase() === selectedDemandCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">APMC Mandi Rates & High-Demand Crop Marketplace</h2>
            <p className="text-xs text-stone-500">
              Live commodity price trends, fruit & vegetable demand forecasts, and verified wholesale buyer connections
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap items-center gap-1.5 bg-stone-100 p-1.5 rounded-xl border border-stone-200">
          <button
            onClick={() => setActiveMarketTab('price_alerts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMarketTab === 'price_alerts'
                ? 'bg-amber-400 text-stone-950 shadow-xs'
                : 'text-stone-700 hover:text-stone-950'
            }`}
          >
            <BellRing className="w-3.5 h-3.5 text-stone-950 animate-bounce" />
            <span>Price Alerts & Real-Time Feed</span>
          </button>
          <button
            onClick={() => setActiveMarketTab('mandi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMarketTab === 'mandi' ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Live Mandi Rates
          </button>
          <button
            onClick={() => setActiveMarketTab('demand_crops')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeMarketTab === 'demand_crops'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            High-Demand Fruits & Veggies
          </button>
          <button
            onClick={() => setActiveMarketTab('buyers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMarketTab === 'buyers' ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Verified Buyers ({buyers.length})
          </button>
          <button
            onClick={() => setActiveMarketTab('my_listings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMarketTab === 'my_listings' ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            My Produce Listings ({cropListings.length})
          </button>
        </div>
      </div>

      {/* TAB 0: REAL-TIME PRICE ALERTS & NOTIFICATIONS */}
      {activeMarketTab === 'price_alerts' && (
        <PriceAlertNotificationSection
          onNavigateToBuyers={() => setActiveMarketTab('buyers')}
          onNavigateToWarehouses={() => setActiveFarmerTab('warehouses')}
          onNavigateToListings={() => setActiveMarketTab('my_listings')}
        />
      )}

      {/* TAB 1: DEMAND-BASED FRUITS & VEGETABLES SUGGESTIONS */}
      {activeMarketTab === 'demand_crops' && (
        <div className="space-y-6">
          {/* Header Bar with Category Filter & Chart */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    Market Intelligence
                  </span>
                  <span className="text-xs text-stone-500">APMC Buyer Deficit Analysis</span>
                </div>
                <h3 className="text-base font-bold text-stone-900 mt-1">
                  High-Demand Fruits & Vegetables for Maximum Acre Profitability
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Suggested crops ranked by current wholesale purchase demand, expected price trajectory, and cold chain return on investment
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center space-x-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200">
                {(['ALL', 'VEGETABLE', 'FRUIT'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedDemandCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedDemandCategory === cat
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {cat === 'ALL' ? 'All Commodities' : cat === 'VEGETABLE' ? 'Vegetables 🥦' : 'Fruits 🍎'}
                  </button>
                ))}
              </div>
            </div>

            {/* Demand Comparison Bar Chart */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-stone-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-emerald-700" />
                  Comparative Demand Index vs. Expected Profit (Lakhs/Acre)
                </span>
                <span className="text-[11px] text-stone-500">Source: TNAU Market Cell & APMC Mandis</span>
              </div>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredDemandCrops}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="crop_name" tick={{ fontSize: 10, fill: '#475569' }} />
                    <YAxis yAxisId="left" domain={[60, 100]} tick={{ fontSize: 10, fill: '#475569' }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#475569' }} unit="L" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: 8, fontSize: 12 }}
                      formatter={(val: any, name: any) => [
                        name === 'demand_index' ? `${val} / 100 Index` : `₹${val} Lakh/Acre`,
                        name === 'demand_index' ? 'Demand Index' : 'Est. Net Profit',
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar yAxisId="left" dataKey="demand_index" name="Demand Index (0-100)" fill="#059669" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="expected_profit_per_acre_lakhs" name="Est. Net Profit (₹ Lakh/Acre)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Cards Grid for High-Demand Crops */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDemandCrops.map((crop) => (
              <div
                key={crop.id}
                className="bg-white rounded-2xl border border-stone-200 hover:border-emerald-500 hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                      {crop.category} • {crop.variety}
                    </span>
                    <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {crop.demand_index}/100 Demand
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-stone-900 mt-2">{crop.crop_name}</h4>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">{crop.reason}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-stone-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Expected Profit:</span>
                    <strong className="text-emerald-700 font-extrabold">
                      ₹{crop.expected_profit_per_acre_lakhs} Lakh / Acre
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Current Modal Price:</span>
                    <strong className="text-stone-900">{crop.current_mandi_price}</strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Price Forecast:</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      {crop.price_trend_forecast}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Maturity / Harvest:</span>
                    <span className="text-stone-800 font-semibold">{crop.days_to_harvest} Days</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Optimal Sowing:</span>
                    <span className="text-stone-800 font-semibold">{crop.sowing_months.join(', ')}</span>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => setActiveFarmerTab('my-farm')}
                      className="flex-1 py-2 bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-stone-800 font-bold text-xs rounded-xl border border-stone-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Estimate Harvest</span>
                    </button>
                    <button
                      onClick={() => setIsInquiryModalOpen(true)}
                      className="py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs"
                      title="Ask Admin about market tie-ups"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE MANDI RATES */}
      {activeMarketTab === 'mandi' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Mandi Cards List */}
          <div className="lg:col-span-6 space-y-3">
            {marketPrices.map((item) => {
              const isSelected = selectedCrop?.crop_name === item.crop_name;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedCrop(item)}
                  className={`bg-white border rounded-2xl p-4 shadow-xs cursor-pointer transition-all ${
                    isSelected ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-stone-900 text-sm">{item.crop_name}</h4>
                        <span className="text-xs text-stone-400">({item.variety})</span>
                      </div>
                      <p className="text-xs text-stone-500 flex items-center space-x-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        <span>{item.mandi_name}, {item.state}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center space-x-1 justify-end">
                        <span className="text-base font-extrabold text-stone-900">₹{item.modal_price_inr}</span>
                        <span className="text-[10px] text-stone-400 font-semibold">/Q</span>
                      </div>
                      <p
                        className={`text-xs font-bold flex items-center justify-end space-x-0.5 ${
                          item.price_change_percent >= 0 ? 'text-emerald-700' : 'text-red-700'
                        }`}
                      >
                        {item.price_change_percent >= 0 ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        <span>{item.price_change_percent > 0 ? '+' : ''}{item.price_change_percent}%</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-500 pt-3 mt-3 border-t border-stone-100">
                    <span>Range: ₹{item.min_price_inr} - ₹{item.max_price_inr}</span>
                    <span>Daily Volume: {item.daily_arrival_volume_quintals} Q</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Price Trend Chart */}
          <div className="lg:col-span-6">
            {selectedCrop && (
              <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4 sticky top-6">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="font-bold text-base text-stone-900">{selectedCrop.crop_name} Price Trend</h3>
                    <p className="text-xs text-stone-500">
                      {selectedCrop.mandi_name} • Updated {selectedCrop.price_date}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsListingModalOpen(true)}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Sell Listing</span>
                  </button>
                </div>

                {/* 30-day Price Chart */}
                <div className="w-full h-60 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedCrop.historical_prices}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#888' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#888' }} unit="₹" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: 8, fontSize: 12 }}
                        formatter={(val: any) => [`₹${val}/Q`, 'Modal Price']}
                      />
                      <Line
                        type="monotone"
                        dataKey="modalPrice"
                        stroke="#059669"
                        strokeWidth={3}
                        dot={{ r: 3, fill: '#059669' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-900 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    <span>AGMARKNET AI Price Outlook</span>
                  </div>
                  <p className="leading-relaxed">
                    Tomato modal rates in Pollachi APMC are projected to remain steady at ₹2,500 - ₹2,700/Q over the next 3 weeks due to limited fresh arrivals from neighboring taluks.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: VERIFIED BUYERS DIRECT */}
      {activeMarketTab === 'buyers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buyers.map((buyer) => (
            <div key={buyer.id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                    {buyer.buyer_type}
                  </span>
                  <span className="text-xs text-stone-400 flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    <span>{buyer.location}</span>
                  </span>
                </div>
                <h4 className="font-bold text-sm text-stone-900">{buyer.company_name}</h4>
                <p className="text-xs text-stone-600">Procuring: <strong>{buyer.crops_demanded.join(', ')}</strong></p>
                <p className="text-xs text-stone-500">Min Quantity: {buyer.min_quantity_quintals} Quintals</p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-700">₹{buyer.offering_price_range_inr}/Q</span>
                <a
                  href={`tel:${buyer.phone}`}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold flex items-center space-x-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call Buyer</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: MY PRODUCE LISTINGS */}
      {activeMarketTab === 'my_listings' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-stone-900">My Active Produce Listings</h3>
              <p className="text-xs text-stone-500">Broadcast your harvest batch to verified wholesale buyers</p>
            </div>
            <button
              onClick={() => setIsListingModalOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Listing</span>
            </button>
          </div>

          <div className="space-y-3">
            {cropListings.map((list) => (
              <div
                key={list.id}
                className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <h5 className="font-bold text-stone-900 text-sm">{list.crop_name}</h5>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      {list.status}
                    </span>
                  </div>
                  <p className="text-stone-500 mt-0.5">
                    Quantity: {list.quantity_quintals} Quintals • Listed on {list.created_at}
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="text-stone-400 text-[10px] uppercase font-bold block">Expected Price</span>
                    <strong className="text-sm font-extrabold text-stone-900">₹{list.expected_price}/Q</strong>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 font-bold hover:bg-white">
                    Edit Listing
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sell Listing Modal */}
      {isListingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-base text-stone-900">Create Produce Sell Listing</h3>
              <button onClick={() => setIsListingModalOpen(false)}>
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Crop</label>
                <select
                  value={listingCrop}
                  onChange={(e) => setListingCrop(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                >
                  <option>Tomato</option>
                  <option>Maize</option>
                  <option>Groundnut</option>
                  <option>Paddy</option>
                  <option>Small Onion</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Quantity (Quintals)</label>
                <input
                  type="number"
                  value={listingQty}
                  onChange={(e) => setListingQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Expected Price (₹ / Quintal)</label>
                <input
                  type="number"
                  value={listingPrice}
                  onChange={(e) => setListingPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsListingModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Inquiry Modal */}
      <InquiryChatbotModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        defaultCategory="GENERAL"
        initialContextPrompt="I would like assistance with wholesale buyer tie-ups and high-demand crop pricing..."
      />
    </div>
  );
};
