import React, { useState } from 'react';
import {
  ScanLine,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileWarning,
  Camera,
  MapPin,
  Clock,
  Wifi,
  WifiOff,
  RefreshCw,
  DollarSign,
  Shield,
  Car,
  User,
  Ticket,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { store } from '../../services/store';
import {
  Currency,
  Language,
  GovernmentPermit,
  EnforcementFine
} from '../../types';

interface EnforcerToolProps {
  currency: Currency;
  language: Language;
}

export const EnforcerTool: React.FC<EnforcerToolProps> = ({ currency }) => {
  const state = store.getState();
  const [query, setQuery] = useState('');
  const [isOnlineMode, setIsOnlineMode] = useState(true);
  const [isScanningCamera, setIsScanningCamera] = useState(false);
  const [lookupResult, setLookupResult] = useState<{
    found: boolean;
    permit?: GovernmentPermit;
    status: 'valid' | 'expired' | 'suspended' | 'revoked' | 'not_found';
    driverName?: string;
    vehiclePlate?: string;
    message: string;
  } | null>(null);

  // Fine Issuance Form state
  const [showFineModal, setShowFineModal] = useState(false);
  const [fineReason, setFineReason] = useState<EnforcementFine['violationReason']>('operating_without_permit');
  const [fineAmount, setFineAmount] = useState<number>(50.0);
  const [fineLocation, setFineLocation] = useState('Airport Road Roadblock, Harare');
  const [fineNotes, setFineNotes] = useState('');
  const [issuedTicket, setIssuedTicket] = useState<EnforcementFine | null>(null);

  const enforcerName = 'Sgt. M. Mutasa';
  const enforcerBadge = 'ZRP-TRAFFIC-4912';

  // Format currency helper
  const formatMoney = (amountUSD: number) => {
    if (currency === 'ZWG') {
      const zwg = amountUSD * state.settings.exchangeRateUSDToZWG;
      return `${zwg.toFixed(1)} ZiG`;
    }
    return `$${amountUSD.toFixed(2)}`;
  };

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    const result = store.enforcerLookup(searchTerm);
    setLookupResult(result);
  };

  const handleSimulateQrScan = (permitNumber: string) => {
    setIsScanningCamera(true);
    setTimeout(() => {
      setIsScanningCamera(false);
      setQuery(permitNumber);
      handleSearch(permitNumber);
    }, 1000);
  };

  const handleIssueFine = () => {
    const permit = lookupResult?.permit;
    const fine = store.issueEnforcementFine(
      {
        permitNumber: permit?.permitNumber,
        nationalId: permit?.nationalId || 'UNKNOWN-ID',
        driverName: permit?.driverFullName || lookupResult?.driverName || 'Unregistered Driver',
        vehiclePlate: permit?.vehicleRegistration || query || 'UNREG-PLATE',
        enforcerId: 'ENF-007',
        enforcerName,
        enforcerBadge,
        violationReason: fineReason,
        fineAmountUSD: fineAmount,
        locationName: fineLocation,
        lat: -17.8214,
        lng: 31.0501,
        notes: fineNotes || `Roadside citation issued by ${enforcerBadge}`,
        paymentStatus: 'unpaid'
      },
      false
    );
    setIssuedTicket(fine);
    setShowFineModal(false);
    confetti({ particleCount: 40, spread: 50 });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Enforcer Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-sky-900 border border-sky-800 text-amber-400 flex items-center justify-center font-bold shadow-xs">
            <ScanLine className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-slate-900 font-bold text-xs">Roadside Compliance & Inspection Terminal</h2>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-sky-900 border border-amber-400/40">
                ZRP / VID CHECKPOINT
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              Officer: <strong>{enforcerName}</strong> ({enforcerBadge}) • Direct Query to Gov Registry
            </p>
          </div>
        </div>

        {/* Offline / Online Sync Status */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOnlineMode(!isOnlineMode)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono font-bold border transition-all ${
              isOnlineMode
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {isOnlineMode ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnlineMode ? 'LIVE SYNC (ONLINE)' : 'OFFLINE CACHE (100k Records)'}</span>
          </button>
        </div>
      </div>

      {/* Roadside Search & QR Scan Box */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
        <h3 className="text-slate-900 font-bold text-xs">Instant License & Vehicle Registration Verification</h3>

        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-[240px] flex items-center bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              placeholder="Scan QR, or enter Plate (e.g. AFC-4921) or National ID..."
              className="w-full bg-transparent text-xs text-slate-800 focus:outline-none font-mono"
            />
          </div>

          <button
            onClick={() => handleSearch(query)}
            className="px-4 py-1.5 bg-sky-800 hover:bg-sky-900 text-white font-bold text-xs rounded shadow-xs"
          >
            Verify
          </button>

          <button
            onClick={() => handleSimulateQrScan('ZWG-PHC-2025-081')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded border border-slate-200 flex items-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5 text-sky-800" />
            <span>Simulate QR Scan</span>
          </button>
        </div>

        {/* Quick Sample Query Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
          <span className="text-slate-400 font-bold uppercase">Quick Samples:</span>
          <button
            onClick={() => {
              setQuery('AFC-4921');
              handleSearch('AFC-4921');
            }}
            className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-700 font-mono hover:bg-slate-100"
          >
            AFC-4921 (Valid Permit)
          </button>
          <button
            onClick={() => {
              setQuery('AGX-9012');
              handleSearch('AGX-9012');
            }}
            className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-rose-700 font-mono hover:bg-slate-100"
          >
            AGX-9012 (Suspended)
          </button>
          <button
            onClick={() => {
              setQuery('UNREG-999');
              handleSearch('UNREG-999');
            }}
            className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-500 font-mono hover:bg-slate-100"
          >
            UNREG-999 (Pirate Taxi)
          </button>
        </div>
      </div>

      {/* Inspection Result Stage */}
      {isScanningCamera ? (
        <div className="p-8 bg-slate-900 text-white rounded-lg border border-slate-700 text-center space-y-2">
          <Camera className="w-8 h-8 text-indigo-400 animate-bounce mx-auto" />
          <h4 className="font-bold text-xs font-mono">SCANNING DRIVER DIGITAL QR PERMIT...</h4>
          <p className="text-[10px] text-slate-400">Cryptographically authenticating payload against Government Registry...</p>
        </div>
      ) : lookupResult ? (
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              {lookupResult.status === 'valid' ? (
                <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <XCircle className="w-5 h-5" />
                </div>
              )}
              <div>
                <span
                  className={`px-2 py-0.2 rounded font-mono font-bold uppercase text-[10px] ${
                    lookupResult.status === 'valid'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  STATUS: {lookupResult.status.toUpperCase()}
                </span>
                <h3 className="text-slate-900 font-bold text-xs mt-0.5">{lookupResult.message}</h3>
              </div>
            </div>

            {lookupResult.status !== 'valid' && (
              <button
                onClick={() => setShowFineModal(true)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded shadow-xs flex items-center gap-1.5"
              >
                <FileWarning className="w-3.5 h-3.5" />
                <span>Issue Roadside Fine</span>
              </button>
            )}
          </div>

          {lookupResult.permit && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Driver Details:</span>
                <p className="font-bold text-slate-900">{lookupResult.permit.driverFullName}</p>
                <p className="font-mono text-slate-500 text-[10px]">{lookupResult.permit.nationalId} • {lookupResult.permit.phone}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Vehicle Registration:</span>
                <p className="font-mono font-bold text-slate-900">{lookupResult.permit.vehicleRegistration}</p>
                <p className="text-slate-500 text-[10px]">{lookupResult.permit.vehicleMakeModel} ({lookupResult.permit.permitTypeName})</p>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Roadside Citation Issued Ticket Confirmation */}
      {issuedTicket && (
        <div className="bg-white border-2 border-rose-400 rounded-lg p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-rose-100 pb-2">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-rose-600" />
              <h4 className="text-slate-900 font-bold text-xs">Official Statutory Violation Ticket Issued</h4>
            </div>
            <span className="font-mono font-bold text-xs text-rose-700">{issuedTicket.ticketNumber}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded">
            <div>
              <span className="text-slate-400 text-[10px] block">Offender:</span>
              <strong className="text-slate-900">{issuedTicket.driverName}</strong> ({issuedTicket.vehiclePlate})
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Fine Amount:</span>
              <strong className="text-rose-700 font-mono">{formatMoney(issuedTicket.fineAmountUSD)}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Enforcement History Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="p-3 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-slate-900 font-bold text-xs">Recent Roadside Inspection Citations</h4>
          <span className="text-[10px] font-mono text-slate-500">{state.enforcementFines.length} CITATIONS ISSUED</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
              <tr>
                <th className="cell-condensed">Ticket #</th>
                <th className="cell-condensed">Offender / Plate</th>
                <th className="cell-condensed">Violation Reason</th>
                <th className="cell-condensed">Fine Amount</th>
                <th className="cell-condensed">Status</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {state.enforcementFines.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50">
                  <td className="cell-condensed mono font-bold text-slate-900">{f.ticketNumber}</td>
                  <td className="cell-condensed">
                    <strong className="text-slate-900 block">{f.driverName}</strong>
                    <span className="mono text-[10px] text-slate-500">{f.vehiclePlate}</span>
                  </td>
                  <td className="cell-condensed text-slate-700 capitalize">{f.violationReason.replace(/_/g, ' ')}</td>
                  <td className="cell-condensed mono font-bold text-rose-700">{formatMoney(f.fineAmountUSD)}</td>
                  <td className="cell-condensed">
                    <span className="font-mono uppercase text-[9px] px-1.5 py-0.2 bg-rose-50 text-rose-700 rounded font-bold">
                      {f.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FINE ISSUANCE MODAL */}
      {showFineModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg w-full max-w-sm p-5 shadow-2xl space-y-3">
            <h3 className="text-slate-900 font-bold text-sm">Issue Statutory Violation Citation</h3>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-0.5">Violation Category</label>
                <select
                  value={fineReason}
                  onChange={(e) => setFineReason(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800"
                >
                  <option value="operating_without_permit">Operating Without Gov Permit ($50)</option>
                  <option value="suspended_permit_operation">Operating on Suspended Permit ($100)</option>
                  <option value="vehicle_unroadworthy">Vehicle Unroadworthy / VID Failure ($30)</option>
                  <option value="fare_gouging">Fare Gouging / Non-compliance ($25)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-0.5">Fine Amount (USD)</label>
                <input
                  type="number"
                  value={fineAmount}
                  onChange={(e) => setFineAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-0.5">Roadblock Location</label>
                <input
                  type="text"
                  value={fineLocation}
                  onChange={(e) => setFineLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowFineModal(false)}
                className="flex-1 py-2 rounded bg-slate-100 text-slate-700 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleIssueFine}
                className="flex-1 py-2 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
              >
                Issue Citation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
