import React, { useState } from 'react';
import {
  ShieldCheck,
  Key,
  Lock,
  Mail,
  User,
  Phone,
  Building,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Server,
  ArrowRight
} from 'lucide-react';
import { store } from '../../services/store';

interface GenesisAdminSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GenesisAdminSetupModal: React.FC<GenesisAdminSetupModalProps> = ({ isOpen, onClose }) => {
  const state = store.getState();
  const existingSuperAdmin = (state.adminUsers || []).find((u) => u.isRootSuperAdmin) || state.adminUsers?.[0];

  const [activeStep, setActiveStep] = useState<'info' | 'bootstrap' | 'credentials'>('info');
  const [rootName, setRootName] = useState(existingSuperAdmin?.name || 'Farai Ndlovu');
  const [rootEmail, setRootEmail] = useState(existingSuperAdmin?.email || 'admin@ride.co.zw');
  const [rootPhone, setRootPhone] = useState(existingSuperAdmin?.phone || '+263 77 123 4567');
  const [masterKey, setMasterKey] = useState('GENESIS-ZW-2026-ROOT-KEY');
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [bootstrapSuccess, setBootstrapSuccess] = useState(false);

  if (!isOpen) return null;

  const handleBootstrap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rootName || !rootEmail) return;

    setIsBootstrapping(true);
    setTimeout(() => {
      store.bootstrapRootSuperAdmin({
        name: rootName,
        email: rootEmail,
        phone: rootPhone,
        department: 'Executive Operations & Core Platform Infrastructure'
      });
      setIsBootstrapping(false);
      setBootstrapSuccess(true);
      setActiveStep('credentials');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-sky-900 text-white p-5 flex items-center justify-between border-b border-sky-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">RideZW Root Administrator</h3>
                <span className="px-2 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-mono font-bold">
                  GENESIS SEED
                </span>
              </div>
              <p className="text-xs text-sky-200">
                How the Initial Super-Admin is provisioned & authenticated
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {activeStep === 'info' && (
            <div className="space-y-4 text-xs">
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-sky-900 font-bold text-sm">
                  <Server className="w-4 h-4 text-sky-700" />
                  <span>Production Initial Administrator Architecture</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  In a production multi-tenant deployment of RideZW, how is the first administrator created?
                </p>
                <div className="space-y-1.5 pt-1 text-[11px] text-slate-600">
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-sky-200 text-sky-900 flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <strong className="text-slate-900">Database Genesis Seed (Environment Secret)</strong>: The database migration script executes an initial seed statement creating the root super administrator account (<code className="bg-white px-1 py-0.5 border rounded text-sky-900 font-mono">admin@ride.co.zw</code>).
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-sky-200 text-sky-900 flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <strong className="text-slate-900">Out-of-the-Box Interactive Setup Wizard</strong>: If an empty database is deployed, navigating to the Admin Portal automatically launches the Genesis Bootstrap Wizard to configure the initial master key and executive contact.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-sky-200 text-sky-900 flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <strong className="text-slate-900">Subsequent Operator Invitation Flow</strong>: Once logged in, the Super Administrator invites dispatchers, compliance leads, and treasury auditors using the Staff Management tab.
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block text-xs">Current Root Administrator</span>
                  <span className="text-[11px] font-mono text-slate-600">
                    {existingSuperAdmin?.name} • {existingSuperAdmin?.email}
                  </span>
                </div>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded font-mono font-bold text-[10px]">
                  PROVISIONED & ACTIVE
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep('bootstrap')}
                  className="px-4 py-2 rounded-lg bg-sky-900 hover:bg-sky-950 text-amber-400 font-bold shadow-xs flex items-center gap-1.5"
                >
                  <span>Reconfigure Root Admin / Genesis Credentials</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {activeStep === 'bootstrap' && (
            <form onSubmit={handleBootstrap} className="space-y-3.5 text-xs">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-amber-900 text-[11px] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Configuring root administrator credentials for Zimbabwe RideZW Master Node.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Super-Admin Full Name</label>
                  <input
                    type="text"
                    required
                    value={rootName}
                    onChange={(e) => setRootName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:border-sky-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Super-Admin Email</label>
                  <input
                    type="email"
                    required
                    value={rootEmail}
                    onChange={(e) => setRootEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:border-sky-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Direct Phone (ZRP/Alerts)</label>
                  <input
                    type="text"
                    required
                    value={rootPhone}
                    onChange={(e) => setRootPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:border-sky-600 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Platform Master Security Key</label>
                  <input
                    type="text"
                    value={masterKey}
                    onChange={(e) => setMasterKey(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:border-sky-600 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStep('info')}
                  className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isBootstrapping}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isBootstrapping ? (
                    <span>Initializing Genesis Seed...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Commit Root Super-Admin</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {activeStep === 'credentials' && (
            <div className="space-y-4 text-xs">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-emerald-950 text-sm">Root Super-Admin Active</h4>
                <p className="text-emerald-800 text-[11px]">
                  The initial administrator account has been successfully verified on the RideZW core cluster.
                </p>
              </div>

              <div className="bg-slate-900 text-slate-100 rounded-xl p-3.5 font-mono text-[11px] space-y-1.5">
                <div className="text-amber-400 font-bold text-[10px]">INITIAL LOGIN CREDENTIALS</div>
                <div>EMAIL: <span className="text-white font-bold">{rootEmail}</span></div>
                <div>NAME: <span className="text-white">{rootName}</span></div>
                <div>ROLE: <span className="text-amber-300">ROOT_SUPER_ADMIN (ALL_PERMISSIONS)</span></div>
                <div>MASTER KEY: <span className="text-sky-300">{masterKey}</span></div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-sky-900 hover:bg-sky-950 text-amber-400 font-bold shadow-xs"
                >
                  Done & Continue to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
