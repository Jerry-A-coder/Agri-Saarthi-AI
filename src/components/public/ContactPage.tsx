import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle2, Building, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ContactPage: React.FC = () => {
  const { showToast } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    district: '',
    queryType: 'General Agricultural Query',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    showToast('Your inquiry has been routed to the District Agricultural Extension Officer.');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Helpline & Extension Services
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          Agricultural Support & KVK Network
        </h1>
        <p className="text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Connect directly with state agricultural extension officers, Krishi Vigyan Kendras (KVK), and technical support.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Support Directory */}
        <div className="space-y-6">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-stone-900 flex items-center space-x-2">
              <Phone className="w-5 h-5 text-emerald-600" />
              <span>National Toll-Free Helplines</span>
            </h3>

            <div className="space-y-3 text-xs text-stone-600">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
                <p className="font-bold text-stone-900">Kisan Call Center (Ministry of Agriculture)</p>
                <p className="text-sm font-black text-emerald-700 mt-0.5">1800-180-1551</p>
                <p className="text-[10px] text-stone-400">Available 6:00 AM to 10:00 PM in 22 regional languages</p>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
                <p className="font-bold text-stone-900">PM-KISAN Helpdesk</p>
                <p className="text-sm font-black text-stone-800 mt-0.5">155261 / 011-24300606</p>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
                <p className="font-bold text-stone-900">Central Warehousing Corporation (CWC) Support</p>
                <p className="text-sm font-black text-stone-800 mt-0.5">011-26515178</p>
                <p className="text-[10px] text-stone-400">Storage booking, e-NWR receipts & grading dispute assistance</p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-900 text-white rounded-2xl p-6 space-y-2">
            <h4 className="font-bold text-sm text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Technical Coordination</span>
            </h4>
            <p className="text-xs text-emerald-200 leading-relaxed">
              Taskforce Titans • Smart India Hackathon 2025 • Contact: jerrygodwin04@gmail.com
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs">
          <h3 className="text-base font-bold text-stone-900 mb-4">Send a Direct Agronomic Inquiry</h3>

          {submitted ? (
            <div className="p-6 text-center space-y-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-emerald-950 text-sm">Inquiry Submitted Successfully</h4>
              <p className="text-xs text-emerald-800">
                Your ticket has been logged into the AgriSaarthi service request database. A certified KVK officer will contact you within 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-2 text-xs font-bold text-emerald-700 underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Farmer / User Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Murugan P."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98420 00000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">District / State</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Coimbatore, Tamil Nadu"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Query Category</label>
                <select
                  value={formData.queryType}
                  onChange={(e) => setFormData({ ...formData, queryType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option>General Agricultural Query</option>
                  <option>Plant Disease & Pest Help</option>
                  <option>Warehouse & Cold Storage Booking</option>
                  <option>Soil Health Card Testing</option>
                  <option>Government Scheme Application Issue</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Message / Farm Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your crop condition or storage requirement..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Request to Extension Officer</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
