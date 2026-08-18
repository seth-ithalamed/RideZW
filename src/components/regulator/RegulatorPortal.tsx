import React, { useState } from 'react';
import {
  Building2,
  Shield,
  FileCheck2,
  AlertOctagon,
  Scale,
  DollarSign,
  Key,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Radio,
  FileText,
  Search,
  Filter,
  Send,
  Lock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  QrCode,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { store } from '../../services/store';
import {
  Currency,
  Language,
  GovernmentPermit,
  PermitTypeConfig,
  PermitAppeal,
  PlatformIntegrator
} from '../../types';

interface RegulatorPortalProps {
  currency: Currency;
  language: Language;
}

export const RegulatorPortal: React.FC<RegulatorPortalProps> = ({ currency }) => {
  const state = store.getState();
  const [activeRegTab, setActiveRegTab] = useState<'applications' | 'appeals' | 'permits_list' | 'revenue'>('applications');
  const [selectedPermit, setSelectedPermit] = useState<GovernmentPermit | null>(state.governmentPermits[0] || null);
  const [officialName, setOfficialName] = useState('Eng. N. Mutsvangwa (Senior Licensing Official)');
  const [searchQuery, setSearchQuery] = useState('');

  // Format currency helper
  const formatMoney = (amountUSD: number) => {
    if (currency === 'ZWG') {
      const zwg = amountUSD * state.settings.exchangeRateUSDToZWG;
      return `${zwg.toFixed(1)} ZiG`;
    }
    return `$${amountUSD.toFixed(2)}`;
  };

  const totalPermits = state.governmentPermits.length;
  const activePermits = state.governmentPermits.filter((p) => p.status === 'active').length;
  const suspendedPermits = state.governmentPermits.filter((p) => p.status === 'suspended').length;
  const pendingApps = state.governmentPermits.filter((p) => p.status === 'under_review' || p.status === 'submitted').length;
  const pendingAppeals = state.permitAppeals.filter((a) => a.status === 'submitted').length;
  const totalGovFees = state.permitFees.reduce((acc, f) => acc + f.amountUSD, 0);

  const handleDecision = (
    permitId: string,
    decision: 'approve' | 'reject' | 'suspend' | 'revoke' | 'reinstate',
    reason?: string
  ) => {
    store.regulatorDecidePermit({
      permitId,
      decision,
      reason,
      officialName
    });
    const updated = store.getState().governmentPermits.find((p) => p.id === permitId);
    if (updated) setSelectedPermit(updated);
  };

  const filteredPermits = state.governmentPermits.filter((p) =>
    p.driverFullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.permitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.nationalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.vehicleRegistration.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Regulator Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-sky-900 border border-sky-800 text-amber-400 flex items-center justify-center font-bold shadow-xs">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-slate-900 font-bold text-xs">National E-Hailing Operations Permit & Compliance Registry</h2>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-sky-900 border border-amber-400/40">
                EXCLUSIVE WRITE AUTHORITY
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              Statutory licensing node for Republic of Zimbabwe • Official RideZW Integrated Transport Authority Node
            </p>
          </div>
        </div>

        {/* Official Officer Badge */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded text-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-[11px] font-semibold text-slate-700">{officialName}</span>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Active Licenses</span>
          <p className="text-base font-mono font-bold text-emerald-700 mt-0.5">{activePermits}</p>
          <span className="text-[9px] text-slate-500 font-mono">Total Issued: {totalPermits}</span>
        </div>

        <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Pending Applications</span>
          <p className="text-base font-mono font-bold text-sky-800 mt-0.5">{pendingApps}</p>
          <span className="text-[9px] text-slate-500">Queue review required</span>
        </div>

        <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Active Suspensions</span>
          <p className="text-base font-mono font-bold text-rose-600 mt-0.5">{suspendedPermits}</p>
          <span className="text-[9px] text-slate-500">Gated across all apps</span>
        </div>

        <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Statutory Revenue</span>
          <p className="text-base font-mono font-bold text-slate-900 mt-0.5">{formatMoney(totalGovFees)}</p>
          <span className="text-[9px] text-emerald-700 font-bold">Government Treasury</span>
        </div>
      </div>

      {/* Regulator Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-1.5 overflow-x-auto scrollbar-none">
        {[
          { id: 'applications', label: 'Application Queue', icon: FileCheck2, badge: pendingApps },
          { id: 'appeals', label: 'Appeals Tribunal', icon: Scale, badge: pendingAppeals },
          { id: 'permits_list', label: 'National Registry Audit', icon: Shield },
          { id: 'revenue', label: 'Statutory Fee Ledgers', icon: DollarSign }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeRegTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveRegTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-sky-900 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-amber-400 text-slate-950' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ============================================================= */}
      {/* TAB 1: APPLICATION QUEUE */}
      {/* ============================================================= */}
      {activeRegTab === 'applications' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
            <div className="p-3 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-slate-900 font-bold text-xs">Applications Awaiting Regulatory Adjudication</h4>
              <span className="text-[10px] font-mono text-slate-500">{pendingApps} PENDING</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
                  <tr>
                    <th className="cell-condensed">Applicant / National ID</th>
                    <th className="cell-condensed">Permit Type</th>
                    <th className="cell-condensed">Vehicle Reg</th>
                    <th className="cell-condensed">Fee Status</th>
                    <th className="cell-condensed text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {state.governmentPermits
                    .filter((p) => p.status === 'under_review' || p.status === 'submitted')
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedPermit(p)}>
                        <td className="cell-condensed">
                          <strong className="text-slate-900 block">{p.driverFullName}</strong>
                          <span className="mono text-[10px] text-slate-500">{p.nationalId}</span>
                        </td>
                        <td className="cell-condensed text-slate-700">{p.permitTypeName}</td>
                        <td className="cell-condensed mono font-bold text-slate-800">{p.vehicleRegistration}</td>
                        <td className="cell-condensed">
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {p.status}
                          </span>
                        </td>
                        <td className="cell-condensed text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDecision(p.id, 'approve');
                            }}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                          >
                            Approve & Issue
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Adjudication Detail Drawer */}
          {selectedPermit && (
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
              <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                <h4 className="text-slate-900 font-bold text-xs">Permit Inspector</h4>
                <span className="mono font-bold text-[10px] text-slate-600">{selectedPermit.permitNumber}</span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Applicant:</span>
                  <p className="font-bold text-slate-900">{selectedPermit.driverFullName}</p>
                  <p className="text-slate-500 font-mono text-[10px]">{selectedPermit.nationalId} • {selectedPermit.phone}</p>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Vehicle:</span>
                  <p className="font-bold text-slate-900">{selectedPermit.vehicleMakeModel} ({selectedPermit.vehicleRegistration})</p>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Current Status:</span>
                  <span className="font-mono font-bold uppercase text-[10px] text-indigo-600">{selectedPermit.status}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <button
                  onClick={() => handleDecision(selectedPermit.id, 'approve')}
                  className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded shadow-xs"
                >
                  Approve & Issue Permit
                </button>
                <button
                  onClick={() => {
                    const reason = prompt('Enter suspension reason:');
                    if (reason) handleDecision(selectedPermit.id, 'suspend', reason);
                  }}
                  className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded shadow-xs"
                >
                  Suspend Permit
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 2: APPEALS TRIBUNAL */}
      {/* ============================================================= */}
      {activeRegTab === 'appeals' && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="p-3 border-b border-slate-100 flex items-center justify-between">
            <h4 className="text-slate-900 font-bold text-xs">Appeals Lodged by Suspended Drivers</h4>
            <span className="text-[10px] font-mono text-slate-500">{state.permitAppeals.length} TOTAL APPEALS</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
                <tr>
                  <th className="cell-condensed">Permit Reference</th>
                  <th className="cell-condensed">Driver Reason</th>
                  <th className="cell-condensed">Status</th>
                  <th className="cell-condensed text-right">Tribunal Decision</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {state.permitAppeals.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-400 text-xs">
                      No active appeals lodged.
                    </td>
                  </tr>
                ) : (
                  state.permitAppeals.map((appeal) => (
                    <tr key={appeal.id} className="hover:bg-slate-50">
                      <td className="cell-condensed mono font-bold text-slate-900">{appeal.permitNumber}</td>
                      <td className="cell-condensed text-slate-700">{appeal.reasonForAppeal}</td>
                      <td className="cell-condensed">
                        <span className="font-mono font-bold uppercase text-[9px] px-1.5 py-0.2 bg-amber-50 text-amber-700 rounded">
                          {appeal.status}
                        </span>
                      </td>
                      <td className="cell-condensed text-right">
                        {appeal.status === 'submitted' && (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => store.resolveAppeal(appeal.id, 'approved', 'Reinstated by tribunal')}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                            >
                              Reinstate
                            </button>
                            <button
                              onClick={() => store.resolveAppeal(appeal.id, 'rejected', 'Appeal dismissed')}
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold"
                            >
                              Dismiss
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 3: NATIONAL REGISTRY AUDIT */}
      {/* ============================================================= */}
      {activeRegTab === 'permits_list' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 p-2.5 rounded-lg shadow-xs">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search registry by Permit Number, National ID, or Vehicle Plate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:bg-white"
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
                  <tr>
                    <th className="cell-condensed">Permit #</th>
                    <th className="cell-condensed">Holder Name & ID</th>
                    <th className="cell-condensed">Vehicle Registration</th>
                    <th className="cell-condensed">Classification</th>
                    <th className="cell-condensed">Status</th>
                    <th className="cell-condensed">Expiry</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {filteredPermits.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="cell-condensed mono font-bold text-slate-900">{p.permitNumber}</td>
                      <td className="cell-condensed">
                        <strong className="text-slate-900 block">{p.driverFullName}</strong>
                        <span className="mono text-[10px] text-slate-500">{p.nationalId}</span>
                      </td>
                      <td className="cell-condensed mono font-bold text-slate-800">{p.vehicleRegistration}</td>
                      <td className="cell-condensed text-slate-700">{p.permitTypeName}</td>
                      <td className="cell-condensed">
                        <span
                          className={`font-mono font-bold uppercase text-[9px] px-1.5 py-0.2 rounded ${
                            p.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : p.status === 'suspended'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="cell-condensed mono text-slate-500">{p.expiryDate || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 4: REVENUE & STATUTORY FEES */}
      {/* ============================================================= */}
      {activeRegTab === 'revenue' && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="p-3 border-b border-slate-100 flex items-center justify-between">
            <h4 className="text-slate-900 font-bold text-xs">Statutory Government Fee Transactions</h4>
            <span className="text-[10px] font-mono text-emerald-700 font-bold">TOTAL: {formatMoney(totalGovFees)}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
                <tr>
                  <th className="cell-condensed">Applicant Name</th>
                  <th className="cell-condensed">Amount</th>
                  <th className="cell-condensed">Payment Rail</th>
                  <th className="cell-condensed">Reference Code</th>
                  <th className="cell-condensed">Timestamp</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {state.permitFees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-slate-50">
                    <td className="cell-condensed font-bold text-slate-900">{fee.applicantName}</td>
                    <td className="cell-condensed mono font-bold text-emerald-700">{formatMoney(fee.amountUSD)}</td>
                    <td className="cell-condensed uppercase font-mono text-slate-600">{fee.paymentMethod}</td>
                    <td className="cell-condensed mono text-slate-500">{fee.paymentRef}</td>
                    <td className="cell-condensed text-slate-400 text-[10px]">
                      {new Date(fee.paidAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
