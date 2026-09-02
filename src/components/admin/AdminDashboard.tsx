import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { SystemHealthStats, AuditLog, AdminInquiry } from '../../types';
import { AdminTableViewer } from './AdminTableViewer';
import {
  Shield,
  Database,
  Activity,
  Server,
  Cpu,
  Lock,
  RefreshCw,
  CheckCircle2,
  Users,
  Warehouse,
  Camera,
  Layers,
  FileText,
  AlertTriangle,
  MessageSquare,
  Sparkles,
  Send,
  User,
  Clock,
  Check,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { activeAdminTab, setActiveAdminTab, showToast } = useApp();

  const [health, setHealth] = useState<SystemHealthStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<AdminInquiry | null>(null);
  const [adminResponseText, setAdminResponseText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const loadAdminMetrics = async () => {
    setLoading(true);
    try {
      const [h, logs, inq] = await Promise.all([
        api.getSystemHealth(),
        api.getAuditLogs(),
        api.getInquiries(),
      ]);
      setHealth(h);
      setAuditLogs(logs);
      setInquiries(inq);
      if (inq.length > 0 && !selectedInquiry) {
        setSelectedInquiry(inq[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminMetrics();
  }, []);

  const handleResolveInquiry = async (id: string) => {
    try {
      await api.updateInquiry(id, {
        status: 'RESOLVED',
        admin_response: adminResponseText || 'Your inquiry has been investigated and resolved by the Agricultural Department desk.',
      });
      showToast(`Inquiry #${id} resolved.`);
      loadAdminMetrics();
      setAdminResponseText('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry || !adminResponseText.trim()) return;
    setIsReplying(true);
    try {
      await api.updateInquiry(selectedInquiry.id, {
        status: 'RESOLVED',
        admin_response: adminResponseText,
      });
      showToast(`Response dispatched to ${selectedInquiry.user_name}.`);
      setAdminResponseText('');
      loadAdminMetrics();
    } catch (e) {
      console.error(e);
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-stone-900 to-stone-950 text-white rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-indigo-800/60">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white">Admin & Database Hub</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-800 text-indigo-200 border border-indigo-700">
                System Superuser
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              Platform telemetry, 30+ relational table management, and farmer/provider inquiry triage
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadAdminMetrics}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Health</span>
          </button>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-stone-100 p-1.5 rounded-xl border border-stone-200 w-fit text-xs font-semibold">
        <button
          onClick={() => setActiveAdminTab('overview')}
          className={`px-4 py-1.5 rounded-lg transition-all ${
            activeAdminTab === 'overview' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          System Health & Stats
        </button>
        <button
          onClick={() => setActiveAdminTab('inquiries' as any)}
          className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
            (activeAdminTab as any) === 'inquiries' ? 'bg-indigo-700 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Inquiries & Chatbot Tickets ({inquiries.filter((i) => i.status !== 'RESOLVED').length} Open)</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('tables')}
          className={`px-4 py-1.5 rounded-lg transition-all ${
            activeAdminTab === 'tables' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Database Table Browser (30+ Schemas)
        </button>
        <button
          onClick={() => setActiveAdminTab('audit')}
          className={`px-4 py-1.5 rounded-lg transition-all ${
            activeAdminTab === 'audit' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* INQUIRIES DESK TAB */}
      {(activeAdminTab as any) === 'inquiries' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inquiry List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900">Inbound User Inquiries</span>
              <span className="text-[10px] bg-stone-100 font-bold px-2 py-0.5 rounded text-stone-600">
                {inquiries.length} Total
              </span>
            </div>

            <div className="space-y-2">
              {inquiries.map((inq) => {
                const isSelected = selectedInquiry?.id === inq.id;
                return (
                  <div
                    key={inq.id}
                    onClick={() => setSelectedInquiry(inq)}
                    className={`bg-white border rounded-2xl p-4 shadow-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-stone-900">{inq.user_name}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          inq.status === 'RESOLVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inq.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inq.status}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-indigo-900 mt-1 line-clamp-1">{inq.subject}</p>
                    <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-2">{inq.message}</p>

                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-stone-100 text-[10px] text-stone-400">
                      <span>{inq.category} • {inq.user_role}</span>
                      <span>{new Date(inq.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inquiry Detail View */}
          <div className="lg:col-span-7">
            {selectedInquiry ? (
              <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-5 sticky top-6">
                <div className="flex items-start justify-between border-b border-stone-100 pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                        {selectedInquiry.category}
                      </span>
                      <span className="text-xs text-stone-400 font-mono">ID: {selectedInquiry.id}</span>
                    </div>
                    <h3 className="font-bold text-base text-stone-900 mt-1">{selectedInquiry.subject}</h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      From: <strong>{selectedInquiry.user_name}</strong> ({selectedInquiry.user_role}) • Phone: {selectedInquiry.user_phone || 'N/A'}
                    </p>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      selectedInquiry.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {selectedInquiry.status}
                  </span>
                </div>

                {/* User Message Box */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Inquiry Content</span>
                  <p className="text-stone-800 leading-relaxed whitespace-pre-wrap">{selectedInquiry.message}</p>
                </div>

                {/* Existing Admin Response */}
                {selectedInquiry.admin_response && (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1.5">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Platform Admin Response
                    </span>
                    <p className="text-emerald-950 leading-relaxed">{selectedInquiry.admin_response}</p>
                  </div>
                )}

                {/* Admin Reply Form */}
                <form onSubmit={handleSendResponse} className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-stone-700">
                    {selectedInquiry.admin_response ? 'Update Official Response' : 'Draft Official Response & Resolve'}
                  </label>
                  <textarea
                    rows={3}
                    value={adminResponseText}
                    onChange={(e) => setAdminResponseText(e.target.value)}
                    placeholder="Type official instruction or resolution message for the user..."
                    className="w-full p-3 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-indigo-500 font-medium"
                  />

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleResolveInquiry(selectedInquiry.id)}
                      className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Mark Resolved</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isReplying || !adminResponseText.trim()}
                      className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isReplying ? 'Sending...' : 'Send Response'}</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center text-stone-400 text-xs">
                Select an inquiry from the list to review and reply.
              </div>
            )}
          </div>
        </div>
      )}

      {activeAdminTab === 'overview' && health && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
              <p className="text-stone-400 text-[10px] uppercase font-bold">Registered Farmers</p>
              <p className="text-2xl font-black text-stone-900 mt-1">{health.total_farmers}</p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-1">Active Profiles</p>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
              <p className="text-stone-400 text-[10px] uppercase font-bold">Warehouses Indexed</p>
              <p className="text-2xl font-black text-amber-700 mt-1">{health.total_warehouses}</p>
              <p className="text-[10px] text-stone-400 mt-1">CWC & State SWCs</p>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
              <p className="text-stone-400 text-[10px] uppercase font-bold">Space Bookings</p>
              <p className="text-2xl font-black text-emerald-700 mt-1">{health.total_bookings}</p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-1">Capacity Verified</p>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
              <p className="text-stone-400 text-[10px] uppercase font-bold">Plant Health Scans</p>
              <p className="text-2xl font-black text-purple-700 mt-1">{health.total_plant_scans}</p>
              <p className="text-[10px] text-purple-600 font-semibold mt-1">Computer Vision</p>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
              <p className="text-stone-400 text-[10px] uppercase font-bold">Soil Health Tests</p>
              <p className="text-2xl font-black text-blue-700 mt-1">{health.total_soil_tests}</p>
              <p className="text-[10px] text-blue-600 font-semibold mt-1">12 Parameters</p>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
              <p className="text-stone-400 text-[10px] uppercase font-bold">Database Latency</p>
              <p className="text-2xl font-black text-emerald-700 mt-1">{health.database_latency_ms} ms</p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-1">PostgreSQL Ready</p>
            </div>
          </div>

          {/* Architecture Status Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-stone-900 flex items-center space-x-2">
                <Server className="w-5 h-5 text-indigo-600" />
                <span>Relational Database Engine Status</span>
              </h3>
              <div className="space-y-2 text-xs text-stone-600">
                <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl">
                  <span>Database Engine:</span>
                  <strong className="text-stone-900">PostgreSQL (Relational Supabase Core)</strong>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl">
                  <span>Schema Completeness:</span>
                  <strong className="text-emerald-700">30+ Relational Schemas Active</strong>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl">
                  <span>Anti-Overbooking Concurrency:</span>
                  <strong className="text-emerald-700">Atomic Capacity Ledger</strong>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl">
                  <span>Audit Logging:</span>
                  <strong className="text-emerald-700">Enabled (Every Action Audited)</strong>
                </div>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-stone-900 flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-emerald-600" />
                <span>AI Diagnostics & Reasoning Engine</span>
              </h3>
              <div className="space-y-2 text-xs text-stone-600">
                <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl">
                  <span>Primary Vision Model:</span>
                  <strong className="text-stone-900">Gemini 3.7 Flash + PlantCV Heuristics</strong>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl">
                  <span>Multilingual Support:</span>
                  <strong className="text-emerald-700">6 Indian Languages (En, Ta, Hi, Te, Mr, Kn)</strong>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl">
                  <span>Model Latency:</span>
                  <strong className="text-emerald-700">{health.ai_model_latency_ms} ms (Fast Stream)</strong>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl">
                  <span>Advisory Context:</span>
                  <strong className="text-stone-900">Farm Soil, Crop History, Live Mandi Rates</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeAdminTab === 'tables' && <AdminTableViewer />}

      {activeAdminTab === 'audit' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-stone-900">System Audit Trail Stream</h3>
          <p className="text-xs text-stone-500">Every transactional event, booking, plant scan, and data mutation is recorded</p>

          <div className="divide-y divide-stone-100 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-800">
                      {log.action}
                    </span>
                    <span className="font-bold text-stone-900">{log.entity_name}</span>
                    <span className="text-[10px] text-stone-400 font-mono">#{log.entity_id}</span>
                  </div>
                  <p className="text-stone-500 text-[11px]">
                    User: {log.user_id} ({log.role}) • {log.ip_address}
                  </p>
                </div>
                <span className="text-[11px] text-stone-400">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
