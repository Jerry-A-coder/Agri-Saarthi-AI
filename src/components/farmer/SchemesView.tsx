import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { GovernmentScheme, SchemeApplication } from '../../types';
import {
  FileCheck2,
  ExternalLink,
  CheckCircle2,
  Clock,
  Plus,
  ShieldCheck,
  Search,
  Filter,
  DollarSign,
  Building,
  X,
} from 'lucide-react';

export const SchemesView: React.FC = () => {
  const { currentUser, farmerProfile, showToast, refreshNotifications } = useApp();

  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [applications, setApplications] = useState<SchemeApplication[]>([]);
  const [selectedScheme, setSelectedScheme] = useState<GovernmentScheme | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [landArea, setLandArea] = useState(6.5);
  const [aadhaarLastFour, setAadhaarLastFour] = useState('7654');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [schList, applList] = await Promise.all([
        api.getSchemes(),
        api.getSchemeApplications(currentUser?.id || 'usr_farmer_1'),
      ]);
      setSchemes(schList);
      setApplications(applList);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScheme) return;

    setIsSubmitting(true);
    try {
      await api.submitSchemeApplication({
        schemeId: selectedScheme.id,
        schemeTitle: selectedScheme.title,
        farmerId: currentUser?.id || 'usr_farmer_1',
        farmerName: farmerProfile?.farmer_name || 'Murugan Palaniswamy',
        landArea,
        aadhaarLastFour,
      });

      showToast(`Application submitted for ${selectedScheme.title}. VAO endorsement queued.`);
      setIsApplyModalOpen(false);
      refreshNotifications();
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">Government Agricultural Schemes & Direct Subsidies</h2>
            <p className="text-xs text-stone-500">
              Direct integration with PM-KISAN, PMFBY, SMAM, and State Micro-Irrigation Schemes
            </p>
          </div>
        </div>
      </div>

      {/* My Submitted Applications */}
      {applications.length > 0 && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-stone-900">My Scheme Applications & Tracking</h3>

          <div className="space-y-3">
            {applications.map((appl) => (
              <div
                key={appl.id}
                className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-stone-900">{appl.scheme_title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-200 text-stone-700">
                      App #{appl.application_number}
                    </span>
                  </div>
                  <p className="text-stone-500 mt-1">
                    Submitted: {appl.submitted_date} • Last 4 Aadhaar: XXXX-XXXX-{appl.aadhaar_last_four}
                  </p>
                  <p className="text-emerald-800 font-medium mt-1">{appl.remarks}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    appl.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : appl.status === 'DISBURSED'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {appl.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Scheme Directory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {schemes.map((sch) => (
          <div
            key={sch.id}
            className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-700">
                  {sch.category}
                </span>
                <span className="text-xs font-bold text-emerald-700">{sch.benefit_amount}</span>
              </div>

              <h3 className="font-bold text-base text-stone-900">{sch.title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{sch.description}</p>

              <div className="space-y-1.5 pt-2 border-t border-stone-100 text-xs">
                <p className="font-semibold text-stone-700">Eligibility Criteria:</p>
                <p className="text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
                  {sch.eligibility_criteria}
                </p>
              </div>

              <div className="space-y-1 text-xs text-stone-500">
                <p>Required Documents: <strong>{(sch.required_documents || []).join(', ')}</strong></p>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => {
                  setSelectedScheme(sch);
                  setIsApplyModalOpen(true);
                }}
                className="flex-1 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center space-x-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Apply with Farm Profile</span>
              </button>

              <a
                href={sch.portal_url}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center space-x-1"
                title="Official Portal"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Application Modal */}
      {isApplyModalOpen && selectedScheme && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-stone-900">Apply for Scheme</h3>
                <p className="text-xs text-stone-500">{selectedScheme.title}</p>
              </div>
              <button onClick={() => setIsApplyModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Beneficiary Name</label>
                <input
                  type="text"
                  readOnly
                  value={farmerProfile?.farmer_name || 'Murugan Palaniswamy'}
                  className="w-full px-3 py-2 rounded-xl bg-stone-100 border border-stone-300 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Land Area (Acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={landArea}
                    onChange={(e) => setLandArea(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Aadhaar (Last 4 digits)</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={aadhaarLastFour}
                    onChange={(e) => setAadhaarLastFour(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono text-center font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-emerald-950">
                <p className="font-semibold text-xs">Direct DBT Verification:</p>
                <p className="text-[11px] text-emerald-800">
                  Subsidies will be credited to Aadhaar-seeded Bank Account (Canara Bank Pollachi Rural).
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
