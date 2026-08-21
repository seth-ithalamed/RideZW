/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShieldAlert, LogOut, CheckCircle2, ArrowRight } from 'lucide-react';
import { store } from './services/store';
import { Header } from './components/common/Header';
import { LandingPage } from './components/landing/LandingPage';
import { RiderApp } from './components/rider/RiderApp';
import { DriverApp } from './components/driver/DriverApp';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthModal } from './components/auth/AuthModal';
import { DownloadAppModal } from './components/common/DownloadAppModal';
import { CustomDialogModal } from './components/common/CustomDialogModal';
import { Currency, Language, NavigationTab } from './types';

export default function App() {
  const [state, setState] = useState(store.getState());
  const [currency, setCurrency] = useState<Currency>(state.settings.defaultCurrency);
  const [language, setLanguage] = useState<Language>(state.settings.defaultLanguage);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [authRole, setAuthRole] = useState<'rider' | 'driver' | 'admin'>('rider');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setState(store.getState());
    });
    return () => unsubscribe();
  }, []);

  const handleTabChange = (tab: NavigationTab) => {
    store.setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode: 'signin' | 'signup', role: 'rider' | 'driver' | 'admin') => {
    setAuthMode(mode);
    setAuthRole(role);
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    store.logout();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeSosCount = state.sosAlerts.filter((s) => s.status === 'active').length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col font-sans selection:bg-sky-600 selection:text-white">
      {/* Production Header */}
      <Header
        activeTab={state.activeTab}
        setActiveTab={handleTabChange}
        currency={currency}
        setCurrency={setCurrency}
        language={language}
        setLanguage={setLanguage}
        sosCount={activeSosCount}
        onLogout={handleLogout}
        onOpenAuth={handleOpenAuth}
        onOpenDownloadModal={() => setShowDownloadModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 pb-12">
        {state.activeTab === 'landing' && (
          <LandingPage
            currency={currency}
            language={language}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {state.activeTab === 'rider' && (
          <RiderApp currency={currency} language={language} />
        )}

        {state.activeTab === 'driver' && (
          <DriverApp currency={currency} language={language} />
        )}

        {state.activeTab === 'admin' && (
          <AdminDashboard currency={currency} language={language} />
        )}
      </main>

      {/* Clean Production Footer (No Portal Links) */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm">RideZW</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                  YOUR RIDE, ANYTIME
                </span>
              </div>
              <p className="text-[11px] text-slate-500 max-w-md">
                Zimbabwe's premier bilateral fare e-hailing network. Transparent pricing, multi-currency wallets, and verified driver partners.
              </p>
            </div>

            {/* Public Service Links */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
              <span>Harare & Bulawayo</span>
              <span>•</span>
              <span>24/7 ZRP Linked SOS Dispatch</span>
              <span>•</span>
              <span>EcoCash & ZiG Support</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 font-mono">
            <div>
              <span>© {new Date().getFullYear()} RideZW Technologies (Pvt) Ltd. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4">
              <span>OFFICIAL RBZ RATE: 1 USD = 26.85 ZiG</span>
              <span>•</span>
              <span className="text-emerald-600 font-bold">ZIMRA TAX REGISTERED</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
        initialRole={authRole}
      />

      {/* Global Mobile App & Background Push Notifications Modal */}
      <DownloadAppModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        defaultRole="rider"
      />

      {/* Global Custom Alert / Confirm / Prompt Dialog */}
      <CustomDialogModal />

      {/* Single-Instance Session Invalidation Notice */}
      {state.sessionTerminationNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-rose-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">
                Single-Instance Session Enforcement
              </h3>
              <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                Session Terminated on This Device
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 text-left space-y-2">
              <p className="leading-relaxed">
                The account for <strong className="text-slate-950">{state.sessionTerminationNotice.userName}</strong> was just signed in on another device or window.
              </p>
              <div className="p-2 rounded bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-medium">
                🔒 <strong>RideZW Security Protocol:</strong> To protect driver wallets, rider funds, and operational dispatch integrity, only <strong>one active device instance</strong> is allowed per credential at any time.
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Terminated at: {new Date(state.sessionTerminationNotice.terminatedAt).toLocaleTimeString()}
              </p>
            </div>

            <button
              onClick={() => store.clearSessionNotice()}
              className="w-full py-3 rounded-xl bg-sky-950 hover:bg-sky-900 text-amber-400 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Acknowledge & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
