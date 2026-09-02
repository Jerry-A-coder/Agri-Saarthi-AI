import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Warehouse, WarehouseBooking } from '../../types';
import {
  Building2,
  Warehouse as WarehouseIcon,
  CheckCircle2,
  XCircle,
  Plus,
  Clock,
  MapPin,
  ThermometerSnowflake,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  X,
  MessageSquare,
  Sparkles,
  Layers,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { InquiryChatbotModal } from '../common/InquiryChatbotModal';

export const ProviderDashboard: React.FC = () => {
  const { currentUser, providerProfile, showToast, refreshNotifications } = useApp();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [bookings, setBookings] = useState<WarehouseBooking[]>([]);
  const [activeTab, setActiveTab] = useState<'depots' | 'bookings' | 'helpdesk'>('depots');

  // Add Warehouse Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    operator_type: 'TNWC' as const,
    address: '',
    taluk: 'Pollachi',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    pincode: '642001',
    latitude: 10.6586,
    longitude: 77.0089,
    storage_types: ['Cold Storage (Multi-Chamber)'],
    total_capacity_kg: 250000,
    rate_inr: 0.50,
    minimum_storage_days: 7,
    suitable_crops: ['Tomato', 'Chilli', 'Onion'],
    humidity_control: true,
    contact_person: 'Facility Depot Manager',
    contact_phone: '+91 94420 11223',
  });

  const loadProviderData = async () => {
    try {
      const [whList, bList] = await Promise.all([
        api.getWarehouses(),
        api.getBookings({ providerId: currentUser?.id || 'usr_provider_1' }),
      ]);
      setWarehouses(whList);
      setBookings(bList);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadProviderData();
  }, [currentUser]);

  const handleUpdateStatus = async (bookingId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await api.updateBookingStatus(bookingId, status, undefined, currentUser?.id || 'usr_provider_1');
      showToast(`Booking ${bookingId} marked as ${status}. Available capacity updated.`);
      loadProviderData();
      refreshNotifications();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status');
    }
  };

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createWarehouse({
        ...formData,
        provider_id: currentUser?.id || 'usr_provider_1',
      });
      showToast(`Warehouse ${formData.name} created and indexed successfully.`);
      setIsAddModalOpen(false);
      loadProviderData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create warehouse');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-800 via-stone-900 to-stone-950 text-white rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white">
                {providerProfile?.company_name || 'Tamil Nadu Warehousing Corp (TNWC)'}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-700 text-amber-200 border border-amber-600">
                Authorized Depot
              </span>
            </div>
            <p className="text-xs text-amber-200 mt-0.5">
              Facility Head: {providerProfile?.contact_person || 'V. Ramanathan'} • {providerProfile?.district || 'Coimbatore'}, {providerProfile?.state || 'Tamil Nadu'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsInquiryModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs shadow-xs flex items-center space-x-1.5 transition-colors border border-white/20"
          >
            <MessageSquare className="w-4 h-4 text-amber-300" />
            <span>Admin Helpdesk & Inquiries</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-xs flex items-center space-x-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Storage Unit</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-stone-100 p-1.5 rounded-xl border border-stone-200 w-fit text-xs font-semibold">
        <button
          onClick={() => setActiveTab('depots')}
          className={`px-4 py-1.5 rounded-lg transition-all ${
            activeTab === 'depots' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          My Storage Facilities ({warehouses.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-1.5 rounded-lg transition-all ${
            activeTab === 'bookings' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Farmer Inbound Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('helpdesk')}
          className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'helpdesk' ? 'bg-amber-700 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Admin Dispute & Support Desk</span>
        </button>
      </div>

      {/* TAB 1: DEPOTS */}
      {activeTab === 'depots' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {warehouses.map((wh) => (
            <div key={wh.id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                    {wh.operator_type} • WDRA #{wh.wdra_registration_no}
                  </span>
                  <span className="text-xs font-bold text-emerald-700">
                    ₹{wh.rate_inr}/kg/day
                  </span>
                </div>
                <h3 className="font-bold text-base text-stone-900">{wh.name}</h3>
                <p className="text-xs text-stone-500 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>{wh.address}, {wh.taluk}</span>
                </p>
              </div>

              {/* Capacity Meter */}
              <div className="space-y-1.5 pt-2 border-t border-stone-100 text-xs">
                <div className="flex items-center justify-between text-stone-600">
                  <span>Available Capacity:</span>
                  <strong className="text-stone-900 font-extrabold">
                    {(wh.available_capacity_kg / 1000).toFixed(1)} / {(wh.total_capacity_kg / 1000).toFixed(1)} MT
                  </strong>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-600 rounded-full"
                    style={{
                      width: `${((wh.total_capacity_kg - wh.available_capacity_kg) / wh.total_capacity_kg) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs text-stone-500">
                <span>Suitable: {wh.suitable_crops.join(', ')}</span>
                <button
                  onClick={() => setIsInquiryModalOpen(true)}
                  className="text-amber-700 hover:text-amber-900 font-bold"
                >
                  Admin Inquiry
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-stone-900">Farmer Inbound Storage Reservations</h3>
              <p className="text-xs text-stone-500">Review incoming lots, verify weight tickets, and allocate chamber slots</p>
            </div>
          </div>

          <div className="space-y-3">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-stone-900 text-sm">{b.farmer_name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        b.status === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {b.status}
                    </span>
                    <span className="text-stone-400 font-mono">Lot #{b.lot_number}</span>
                  </div>
                  <p className="text-stone-600">
                    Crop: <strong>{b.crop_name}</strong> • Quantity: <strong>{b.quantity_kg} kg</strong> ({(b.quantity_kg / 1000).toFixed(1)} MT)
                  </p>
                  <p className="text-stone-500">
                    Dates: {b.start_date} to {b.end_date} ({b.duration_days} days) • Phone: {b.farmer_phone}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {b.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(b.id, 'ACCEPTED')}
                        className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept Inward Lot</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(b.id, 'REJECTED')}
                        className="px-3 py-1.5 border border-red-300 text-red-700 hover:bg-red-50 rounded-lg font-bold flex items-center space-x-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </>
                  )}
                  {b.status === 'CONFIRMED' && (
                    <span className="text-xs text-emerald-800 font-bold flex items-center space-x-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Slot Allocated</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: HELPDESK & DISPUTES */}
      {activeTab === 'helpdesk' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-600" />
                Storage Provider Admin Inquiries & Helpdesk
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Contact the AgriSaarthi Central Platform Administration for capacity disputes, subsidy allocations, or WDRA compliance
              </p>
            </div>
            <button
              onClick={() => setIsInquiryModalOpen(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Launch Inquiry Chatbot</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
              <h4 className="font-bold text-amber-900 text-sm">Capacity & Storage Disputes</h4>
              <p className="text-amber-800 leading-relaxed">
                Need verification for farmer weighment discrepancies or moisture loss deductions? Open a dispute ticket with automated triage.
              </p>
              <button
                onClick={() => setIsInquiryModalOpen(true)}
                className="text-amber-900 font-bold hover:underline"
              >
                Open Dispute Ticket →
              </button>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-2">
              <h4 className="font-bold text-blue-900 text-sm">Cold Chain & Power Subsidies</h4>
              <p className="text-blue-800 leading-relaxed">
                Connect with agricultural logistics administrators for PMKSY cold-room grid electricity subsidy clearances.
              </p>
              <button
                onClick={() => setIsInquiryModalOpen(true)}
                className="text-blue-900 font-bold hover:underline"
              >
                Inquire on Subsidy Desk →
              </button>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
              <h4 className="font-bold text-emerald-900 text-sm">e-NWR Electronic Receipts</h4>
              <p className="text-emerald-800 leading-relaxed">
                Issues generating electronic negotiable warehouse receipts for bank pledge loans? Chat with our backend integration team.
              </p>
              <button
                onClick={() => setIsInquiryModalOpen(true)}
                className="text-emerald-900 font-bold hover:underline"
              >
                Ask Technical Desk →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Warehouse Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-base text-stone-900">Add New Storage Facility</h3>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleCreateWarehouse} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Facility Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TNWC Pollachi Central Depot Unit 3"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Total Capacity (kg)</label>
                  <input
                    type="number"
                    value={formData.total_capacity_kg}
                    onChange={(e) => setFormData({ ...formData, total_capacity_kg: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Rate (₹/kg/day)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.rate_inr}
                    onChange={(e) => setFormData({ ...formData, rate_inr: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Address & Taluk</label>
                <input
                  type="text"
                  required
                  placeholder="SIPCOT Industrial Area, Pollachi"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="cold-chain-cb"
                  checked={formData.humidity_control}
                  onChange={(e) => setFormData({ ...formData, humidity_control: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="cold-chain-cb" className="font-semibold text-stone-700">
                  Equipped with 2°C - 8°C Multi-Chamber Cold Chain
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold"
                >
                  Publish Warehouse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inquiry Chatbot Modal */}
      <InquiryChatbotModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        defaultCategory="CAPACITY_DISPUTE"
        initialContextPrompt="I am contacting the administrator regarding warehouse logistics and capacity dispute..."
      />
    </div>
  );
};
