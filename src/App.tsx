import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { OfflineStatusBanner } from './components/common/OfflineStatusBanner';
import { LandingPage } from './components/public/LandingPage';
import { AboutPage } from './components/public/AboutPage';
import { HowItWorksPage } from './components/public/HowItWorksPage';
import { FeaturesPage } from './components/public/FeaturesPage';
import { ContactPage } from './components/public/ContactPage';
import { FarmerDashboard } from './components/farmer/FarmerDashboard';
import { ProviderDashboard } from './components/provider/ProviderDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { role, activePublicTab, toastMessage, gpsError } = useApp();

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans antialiased selection:bg-emerald-200 selection:text-emerald-950">
      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2.5 text-xs font-medium border border-stone-800 animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* GPS Warning if any */}
      {gpsError && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 text-xs px-4 py-2 text-center flex items-center justify-center space-x-2">
          <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
          <span>{gpsError}</span>
        </div>
      )}

      <Header />
      <OfflineStatusBanner />

      <main className="flex-1">
        {role === 'public' && (
          <>
            {activePublicTab === 'home' && <LandingPage />}
            {activePublicTab === 'about' && <AboutPage />}
            {activePublicTab === 'how-it-works' && <HowItWorksPage />}
            {activePublicTab === 'features' && <FeaturesPage />}
            {activePublicTab === 'contact' && <ContactPage />}
          </>
        )}

        {role === 'farmer' && <FarmerDashboard />}
        {role === 'provider' && <ProviderDashboard />}
        {role === 'admin' && <AdminDashboard />}
      </main>

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
