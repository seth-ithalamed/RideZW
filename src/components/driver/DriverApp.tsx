import React, { useState } from 'react';
import {
  Car,
  DollarSign,
  Power,
  ShieldAlert,
  ShieldCheck,
  QrCode,
  ArrowUpRight,
  RefreshCw,
  Clock,
  AlertCircle,
  FileText,
  CreditCard,
  Building2,
  CheckCircle2,
  XCircle,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Upload,
  Send,
  Navigation,
  Sparkles,
  Phone,
  UserCheck,
  Activity,
  LogOut
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { store } from '../../services/store';
import { MapVisualizer } from '../common/MapVisualizer';
import {
  Currency,
  Language,
  DriverProfile,
  PaymentMethod,
  VehicleCategory
} from '../../types';
import { TRANSLATIONS } from '../../data/mockData';

interface DriverAppProps {
  currency: Currency;
  language: Language;
}

export const DriverApp: React.FC<DriverAppProps> = ({ currency, language }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const state = store.getState();
  const activeDriver = state.drivers.find((d) => d.id === state.activeDriverId) || state.drivers[0];
  const activeTrip = state.activeTrip;

  const [driverTab, setDriverTab] = useState<'hud' | 'wallet' | 'permit' | 'kyc'>('hud');

  // Counter offer state
  const [customCounter, setCustomCounter] = useState<number>(0);
  const [showCounterInput, setShowCounterInput] = useState(false);

  // Top-up modal state
  const [topupAmount, setTopupAmount] = useState<number>(15.0);
  const [topupMethod, setTopupMethod] = useState<PaymentMethod>('ecocash');
  const [showTopupModal, setShowTopupModal] = useState(false);

  // Payout request modal
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(20.0);
  const [payoutMethod, setPayoutMethod] = useState<'ecocash' | 'onemoney' | 'innbucks' | 'telecash' | 'zipit_bank' | 'cash_office'>('ecocash');
  const [payoutAccount, setPayoutAccount] = useState<string>(activeDriver.phone);

  // Permit Application Form state
  const [showApplyPermitModal, setShowApplyPermitModal] = useState(false);
  const [permitTypeId, setPermitTypeId] = useState<string>(state.permitTypes[0]?.id || 'pt-phc-urban');
  const [permitFeeMethod, setPermitFeeMethod] = useState<'ecocash' | 'onemoney' | 'innbucks' | 'card'>('ecocash');

  // Appeal Modal state
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealReason, setAppealReason] = useState('');

  // Cash Collection Modal
  const [showCashCollectModal, setShowCashCollectModal] = useState(false);

  // Format money helper (fees rounded up)
  const formatMoney = (amountUSD: number) => {
    if (currency === 'ZWG') {
      const zwg = Math.ceil(amountUSD * state.settings.exchangeRateUSDToZWG);
      return `${zwg} ZiG`;
    }
    return `$${Math.ceil(amountUSD).toFixed(2)}`;
  };

  // Find linked government permit from registry
  const govPermit = state.governmentPermits.find(
    (p) => p.nationalId === activeDriver.nationalId || p.permitNumber === activeDriver.governmentPermitNumber
  );

  const handleToggleOnline = () => {
    try {
      store.setDriverOnline(activeDriver.id, !activeDriver.isOnline);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAcceptRiderPrice = () => {
    if (!activeTrip) return;
    try {
      store.driverSubmitOffer(activeDriver.id, activeTrip.proposedFareUSD);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSendCounterOffer = () => {
    if (!activeTrip || customCounter <= 0) return;
    try {
      store.driverSubmitOffer(activeDriver.id, customCounter);
      setShowCounterInput(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleConfirmCashCollection = () => {
    store.completeTrip(activeTrip?.agreedFareUSD);
    setShowCashCollectModal(false);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  const handleSettleDebt = () => {
    store.driverSettleDebt(activeDriver.id, topupAmount, topupMethod);
    setShowTopupModal(false);
    confetti({ particleCount: 40, spread: 50 });
  };

  const handleRequestWithdrawal = () => {
    try {
      store.requestPayout({
        driverId: activeDriver.id,
        amountUSD: payoutAmount,
        method: payoutMethod,
        accountNumber: payoutAccount,
        accountName: activeDriver.name
      });
      setShowPayoutModal(false);
      alert('Withdrawal request submitted successfully to mobile money rail!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleApplyGovernmentPermit = () => {
    store.applyForGovernmentPermit({
      nationalId: activeDriver.nationalId,
      driverFullName: activeDriver.name,
      phone: activeDriver.phone,
      email: activeDriver.email,
      permitTypeId,
      vehicleRegistration: activeDriver.vehicle.plateNumber,
      vehicleMakeModel: `${activeDriver.vehicle.make} ${activeDriver.vehicle.model}`,
      vehicleYear: activeDriver.vehicle.year,
      vehicleCategory: activeDriver.vehicle.category,
      paymentMethod: permitFeeMethod
    });
    setShowApplyPermitModal(false);
    alert('Government E-Hailing Permit application and fee payment submitted to the Ministry of Transport!');
  };

  const handleDriverAppeal = () => {
    if (!govPermit || !appealReason.trim()) return;
    store.submitAppeal({
      permitId: govPermit.id,
      reason: appealReason
    });
    setShowAppealModal(false);
    setAppealReason('');
    alert('Appeal lodged with the Transport Regulatory Appeals Tribunal.');
  };

  const driverLedger = state.ledger.filter((l) => l.driverId === activeDriver.id);

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Driver Cockpit Top Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={activeDriver.avatarUrl}
              alt={activeDriver.name}
              className="w-10 h-10 rounded object-cover border border-slate-200"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-slate-900 font-bold text-xs">{activeDriver.name}</h2>
                <span className="text-[10px] font-mono text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded">
                  ★ {activeDriver.rating} ({activeDriver.totalTrips} rides)
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-500">
                {activeDriver.vehicle.make} {activeDriver.vehicle.model} •{' '}
                <strong className="text-slate-800">{activeDriver.vehicle.plateNumber}</strong>
              </p>
            </div>
          </div>

          {/* Switch Driver Profile & Logout */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Profile:</span>
              <select
                value={activeDriver.id}
                onChange={(e) => store.setActiveDriver(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-sky-800 font-bold focus:outline-none focus:bg-white"
              >
                {state.drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.governmentPermitStatus?.toUpperCase() || 'NO PERMIT'})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => store.setActiveTab('landing')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all shadow-2xs"
              title="Log out of Driver Cockpit"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>

        {/* Status Indicators & Online Toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
          {/* Online Toggle */}
          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-200">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Availability</span>
              <span className={`text-xs font-mono font-bold ${activeDriver.isOnline ? 'text-emerald-700' : 'text-slate-500'}`}>
                {activeDriver.isOnline ? 'ONLINE (Radar Active)' : 'OFFLINE'}
              </span>
            </div>
            <button
              onClick={handleToggleOnline}
              className={`px-3 py-1 rounded text-xs font-bold transition-all shadow-xs ${
                activeDriver.isOnline
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <Power className="w-3.5 h-3.5 inline mr-1" />
              <span>{activeDriver.isOnline ? 'Go Offline' : 'Go Online'}</span>
            </button>
          </div>

          {/* Wallet Balance & Debt */}
          <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Net Balance</span>
              <span
                className={`text-sm font-mono font-bold ${
                  activeDriver.walletBalance < 0 ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {formatMoney(activeDriver.walletBalance)}
              </span>
            </div>
            {activeDriver.walletBalance < 0 ? (
              <button
                onClick={() => setShowTopupModal(true)}
                className="px-2.5 py-1 rounded bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 shadow-xs"
              >
                Settle Debt
              </button>
            ) : (
              <button
                onClick={() => setShowPayoutModal(true)}
                className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-[11px] shadow-xs"
              >
                Withdraw
              </button>
            )}
          </div>

          {/* Government Permit Status Badge */}
          <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Gov Permit</span>
              <span
                className={`text-xs font-mono font-bold uppercase flex items-center gap-1 ${
                  activeDriver.governmentPermitStatus === 'valid'
                    ? 'text-emerald-700'
                    : activeDriver.governmentPermitStatus === 'suspended'
                    ? 'text-rose-600'
                    : activeDriver.governmentPermitStatus === 'expired'
                    ? 'text-amber-700'
                    : 'text-slate-500'
                }`}
              >
                {activeDriver.governmentPermitStatus === 'valid' ? (
                  <ShieldCheck className="w-3.5 h-3.5" />
                ) : (
                  <ShieldAlert className="w-3.5 h-3.5" />
                )}
                {activeDriver.governmentPermitStatus || 'NOT ISSUED'}
              </span>
            </div>
            <button
              onClick={() => setDriverTab('permit')}
              className="px-2 py-1 rounded bg-white border border-slate-200 text-sky-800 hover:bg-slate-100 font-bold text-[11px] flex items-center gap-1 shadow-xs"
            >
              <QrCode className="w-3 h-3 text-amber-500" />
              <span>Badge</span>
            </button>
          </div>
        </div>

        {/* Debt Ceiling Exceeded Warning */}
        {activeDriver.isBlockedDueToDebt && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                <strong>Unpaid Cash-Trip Debt Ceiling Exceeded!</strong> Balance is {formatMoney(activeDriver.walletBalance)} (Limit: -$15.00). Settle via EcoCash/InnBucks.
              </span>
            </div>
            <button
              onClick={() => setShowTopupModal(true)}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded shrink-0 shadow-xs"
            >
              Pay Debt Now
            </button>
          </div>
        )}
      </div>

      {/* Driver Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-1.5 overflow-x-auto scrollbar-none">
        {[
          { id: 'hud', label: 'Ride Radar & HUD', icon: Navigation },
          { id: 'wallet', label: 'Earnings & Ledger', icon: DollarSign },
          { id: 'permit', label: 'Government Permit Registry', icon: Building2 },
          { id: 'kyc', label: 'Platform KYC Documents', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = driverTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setDriverTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-slate-100 text-indigo-600 font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================= */}
      {/* TAB 1: RIDE RADAR & HUD */}
      {/* ============================================================= */}
      {driverTab === 'hud' && (
        <div className="space-y-4">
          <MapVisualizer
            pickup={activeTrip ? activeTrip.pickup : null}
            destination={activeTrip ? activeTrip.destination : null}
            driverLocation={{
              lat: activeDriver.currentLat,
              lng: activeDriver.currentLng,
              name: activeDriver.name,
              plate: activeDriver.vehicle.plateNumber,
              category: activeDriver.vehicle.category
            }}
            progressPercent={activeTrip?.routeProgress || 0}
            height="h-64 sm:h-72"
            city={activeDriver.city}
          />

          {/* ACTIVE INCOMING FARE REQUEST */}
          {activeTrip && activeTrip.status === 'negotiating' && (
            <div className="bg-white border-2 border-indigo-500 rounded-lg p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                  <h3 className="text-slate-900 font-bold text-sm">Incoming Fare Offer ({activeTrip.category.toUpperCase()})</h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Rider Proposes</span>
                  <span className="text-base font-mono font-extrabold text-indigo-600">
                    {formatMoney(activeTrip.proposedFareUSD)}
                  </span>
                </div>
              </div>

              {/* Rider & Route Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs bg-slate-50 p-2.5 rounded border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Rider:</span>
                  <p className="font-bold text-slate-900">{activeTrip.riderName}</p>
                  <p className="text-slate-500 text-[11px]">Payment: <strong className="text-slate-700 uppercase">{activeTrip.paymentMethod}</strong></p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Route:</span>
                  <p className="text-slate-700 truncate"><strong>Pickup:</strong> {activeTrip.pickup.address}</p>
                  <p className="text-slate-700 truncate"><strong>Dropoff:</strong> {activeTrip.destination.address}</p>
                  <p className="text-slate-500 font-mono text-[10px] mt-0.5">{activeTrip.distanceKm} km • ~{activeTrip.estimatedDurationMin} mins</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleAcceptRiderPrice}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded shadow-xs flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Accept at {formatMoney(activeTrip.proposedFareUSD)}</span>
                </button>

                <button
                  onClick={() => {
                    setCustomCounter(Math.ceil(activeTrip.proposedFareUSD + 2.0));
                    setShowCounterInput(true);
                  }}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold text-xs rounded shadow-xs flex items-center justify-center gap-1.5"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-sky-800" />
                  <span>Propose Counter-Offer</span>
                </button>
              </div>

              {/* Counter Offer Input Sub-panel */}
              {showCounterInput && (
                <div className="p-3 bg-slate-50 rounded border border-indigo-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700">Your Counter Price (USD):</label>
                    <span className="text-sm font-mono font-bold text-indigo-600">${Math.ceil(customCounter).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3].map((bump) => (
                      <button
                        key={bump}
                        onClick={() => setCustomCounter(Math.ceil(activeTrip.proposedFareUSD + bump))}
                        className="flex-1 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded font-mono font-bold text-xs"
                      >
                        +${bump}.00 (${Math.ceil(activeTrip.proposedFareUSD + bump).toFixed(2)})
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowCounterInput(false)}
                      className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendCounterOffer}
                      className="flex-1 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded shadow-xs"
                    >
                      Send Offer to Passenger
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ACTIVE DISPATCHED TRIP IN PROGRESS HUD */}
          {activeTrip && activeTrip.driverId === activeDriver.id && activeTrip.status !== 'negotiating' && (
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <span className="text-[9px] uppercase font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {activeTrip.status.toUpperCase()}
                  </span>
                  <h3 className="text-slate-900 font-bold text-xs mt-1">Passenger: {activeTrip.riderName}</h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Agreed Fare</span>
                  <span className="text-base font-mono font-bold text-emerald-700">{formatMoney(activeTrip.agreedFareUSD)}</span>
                </div>
              </div>

              {/* GPS Coordinates & Live Turn-by-Turn Navigation Trigger */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                    <Navigation className="w-3.5 h-3.5 text-sky-600" />
                    <span>Target: {activeTrip.status === 'driver_arriving' ? 'Pickup Point' : 'Destination Point'}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">
                    {activeTrip.status === 'driver_arriving'
                      ? `${activeTrip.pickup.lat.toFixed(4)}, ${activeTrip.pickup.lng.toFixed(4)}`
                      : `${activeTrip.destination.lat.toFixed(4)}, ${activeTrip.destination.lng.toFixed(4)}`}
                  </span>
                </div>

                <div className="flex gap-2">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${
                      activeTrip.status === 'driver_arriving'
                        ? `${activeTrip.pickup.lat},${activeTrip.pickup.lng}`
                        : `${activeTrip.destination.lat},${activeTrip.destination.lng}`
                    }&travelmode=driving`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-1.5 px-2 bg-sky-600 hover:bg-sky-700 text-white rounded text-center text-xs font-bold flex items-center justify-center gap-1 shadow-2xs"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Open Google Maps GPS</span>
                  </a>

                  <a
                    href={`https://waze.com/ul?ll=${
                      activeTrip.status === 'driver_arriving'
                        ? `${activeTrip.pickup.lat},${activeTrip.pickup.lng}`
                        : `${activeTrip.destination.lat},${activeTrip.destination.lng}`
                    }&navigate=yes`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-1.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-center text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <span>Waze</span>
                  </a>
                </div>
              </div>

              {/* Progress Buttons */}
              <div className="space-y-2">
                {activeTrip.status === 'driver_arriving' && (
                  <button
                    onClick={() => store.driverMarkArrived()}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded shadow-xs"
                  >
                    I Have Arrived at Pickup Point
                  </button>
                )}

                {activeTrip.status === 'arrived' && (
                  <button
                    onClick={() => store.startTrip()}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded shadow-xs"
                  >
                    Rider Boarded — Start Trip
                  </button>
                )}

                {activeTrip.status === 'in_progress' && (
                  <>
                    {activeTrip.paymentMethod === 'cash' ? (
                      <button
                        onClick={() => setShowCashCollectModal(true)}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded shadow-xs"
                      >
                        Collect ${activeTrip.agreedFareUSD.toFixed(2)} Cash & Complete Trip
                      </button>
                    ) : (
                      <button
                        onClick={() => store.completeTrip()}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded shadow-xs"
                      >
                        Complete In-App Digital Trip (${activeTrip.agreedFareUSD.toFixed(2)})
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Idle Radar State */}
          {!activeTrip && (
            <div className="bg-white border border-slate-200 rounded-lg p-6 text-center space-y-2 shadow-xs">
              <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 text-indigo-600 flex items-center justify-center mx-auto">
                <Car className="w-5 h-5" />
              </div>
              <h4 className="text-slate-900 font-bold text-xs">
                {activeDriver.isOnline ? 'Radar Active — Scanning for Nearby Requests...' : 'Driver Cockpit Offline'}
              </h4>
              <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                {activeDriver.isOnline
                  ? 'Incoming fare proposals across Zimbabwe (Harare, Bulawayo, Victoria Falls, Mutare, Gweru, Masvingo, etc.) will appear here with upfront estimates. Switch to Rider Console to create a test request!'
                  : 'Toggle availability above to start receiving ride proposals and negotiate fares.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 2: FINANCIAL WALLET & LEDGER */}
      {/* ============================================================= */}
      {driverTab === 'wallet' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Net Balance</span>
              <p
                className={`text-xl font-mono font-bold mt-1 ${
                  activeDriver.walletBalance < 0 ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {formatMoney(activeDriver.walletBalance)}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {activeDriver.walletBalance < 0
                  ? `Cash debt: ${formatMoney(Math.abs(activeDriver.walletBalance))}`
                  : 'Available for instant withdrawal'}
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Plan</span>
              <p className="text-sm font-bold text-slate-900 mt-1 capitalize">
                {activeDriver.subscriptionTier.replace('_', ' ')}
              </p>
              {(() => {
                const driverPricing = state.pricingConfigs.find((p) => p.category === activeDriver.vehicle.category) || state.pricingConfigs[0];
                const comm = driverPricing?.commissionPercentage ?? 12;
                return (
                  <p className="text-[10px] text-sky-800 font-bold mt-0.5">
                    {activeDriver.subscriptionTier === 'commission'
                      ? `${comm}% Platform Commission (${(100 - comm).toFixed(0)}% Net Payout)`
                      : `Unlimited pass until ${activeDriver.subscriptionExpiry}`}
                  </p>
                );
              })()}
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cash Debt Ceiling</span>
              <p className="text-xl font-mono font-bold text-slate-900 mt-1">{formatMoney(state.settings.driverDebtCeilingUSD)}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Dispatch blocked if debt exceeds limit</p>
            </div>
          </div>

          {/* Subscription Tier Upgrade Switcher */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
            <div>
              <h4 className="text-slate-900 font-bold text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Driver Subscription Passes (0% Commission)</span>
              </h4>
              <p className="text-[11px] text-slate-500">
                Switch to a flat weekly or monthly pass to eliminate all per-trip commission fees!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 text-xs block">Weekly Unlimited Pass</span>
                  <span className="text-indigo-600 font-mono font-bold text-sm">${state.settings.subscriptionWeeklyUSD.toFixed(2)}</span>
                  <span className="text-[9px] text-slate-500 block">7 days of 0% commission rides</span>
                </div>
                <button
                  onClick={() => store.buySubscription(activeDriver.id, 'weekly_pass')}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded shadow-xs"
                >
                  Activate
                </button>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 text-xs block">Monthly Unlimited Pass</span>
                  <span className="text-indigo-600 font-mono font-bold text-sm">${state.settings.subscriptionMonthlyUSD.toFixed(2)}</span>
                  <span className="text-[9px] text-slate-500 block">30 days of 0% commission rides</span>
                </div>
                <button
                  onClick={() => store.buySubscription(activeDriver.id, 'monthly_pass')}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded shadow-xs"
                >
                  Activate
                </button>
              </div>
            </div>
          </div>

          {/* Immutable Append-Only Ledger Table */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
            <div className="p-3 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-slate-900 font-bold text-xs flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>Financial Ledger (Append-Only Source of Truth)</span>
              </h4>
              <span className="text-[10px] font-mono text-slate-500">{driverLedger.length} ENTRIES</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
                  <tr>
                    <th className="cell-condensed">Type / Description</th>
                    <th className="cell-condensed">Reference</th>
                    <th className="cell-condensed">Amount</th>
                    <th className="cell-condensed">Balance After</th>
                    <th className="cell-condensed">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {driverLedger.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50">
                      <td className="cell-condensed font-medium text-slate-800 capitalize">
                        {entry.entryType.replace(/_/g, ' ')}
                        <span className="text-slate-400 text-[10px] block font-normal">{entry.description}</span>
                      </td>
                      <td className="cell-condensed mono text-slate-500 text-[11px]">{entry.referenceId}</td>
                      <td
                        className={`cell-condensed mono font-bold ${
                          entry.amount >= 0 ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {entry.amount >= 0 ? `+${formatMoney(entry.amount)}` : formatMoney(entry.amount)}
                      </td>
                      <td className="cell-condensed mono font-bold text-slate-900">{formatMoney(entry.balanceAfter)}</td>
                      <td className="cell-condensed text-slate-400 text-[10px]">
                        {new Date(entry.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 3: MANAGE GOVERNMENT PERMIT (Integrated with Registry) */}
      {/* ============================================================= */}
      {driverTab === 'permit' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-slate-900 font-bold text-sm">Government Operations Permit Badge</h3>
                </div>
                <p className="text-[11px] text-slate-500">
                  Authoritative e-hailing compliance credential issued by the Ministry of Transport.
                </p>
              </div>

              {!govPermit ? (
                <button
                  onClick={() => setShowApplyPermitModal(true)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded shadow-xs"
                >
                  Apply for Permit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  {govPermit.status === 'suspended' && (
                    <button
                      onClick={() => setShowAppealModal(true)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded shadow-xs"
                    >
                      Lodge Appeal
                    </button>
                  )}
                  {govPermit.status === 'expired' && (
                    <button
                      onClick={() => setShowApplyPermitModal(true)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded shadow-xs"
                    >
                      Renew Permit
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Digital QR Permit Card */}
            {govPermit ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-50 p-4 rounded-lg border border-slate-200">
                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center p-3 bg-white rounded border border-slate-200 shadow-xs">
                  <QRCodeSVG
                    value={`RIDEZW:PERMIT:${govPermit.permitNumber}:${govPermit.nationalId}:${govPermit.status.toUpperCase()}`}
                    size={140}
                    level="H"
                  />
                  <span className="mono font-bold text-slate-900 text-[10px] mt-1.5 text-center">
                    {govPermit.permitNumber}
                  </span>
                  <span className="text-[8px] text-slate-400 uppercase tracking-wider">
                    Roadside Scan QR
                  </span>
                </div>

                {/* Permit Metadata */}
                <div className="md:col-span-2 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Permit Number:</span>
                    <span className="mono font-bold text-slate-900">{govPermit.permitNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Holder Name:</span>
                    <span className="font-bold text-slate-900">{govPermit.driverFullName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">National ID:</span>
                    <span className="mono text-slate-700">{govPermit.nationalId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Classification:</span>
                    <span className="text-indigo-600 font-bold">{govPermit.permitTypeName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Vehicle Registration:</span>
                    <span className="mono font-bold text-slate-900">
                      {govPermit.vehicleRegistration} ({govPermit.vehicleMakeModel})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Compliance Status:</span>
                    <span
                      className={`font-mono font-bold uppercase px-2 py-0.2 rounded text-[10px] ${
                        govPermit.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : govPermit.status === 'suspended'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {govPermit.status}
                    </span>
                  </div>
                  {govPermit.expiryDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Expiry Date:</span>
                      <span className="mono font-bold text-slate-900">{govPermit.expiryDate}</span>
                    </div>
                  )}
                  {govPermit.statusReason && (
                    <div className="p-2 bg-rose-50 border border-rose-200 rounded text-rose-800 text-[10px]">
                      <strong>Notice:</strong> {govPermit.statusReason}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-50 rounded border border-slate-200 space-y-2">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <h4 className="text-slate-900 font-bold text-xs">No Government Permit on Record</h4>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  To operate legally on RideZW and all Zimbabwean e-hailing platforms, you must obtain an operations permit.
                </p>
                <button
                  onClick={() => setShowApplyPermitModal(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded shadow-xs"
                >
                  Submit Application ($35 Fee)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 4: PLATFORM KYC DOCUMENTS */}
      {/* ============================================================= */}
      {driverTab === 'kyc' && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <h3 className="text-slate-900 font-bold text-xs">RideZW Platform KYC Checklist</h3>
              <p className="text-[11px] text-slate-500">
                Platform-level verification documents required to accept rides in Zimbabwe.
              </p>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                activeDriver.kycStatus === 'approved'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              KYC {activeDriver.kycStatus}
            </span>
          </div>

          <div className="space-y-2">
            {[
              { label: 'National Identity Card', id: 'nid' },
              { label: 'Class 4 Driver’s License', id: 'dl' },
              { label: 'Vehicle Registration (Blue Book)', id: 'reg' },
              { label: 'ZRP CID Police Clearance Certificate', id: 'pcr' },
              { label: 'VID Certificate of Fitness', id: 'vid' }
            ].map((doc) => (
              <div
                key={doc.id}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="font-bold text-slate-800">{doc.label}</span>
                </div>
                <span className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200 text-[10px]">
                  <CheckCircle2 className="w-3 h-3" /> VERIFIED
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CASH COLLECTION MODAL */}
      {/* ------------------------------------------------------------- */}
      {showCashCollectModal && activeTrip && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg w-full max-w-sm p-5 shadow-2xl space-y-3 text-center">
            <div className="w-10 h-10 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <DollarSign className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-slate-900 font-bold text-sm">Confirm Cash Collected</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Collect <strong className="text-emerald-700">${activeTrip.agreedFareUSD.toFixed(2)}</strong> from {activeTrip.riderName}.
              </p>
            </div>

            <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-left text-xs space-y-1 text-slate-700">
              <p>
                <strong>Platform Cash Levy (12%):</strong> -${(activeTrip.agreedFareUSD * 0.12).toFixed(2)}
              </p>
              <p className="text-[10px] text-slate-500">
                This levy will be logged in your ledger. If debt exceeds $15.00 ceiling, settle via EcoCash.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCashCollectModal(false)}
                className="flex-1 py-2 rounded bg-slate-100 text-slate-700 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCashCollection}
                className="flex-1 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
              >
                Confirm Received
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SETTLE DEBT MODAL */}
      {/* ------------------------------------------------------------- */}
      {showTopupModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg w-full max-w-sm p-5 shadow-2xl space-y-3">
            <h3 className="text-slate-900 font-bold text-sm">Settle Cash Debt & Top-up</h3>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-0.5">Amount (USD)</label>
                <input
                  type="number"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-0.5">Payment Rail</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {[
                    { id: 'clicknpay', label: 'ClicknPay (OpenAPI)' },
                    { id: 'ecocash', label: 'EcoCash' },
                    { id: 'onemoney', label: 'OneMoney' },
                    { id: 'innbucks', label: 'InnBucks' },
                    { id: 'telecash', label: 'Telecash' },
                    { id: 'zipit_bank', label: 'ZIPIT Bank' }
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      onClick={() => setTopupMethod(pm.id as PaymentMethod)}
                      className={`p-2 rounded border text-left font-bold capitalize text-xs ${
                        topupMethod === pm.id
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-500'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowTopupModal(false)}
                className="flex-1 py-2 rounded bg-slate-100 text-slate-700 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSettleDebt}
                className="flex-1 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
              >
                Pay ${topupAmount.toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* PAYOUT WITHDRAWAL MODAL */}
      {/* ------------------------------------------------------------- */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg w-full max-w-sm p-5 shadow-2xl space-y-3">
            <h3 className="text-slate-900 font-bold text-sm">Withdraw Earnings</h3>
            <p className="text-[11px] text-slate-500">
              Available: <strong className="text-emerald-700 font-mono">{formatMoney(activeDriver.walletBalance)}</strong>
            </p>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-0.5">Withdrawal Amount (USD)</label>
                <input
                  type="number"
                  max={activeDriver.walletBalance}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-0.5">Payout Channel</label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800"
                >
                  <option value="ecocash">EcoCash Mobile Money (+263)</option>
                  <option value="onemoney">OneMoney (+263)</option>
                  <option value="innbucks">InnBucks USD</option>
                  <option value="telecash">Telecash (+263)</option>
                  <option value="zipit_bank">ZIPIT / Instant Bank Account</option>
                  <option value="cash_office">Cash Office Direct Collection</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-0.5">
                  {payoutMethod === 'zipit_bank' ? 'Bank Account / Card Number' : payoutMethod === 'cash_office' ? 'National ID Number' : 'Mobile Number'}
                </label>
                <input
                  type="text"
                  value={payoutAccount}
                  onChange={(e) => setPayoutAccount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowPayoutModal(false)}
                className="flex-1 py-2 rounded bg-slate-100 text-slate-700 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestWithdrawal}
                className="flex-1 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* APPLY PERMIT MODAL */}
      {/* ------------------------------------------------------------- */}
      {showApplyPermitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg w-full max-w-sm p-5 shadow-2xl space-y-3">
            <h3 className="text-slate-900 font-bold text-sm">Government Permit Application</h3>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-0.5">Select Permit Class</label>
                <select
                  value={permitTypeId}
                  onChange={(e) => setPermitTypeId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800"
                >
                  {state.permitTypes.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.name} (${pt.applicationFeeUSD} Fee)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-0.5">Statutory Fee Rail</label>
                <select
                  value={permitFeeMethod}
                  onChange={(e) => setPermitFeeMethod(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800"
                >
                  <option value="ecocash">EcoCash Mobile Money</option>
                  <option value="innbucks">InnBucks USD</option>
                  <option value="onemoney">OneMoney</option>
                  <option value="card">Bank Card (Visa/Mastercard)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowApplyPermitModal(false)}
                className="flex-1 py-2 rounded bg-slate-100 text-slate-700 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyGovernmentPermit}
                className="flex-1 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* APPEAL MODAL */}
      {/* ------------------------------------------------------------- */}
      {showAppealModal && govPermit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg w-full max-w-sm p-5 shadow-2xl space-y-3">
            <h3 className="text-slate-900 font-bold text-sm">Appeal Permit Suspension</h3>
            <p className="text-[11px] text-slate-500">
              Permit #{govPermit.permitNumber} — Enter proof of remediation.
            </p>

            <textarea
              value={appealReason}
              onChange={(e) => setAppealReason(e.target.value)}
              placeholder="State your reasons and document renewal details..."
              className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-800 h-20"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowAppealModal(false)}
                className="flex-1 py-2 rounded bg-slate-100 text-slate-700 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDriverAppeal}
                className="flex-1 py-2 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs"
              >
                Submit Appeal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
