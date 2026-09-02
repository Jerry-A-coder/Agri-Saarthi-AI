import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { SoilLab, SoilTest } from '../../types';
import {
  FlaskConical,
  MapPin,
  CheckCircle2,
  Calendar,
  Phone,
  FileText,
  AlertCircle,
  Plus,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Award,
  Building2,
  Sparkles,
  Info,
  UserCheck,
} from 'lucide-react';
import { InquiryChatbotModal } from '../common/InquiryChatbotModal';

export const SoilLabsView: React.FC = () => {
  const { currentUser, showToast, refreshNotifications, setActiveFarmerTab } = useApp();

  const [soilLabs, setSoilLabs] = useState<SoilLab[]>([]);
  const [soilTests, setSoilTests] = useState<SoilTest[]>([]);
  const [selectedLab, setSelectedLab] = useState<SoilLab | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('Comprehensive Soil Health (12 Parameters)');
  const [collectionType, setCollectionType] = useState('lab_pickup');
  const [pickupAddress, setPickupAddress] = useState('Survey No. 44/2A, Pollachi Rural');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Soil Health Card preview
  const [activeSoilTest, setActiveSoilTest] = useState<SoilTest | null>(null);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [labs, tests] = await Promise.all([
        api.getSoilLabs(),
        api.getSoilTests(currentUser?.id || 'usr_farmer_1'),
      ]);
      setSoilLabs(labs);
      setSoilTests(tests);
      if (tests.length > 0) setActiveSoilTest(tests[0]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLab) return;

    setIsSubmitting(true);
    try {
      await api.requestSoilTest({
        farmerId: currentUser?.id || 'usr_farmer_1',
        farmerName: 'Murugan Palaniswamy',
        farmerPhone: '+91 98421 87654',
        labId: selectedLab.id,
        packageName: selectedPackage,
        collectionType,
        pickupAddress,
        cost: selectedPackage.includes('12 Parameters') ? 50 : 35,
      });

      showToast(`Soil test request logged with ${selectedLab.name}. Lab technician will collect sample.`);
      setIsRequestModalOpen(false);
      refreshNotifications();
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit soil request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">Soil Testing Laboratories & Health Cards</h2>
            <p className="text-xs text-stone-500">
              Government accredited ICAR / NABL testing laboratories with certified soil agronomist verification
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsInquiryModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Ask Admin About Soil Reports</span>
        </button>
      </div>

      {/* Active Soil Health Card Display */}
      {activeSoilTest && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-5">
          {/* Card Header with prominent Lab Details */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-stone-200 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                  SHC Sample #{activeSoilTest.sample_number}
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  Tested: {activeSoilTest.test_date}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  {activeSoilTest.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-stone-900 mt-1">
                Official Soil Health Card ({activeSoilTest.soil_type})
              </h3>
            </div>

            {/* Prominent Certified Lab Name & Accreditation Banner */}
            <div className="bg-blue-50/90 border border-blue-200 rounded-xl p-3 text-right shrink-0 md:max-w-md">
              <div className="flex items-center justify-end space-x-1.5 text-blue-900 font-bold text-xs">
                <Building2 className="w-4 h-4 text-blue-700" />
                <span>{activeSoilTest.lab_name || 'District Agricultural Soil Testing Laboratory Coimbatore'}</span>
              </div>
              <div className="flex items-center justify-end space-x-2 text-[11px] text-blue-700 mt-1">
                <span className="font-semibold flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-600" />
                  {activeSoilTest.lab_accreditation || 'NABL ISO/IEC 17025 Certified • ICAR #TN-204'}
                </span>
                {activeSoilTest.lab_agronomist_name && (
                  <span className="text-stone-500">• In-charge: {activeSoilTest.lab_agronomist_name}</span>
                )}
              </div>
            </div>
          </div>

          {/* Test Selector Tabs if multiple tests */}
          {soilTests.length > 1 && (
            <div className="flex items-center space-x-2 overflow-x-auto pb-1">
              <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider shrink-0">Your Soil Cards:</span>
              {soilTests.map((st) => (
                <button
                  key={st.id}
                  onClick={() => setActiveSoilTest(st)}
                  className={`px-3 py-1 text-xs rounded-lg font-semibold border transition-all ${
                    activeSoilTest.id === st.id
                      ? 'bg-emerald-700 text-white border-emerald-800 shadow-2xs'
                      : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border-stone-200'
                  }`}
                >
                  #{st.sample_number} • {st.soil_type}
                </button>
              ))}
            </div>
          )}

          {/* 12-Parameter Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <p className="text-stone-400 text-[10px] uppercase font-bold">Soil pH (Reaction)</p>
              <p className="text-base font-extrabold text-stone-900 mt-0.5">{activeSoilTest.ph}</p>
              <p className="text-[10px] text-emerald-600 font-semibold">Slightly Acidic (Optimal)</p>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <p className="text-stone-400 text-[10px] uppercase font-bold">Elec. Conductivity (EC)</p>
              <p className="text-base font-extrabold text-stone-900 mt-0.5">{activeSoilTest.ec_ds_m} dS/m</p>
              <p className="text-[10px] text-emerald-600 font-semibold">Normal / Non-saline</p>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <p className="text-stone-400 text-[10px] uppercase font-bold">Organic Carbon (OC)</p>
              <p className="text-base font-extrabold text-amber-700 mt-0.5">{activeSoilTest.organic_carbon_percent}%</p>
              <p className="text-[10px] text-amber-600 font-semibold">Moderate / Needs FYM</p>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <p className="text-stone-400 text-[10px] uppercase font-bold">Available Nitrogen (N)</p>
              <p className="text-base font-extrabold text-red-700 mt-0.5">{activeSoilTest.nitrogen_kg_ha} kg/ha</p>
              <p className="text-[10px] text-red-600 font-semibold">Low (Deficient)</p>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <p className="text-stone-400 text-[10px] uppercase font-bold">Available Phosphorus (P)</p>
              <p className="text-base font-extrabold text-emerald-700 mt-0.5">{activeSoilTest.phosphorus_kg_ha} kg/ha</p>
              <p className="text-[10px] text-emerald-600 font-semibold">Medium</p>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <p className="text-stone-400 text-[10px] uppercase font-bold">Available Potassium (K)</p>
              <p className="text-base font-extrabold text-emerald-700 mt-0.5">{activeSoilTest.potassium_kg_ha} kg/ha</p>
              <p className="text-[10px] text-emerald-600 font-semibold">Adequate</p>
            </div>
          </div>

          {/* Automated Fertilizer Guidance */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Agronomic Fertilizer Recommendations from Testing Lab
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {(activeSoilTest.fertilizer_recommendations || []).map((rec, i) => (
                <div key={i} className="p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center space-x-2 text-stone-800">
                  <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>

            {/* Link to Crop Rotation Advisor */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveFarmerTab('crops')}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Optimize Crop Rotation with this Soil Card</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nearby Labs List */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900">Certified Government & University Soil Labs</h3>
            <p className="text-xs text-stone-500">Pick a laboratory nearby to schedule door-step field sample collection</p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
            {soilLabs.length} Accredited Centers Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {soilLabs.map((lab) => (
            <div
              key={lab.id}
              className="p-5 rounded-xl border border-stone-200 hover:border-emerald-300 bg-stone-50/50 hover:bg-white transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center space-x-1.5 text-xs">
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {lab.accreditation}
                  </span>
                  <span className="text-stone-400">• {lab.state}</span>
                </div>
                <h4 className="font-bold text-sm text-stone-900">{lab.name}</h4>
                <p className="text-xs text-stone-600 flex items-start space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                  <span>{lab.address}, {lab.district}</span>
                </p>
                <p className="text-xs text-stone-500 flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>{lab.contact_phone}</span>
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-200/80 text-xs">
                <div className="flex items-center justify-between text-stone-600">
                  <span>Standard Test Fee:</span>
                  <strong className="text-stone-900">₹{lab.fee_standard_inr} (Govt. Subsidized)</strong>
                </div>
                <div className="flex items-center justify-between text-stone-600">
                  <span>Turnaround Time:</span>
                  <strong className="text-stone-900">{lab.turnaround_days} Days</strong>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedLab(lab);
                    setIsRequestModalOpen(true);
                  }}
                  className="w-full py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center space-x-1 transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Request Sample Collection</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Request Modal */}
      {isRequestModalOpen && selectedLab && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="border-b border-stone-100 pb-3">
              <h3 className="font-bold text-base text-stone-900">Book Soil Test Sample Pickup</h3>
              <p className="text-xs text-stone-500">{selectedLab.name}</p>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Testing Package</label>
                <select
                  value={selectedPackage}
                  onChange={(e) => setSelectedPackage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                >
                  <option>Comprehensive Soil Health (12 Parameters - ₹50)</option>
                  <option>Basic NPK & pH Test (₹35)</option>
                  <option>Micronutrient & Heavy Metal Suite (₹80)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Collection Method</label>
                <select
                  value={collectionType}
                  onChange={(e) => setCollectionType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                >
                  <option value="lab_pickup">KVK Field Executive Door-step Pickup</option>
                  <option value="self_drop">Self-Drop at District Lab</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Farm / Sample Collection Address</label>
                <input
                  type="text"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  {isSubmitting ? 'Booking...' : 'Confirm Request'}
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
        defaultCategory="SOIL_TESTING"
        initialContextPrompt="I have a question about my Soil Health Card results and lab accreditation..."
      />
    </div>
  );
};
