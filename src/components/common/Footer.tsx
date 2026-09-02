import React from 'react';
import { Sprout, Phone, Mail, ShieldCheck, FileText, Database } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const { setRole, setActivePublicTab } = useApp();

  return (
    <footer id="main-footer" className="bg-stone-900 text-stone-300 border-t border-stone-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white">AgriSaarthi AI</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              AI-Based Digital Query Support, Advisory, Soil Intelligence, Plant Disease Diagnosis, and Agricultural Intermediary Facilitation Platform.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-2.5 py-1.5 rounded-md w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>Smart India Hackathon SIH25076 Solution</span>
            </div>
          </div>

          {/* Quick Portals */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Stakeholder Portals</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setRole('farmer')}
                  className="hover:text-emerald-400 transition-colors flex items-center space-x-1.5"
                >
                  <span>🌱 Farmer Portal (Scan Plant, Warehouses)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setRole('provider')}
                  className="hover:text-amber-400 transition-colors flex items-center space-x-1.5"
                >
                  <span>🏭 Storage Provider & CWC/TNWC Depot</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setRole('admin')}
                  className="hover:text-indigo-400 transition-colors flex items-center space-x-1.5"
                >
                  <span>🛡️ Database & System Management Hub</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setRole('public');
                    setActivePublicTab('about');
                  }}
                  className="hover:text-white transition-colors"
                >
                  About AgriSaarthi AI
                </button>
              </li>
            </ul>
          </div>

          {/* Agricultural Helpline & Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Kisan Support & Links</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Kisan Call Center: <strong>1800-180-1551</strong> (Toll Free)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>advisory@agrisaarthi.gov.in</span>
              </li>
              <li>
                <a
                  href="https://pmkisan.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors underline decoration-stone-600 underline-offset-2"
                >
                  PM-KISAN National Portal ↗
                </a>
              </li>
              <li>
                <a
                  href="https://agmarknet.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors underline decoration-stone-600 underline-offset-2"
                >
                  AGMARKNET Mandi Portal ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Technical Specs */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Architecture & Database</h4>
            <p className="text-xs text-stone-400 leading-relaxed mb-3">
              Relational PostgreSQL architecture with 30+ schemas, Gemini 3.7 Flash vision & agronomic reasoning, Leaflet GIS mapping, and real-time capacity management.
            </p>
            <div className="text-[11px] text-stone-500 flex items-center space-x-2">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>Full-Stack REST Architecture</span>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500">
          <p>© {new Date().getFullYear()} AgriSaarthi AI Platform — Taskforce Titans. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 text-[11px]">
            Designed for Indian Agriculture • Food Tech & Rural Development
          </p>
        </div>
      </div>
    </footer>
  );
};
