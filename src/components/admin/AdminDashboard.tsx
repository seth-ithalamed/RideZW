import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Car,
  DollarSign,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  Settings,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Sliders,
  Shield,
  Activity,
  ArrowDownRight,
  Sparkles,
  Search,
  Lock,
  Radio,
  Building2,
  FileText,
  Save,
  Percent,
  RefreshCw,
  ShieldOff,
  SlidersHorizontal,
  Calculator,
  UserCheck,
  LogOut,
  Compass,
  MapPin
} from 'lucide-react';
import { store } from '../../services/store';
import { MapVisualizer } from '../common/MapVisualizer';
import { UserManagementTab } from './UserManagementTab';
import { StaffManagementTab } from './StaffManagementTab';
import { CoverageCitiesTab } from './CoverageCitiesTab';
import { GenesisAdminSetupModal } from './GenesisAdminSetupModal';
import {
  Currency,
  Language,
  DriverProfile,
  VehicleCategory,
  PricingConfig,
  Dispute,
  PayoutRequest
} from '../../types';

interface AdminDashboardProps {
  currency: Currency;
  language: Language;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currency }) => {
  const state = store.getState();
  const [adminTab, setAdminTab] = useState<'overview' | 'cities' | 'users' | 'staff' | 'drivers' | 'financials' | 'pricing' | 'sos'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showGenesisModal, setShowGenesisModal] = useState(false);
  const [radarCity, setRadarCity] = useState<string>('Harare');
  
  // Pricing tab local edit state
  const [editingPricing, setEditingPricing] = useState<PricingConfig[]>(() => JSON.parse(JSON.stringify(state.pricingConfigs)));
  const [globalCommissionInput, setGlobalCommissionInput] = useState<number>(12);
  const [simulatedFareUSD, setSimulatedFareUSD] = useState<number>(10);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Settings local state
  const [debtCeilingInput, setDebtCeilingInput] = useState<number>(state.settings.driverDebtCeilingUSD);
  const [weeklySubInput, setWeeklySubInput] = useState<number>(state.settings.subscriptionWeeklyUSD);
  const [monthlySubInput, setMonthlySubInput] = useState<number>(state.settings.subscriptionMonthlyUSD);
  const [exchangeRateInput, setExchangeRateInput] = useState<number>(state.settings.exchangeRateUSDToZWG);
  const [enforcePermitToggle, setEnforcePermitToggle] = useState<boolean>(state.settings.enforceGovernmentPermitGating);

  // Format currency helper
  const formatMoney = (amountUSD: number) => {
    if (currency === 'ZWG') {
      const zwg = amountUSD * state.settings.exchangeRateUSDToZWG;
      return `${zwg.toFixed(1)} ZiG`;
    }
    return `$${amountUSD.toFixed(2)}`;
  };

  // Aggregated KPIs
  const totalDrivers = state.drivers.length;
  const onlineDrivers = store.getActiveDriversCount();
  const pendingKycCount = state.drivers.filter((d) => d.kycStatus === 'pending').length;
  const totalCompletedTrips = state.tripHistory.filter((t) => t.status === 'completed').length;
  
  // Total Platform Commission Revenue
  const totalCommissionRevenue = state.tripHistory.reduce((acc, t) => acc + (t.commissionOwedUSD || 0) + (t.cashLevyOwedUSD || 0), 0);
  
  // Average configured commission rate across categories
  const avgCommission = state.pricingConfigs.length > 0
    ? (state.pricingConfigs.reduce((acc, c) => acc + c.commissionPercentage, 0) / state.pricingConfigs.length).toFixed(1)
    : '12.0';

  // Outstanding Cash Debt Owed by Drivers
  const totalCashDebtOutstanding = state.drivers
    .filter((d) => d.walletBalance < 0)
    .reduce((acc, d) => acc + Math.abs(d.walletBalance), 0);

  const activeSosList = state.sosAlerts.filter((s) => s.status === 'active');
  const pendingPayouts = state.payouts.filter((p) => p.status === 'requested');

  const handleApproveKyc = (driverId: string) => {
    store.updateDriverKycStatus(driverId, 'approved');
  };

  const handleRejectKyc = (driverId: string) => {
    const reason = prompt('Enter KYC rejection reason:');
    if (reason) {
      store.updateDriverKycStatus(driverId, 'rejected', reason);
    }
  };

  const handleApprovePayout = (payoutId: string) => {
    store.approvePayout(payoutId, 'Admin: Operations Desk');
  };

  const handleCategoryFieldChange = (category: VehicleCategory, field: keyof PricingConfig, value: number) => {
    setEditingPricing((prev) =>
      prev.map((c) => (c.category === category ? { ...c, [field]: value } : c))
    );
  };

  const handleSaveAllPricing = () => {
    store.updatePricingConfig(editingPricing);
    store.updatePlatformSettings({
      driverDebtCeilingUSD: debtCeilingInput,
      subscriptionWeeklyUSD: weeklySubInput,
      subscriptionMonthlyUSD: monthlySubInput,
      exchangeRateUSDToZWG: exchangeRateInput,
      enforceGovernmentPermitGating: enforcePermitToggle
    });
    setSaveSuccessMessage('Platform commission rates and algorithm matrices updated successfully!');
    setTimeout(() => setSaveSuccessMessage(null), 4000);
  };

  const handleApplyGlobalCommission = () => {
    const updated = editingPricing.map((c) => ({
      ...c,
      commissionPercentage: globalCommissionInput,
      cashLevyPercentage: globalCommissionInput
    }));
    setEditingPricing(updated);
    store.setGlobalCommissionPercentage(globalCommissionInput);
    setSaveSuccessMessage(`Applied ${globalCommissionInput}% commission & cash-levy rate across all vehicle categories!`);
    setTimeout(() => setSaveSuccessMessage(null), 4000);
  };

  const filteredDrivers = state.drivers.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.vehicle.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.nationalId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-sky-900 border border-sky-800 text-amber-400 flex items-center justify-center font-bold shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-slate-900 font-bold text-xs">RideZW Operations Management Suite</h2>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-sky-900 border border-amber-400/40">
                PROD v2.4
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              Fleet Dispatch, Platform KYC Audits, Commission Ledgers & SOS Dispatch
            </p>
          </div>
        </div>

        {/* Global Stats Counter, Genesis Button & Logout */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[10px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span>Backend & DB Synced</span>
            </div>

            <button
              onClick={() => setShowGenesisModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] transition-all shadow-xs"
              title="Inspect how initial administrator is created"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Root Admin Genesis</span>
            </button>
          </div>

          <div className="text-right border-l border-slate-200 pl-3">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Active Fleet</span>
            <span className="text-xs font-mono font-bold text-emerald-700">{onlineDrivers} / {totalDrivers} Online</span>
          </div>
          <div className="text-right border-l border-slate-200 pl-3">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">SOS Active</span>
            <span className={`text-xs font-mono font-bold ${activeSosList.length > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-600'}`}>
              {activeSosList.length} Alerts
            </span>
          </div>

          <button
            onClick={() => store.logout()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-all shadow-xs ml-1 cursor-pointer"
            title="Log out of Operations Management Suite"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Platform Revenue</span>
          <p className="text-base font-mono font-bold text-slate-900 mt-0.5">{formatMoney(totalCommissionRevenue)}</p>
          <span className="text-[9px] text-emerald-700 font-bold">Avg. {avgCommission}% Commission + Levies</span>
        </div>

        <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Driver Cash Debt</span>
          <p className="text-base font-mono font-bold text-rose-600 mt-0.5">{formatMoney(totalCashDebtOutstanding)}</p>
          <span className="text-[9px] text-slate-500">Unsettled Cash Trip Levies</span>
        </div>

        <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Completed Trips</span>
          <p className="text-base font-mono font-bold text-slate-900 mt-0.5">{totalCompletedTrips}</p>
          <span className="text-[9px] text-slate-500 font-mono">All Coverage Cities</span>
        </div>

        <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">KYC Verification Queue</span>
          <p className="text-base font-mono font-bold text-sky-800 mt-0.5">{pendingKycCount} Pending</p>
          <span className="text-[9px] text-slate-500">Awaiting document audit</span>
        </div>
      </div>

      {/* Main Operations Suite Body with Side Navigation */}
      <div className="flex flex-col lg:flex-row gap-4.5 items-start">
        {/* Left Side Navigation Menu */}
        <aside className="w-full lg:w-64 shrink-0 bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs lg:sticky lg:top-16 space-y-3">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-1">
              Operations Console
            </span>
            <nav className="space-y-0.5">
              {[
                { id: 'overview', label: 'Operations Overview', sub: 'Live GPS Radar', icon: Activity },
                { id: 'cities', label: 'Coverage Cities', sub: '13 Municipal Hubs', icon: Compass, badge: (state.coverageCities || []).length },
                { id: 'users', label: 'Rider Accounts', sub: 'Profiles & Bans', icon: UserCheck, badge: (state.riders || []).filter(r => r.status === 'suspended').length },
                { id: 'staff', label: 'Platform Staff', sub: 'RBAC Management', icon: ShieldCheck, badge: (state.adminUsers || []).length },
                { id: 'drivers', label: 'Fleet & KYC', sub: 'Driver Verification', icon: Users, badge: pendingKycCount },
                { id: 'financials', label: 'Ledgers & Payouts', sub: 'Revenue Audit', icon: DollarSign, badge: pendingPayouts.length },
                { id: 'pricing', label: 'Fare Matrices', sub: 'Commissions & Rates', icon: Sliders },
                { id: 'sos', label: 'SOS Incident Desk', sub: 'Emergency Response', icon: AlertTriangle, badge: activeSosList.length }
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = adminTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setAdminTab(tab.id as any)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${
                      isSelected
                        ? 'bg-sky-950 text-white font-bold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-sky-900 text-amber-400' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold leading-tight truncate">{tab.label}</p>
                        <p className={`text-[10px] leading-tight truncate ${isSelected ? 'text-sky-200' : 'text-slate-400'}`}>
                          {tab.sub}
                        </p>
                      </div>
                    </div>

                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full shrink-0 ml-1 ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950'
                            : tab.id === 'sos'
                            ? 'bg-rose-100 text-rose-700 font-black animate-pulse'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer Info */}
          <div className="border-t border-slate-100 pt-2.5 px-2 text-[10px] space-y-1.5 text-slate-500">
            <div className="flex items-center justify-between">
              <span className="font-medium">RBZ Exchange:</span>
              <span className="font-mono font-bold text-amber-700">{state.settings.exchangeRateUSDToZWG} ZiG</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Debt Ceiling:</span>
              <span className="font-mono font-bold text-slate-800">${state.settings.driverDebtCeilingUSD.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Admin:</span>
              <span className="font-bold text-sky-950">Seth (Super-Admin)</span>
            </div>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main className="flex-1 min-w-0 w-full space-y-4">
          {/* ============================================================= */}
          {/* TAB 1: OVERVIEW & FLEET MAP */}
          {/* ============================================================= */}
      {adminTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-slate-900 font-bold text-xs">Live Metropolitan Radar</h3>
                  <select
                    value={radarCity}
                    onChange={(e) => setRadarCity(e.target.value)}
                    className="p-1 text-[11px] font-bold bg-slate-50 border border-slate-200 rounded text-sky-900 focus:outline-none focus:bg-white"
                  >
                    <option value="All">All Coverage Hubs ({store.getActiveDriversCount()} Active)</option>
                    {(state.coverageCities || []).map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({store.getCityActiveDriversCount(c.name)} active)
                      </option>
                    ))}
                  </select>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {radarCity === 'All' ? store.getActiveDriversCount() : store.getCityActiveDriversCount(radarCity)} ONLINE DRIVERS
                </span>
              </div>
              <MapVisualizer
                nearbyDrivers={store.getActiveDrivers(radarCity === 'All' ? undefined : radarCity).map((d) => ({
                  id: d.id,
                  lat: d.currentLat,
                  lng: d.currentLng,
                  name: d.name,
                  plate: d.vehicle.plateNumber,
                  category: d.vehicle.category
                }))}
                height="h-80"
                city={radarCity === 'All' ? 'Harare' : radarCity}
              />
            </div>

            {/* Active Trips Dispatch Stream */}
            <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs flex flex-col h-96">
              <div className="border-b border-slate-100 pb-2 mb-2 flex items-center justify-between">
                <h4 className="text-slate-900 font-bold text-xs">Live Trip Stream</h4>
                <span className="text-[9px] font-mono px-1.5 py-0.2 bg-emerald-50 text-emerald-700 rounded font-bold">
                  {state.tripHistory.length} Total
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 text-xs">
                {state.tripHistory.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">No active trips currently logged.</div>
                ) : (
                  state.tripHistory.map((trip) => (
                    <div key={trip.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="mono font-bold text-slate-700">{trip.id}</span>
                        <span className="font-mono font-bold uppercase text-indigo-600">{trip.status}</span>
                      </div>
                      <p className="font-bold text-slate-900">{trip.riderName} ↔ {trip.driverName || 'Negotiating'}</p>
                      <p className="text-slate-500 text-[11px] truncate">{trip.pickup.neighborhood} → {trip.destination.neighborhood}</p>
                      <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200 text-slate-500">
                        <span>Fare: <strong className="font-mono text-slate-800">${trip.agreedFareUSD || trip.proposedFareUSD}</strong></span>
                        <span className="uppercase">{trip.paymentMethod}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 2: DRIVERS & KYC AUDIT */}
      {/* ============================================================= */}
      {adminTab === 'drivers' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 p-2.5 rounded-lg shadow-xs">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by driver name, plate number, or National ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:bg-white"
              />
            </div>
            <span className="text-[10px] font-mono text-slate-500">{filteredDrivers.length} DRIVERS REGISTERED</span>
          </div>

          {/* High Density Driver Table */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
                  <tr>
                    <th className="cell-condensed">Driver Profile</th>
                    <th className="cell-condensed">Vehicle & Plate</th>
                    <th className="cell-condensed">Gov Permit Status</th>
                    <th className="cell-condensed">Wallet Balance</th>
                    <th className="cell-condensed">KYC Status</th>
                    <th className="cell-condensed text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {filteredDrivers.map((driver) => (
                    <tr key={driver.id} className="hover:bg-slate-50">
                      <td className="cell-condensed">
                        <div className="flex items-center gap-2">
                          <img
                            src={driver.avatarUrl}
                            alt={driver.name}
                            className="w-7 h-7 rounded object-cover border border-slate-200"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{driver.name}</span>
                            <span className="text-slate-400 text-[10px] font-mono">{driver.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="cell-condensed">
                        <span className="font-mono font-bold text-slate-800 block">{driver.vehicle.plateNumber}</span>
                        <span className="text-slate-500 text-[10px]">{driver.vehicle.make} {driver.vehicle.model} ({driver.vehicle.year})</span>
                      </td>
                      <td className="cell-condensed">
                        <span
                          className={`px-1.5 py-0.2 rounded font-mono font-bold uppercase text-[9px] ${
                            driver.governmentPermitStatus === 'valid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : driver.governmentPermitStatus === 'suspended'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {driver.governmentPermitStatus || 'NOT ISSUED'}
                        </span>
                      </td>
                      <td className="cell-condensed mono font-bold">
                        <span className={driver.walletBalance < 0 ? 'text-rose-600' : 'text-emerald-700'}>
                          {formatMoney(driver.walletBalance)}
                        </span>
                        {driver.isBlockedDueToDebt && (
                          <span className="text-[8px] text-rose-600 uppercase font-bold block">BLOCKED (DEBT)</span>
                        )}
                      </td>
                      <td className="cell-condensed">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                            driver.kycStatus === 'approved'
                              ? 'bg-emerald-50 text-emerald-700'
                              : driver.kycStatus === 'rejected'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {driver.kycStatus}
                        </span>
                      </td>
                      <td className="cell-condensed text-right">
                        {driver.kycStatus === 'pending' ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleApproveKyc(driver.id)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectKyc(driver.id)}
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">AUDITED</span>
                        )}
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
      {/* TAB 1.5: COVERAGE CITIES & HUB GEOFENCING */}
      {/* ============================================================= */}
      {adminTab === 'cities' && (
        <CoverageCitiesTab coverageCities={state.coverageCities || []} />
      )}

      {/* ============================================================= */}
      {/* TAB 2: RIDERS & USER ACCOUNTS */}
      {/* ============================================================= */}
      {adminTab === 'users' && (
        <UserManagementTab currency={currency} />
      )}

      {/* ============================================================= */}
      {/* TAB 2.5: PLATFORM OPERATORS & STAFF MANAGEMENT */}
      {/* ============================================================= */}
      {adminTab === 'staff' && (
        <StaffManagementTab onOpenGenesisSetup={() => setShowGenesisModal(true)} />
      )}

      {/* ============================================================= */}
      {/* TAB 3: FLEET & DRIVER KYC VERIFICATION */}
      {/* ============================================================= */}
      {adminTab === 'drivers' && (
        <div className="space-y-4">
          {/* Driver Fleet Search & Actions Bar */}
          <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-sky-900 text-amber-400 flex items-center justify-center font-bold text-xs">
                  <Car className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-slate-900 font-bold text-xs">Driver Fleet & Document KYC Directory</h3>
                  <p className="text-[10px] text-slate-500">
                    Audit national IDs, driver licenses, vehicle fitness certificates, and regulator permits
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                  {filteredDrivers.length} / {state.drivers.length} DRIVERS
                </span>
              </div>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search by driver name, vehicle plate, national ID, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded pl-8 pr-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-600 focus:bg-white"
              />
            </div>

            {/* High Density Driver Table */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
                    <tr>
                      <th className="cell-condensed">Driver Profile</th>
                      <th className="cell-condensed">Vehicle & Plate</th>
                      <th className="cell-condensed">Gov Permit Status</th>
                      <th className="cell-condensed">Wallet Balance</th>
                      <th className="cell-condensed">KYC Status</th>
                      <th className="cell-condensed text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {filteredDrivers.map((driver) => (
                      <tr key={driver.id} className="hover:bg-slate-50">
                        <td className="cell-condensed">
                          <div className="flex items-center gap-2">
                            <img
                              src={driver.avatarUrl}
                              alt={driver.name}
                              className="w-7 h-7 rounded object-cover border border-slate-200"
                            />
                            <div>
                              <span className="font-bold text-slate-900 block">{driver.name}</span>
                              <span className="text-slate-400 text-[10px] font-mono">{driver.phone} • {driver.city}</span>
                            </div>
                          </div>
                        </td>
                        <td className="cell-condensed">
                          <span className="font-mono font-bold text-slate-800 text-xs block">
                            {driver.vehicle.plateNumber}
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            {driver.vehicle.make} {driver.vehicle.model} ({driver.vehicle.color})
                          </span>
                        </td>
                        <td className="cell-condensed">
                          <div className="flex items-center gap-1">
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                                driver.governmentPermitStatus === 'valid'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : driver.governmentPermitStatus === 'expired'
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {driver.governmentPermitStatus}
                            </span>
                          </div>
                          <span className="text-[8px] font-mono text-slate-400 block">{driver.governmentPermitNumber}</span>
                        </td>
                        <td className="cell-condensed">
                          <span
                            className={`font-mono font-bold text-xs ${
                              driver.walletBalance < 0 ? 'text-rose-600' : 'text-emerald-600'
                            }`}
                          >
                            {formatMoney(driver.walletBalance)}
                          </span>
                          {driver.isBlockedDueToDebt && (
                            <span className="text-[8px] text-rose-600 uppercase font-bold block">BLOCKED (DEBT)</span>
                          )}
                        </td>
                        <td className="cell-condensed">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                              driver.kycStatus === 'approved'
                                ? 'bg-emerald-50 text-emerald-700'
                                : driver.kycStatus === 'rejected'
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {driver.kycStatus}
                          </span>
                        </td>
                        <td className="cell-condensed text-right">
                          {driver.kycStatus === 'pending' ? (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleApproveKyc(driver.id)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectKyc(driver.id)}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">AUDITED</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 4: FINANCIALS & PAYOUTS */}
      {/* ============================================================= */}
      {adminTab === 'financials' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
            <div className="p-3 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-slate-900 font-bold text-xs">Pending Driver Payout Requests</h4>
              <span className="text-[10px] font-mono text-slate-500">{pendingPayouts.length} PENDING</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
                  <tr>
                    <th className="cell-condensed">Driver Name</th>
                    <th className="cell-condensed">Amount</th>
                    <th className="cell-condensed">Payment Rail</th>
                    <th className="cell-condensed">Account Details</th>
                    <th className="cell-condensed text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {pendingPayouts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-400 text-xs">
                        No pending withdrawal requests.
                      </td>
                    </tr>
                  ) : (
                    pendingPayouts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="cell-condensed font-bold text-slate-900">{p.accountName}</td>
                        <td className="cell-condensed mono font-bold text-emerald-700">{formatMoney(p.amountUSD)}</td>
                        <td className="cell-condensed uppercase font-mono text-slate-600">{p.method}</td>
                        <td className="cell-condensed mono text-slate-500">{p.accountNumber}</td>
                        <td className="cell-condensed text-right">
                          <button
                            onClick={() => handleApprovePayout(p.id)}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold"
                          >
                            Approve Transfer
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 4: PRICING & ALGORITHM CONFIGURATION */}
      {/* ============================================================= */}
      {adminTab === 'pricing' && (
        <div className="space-y-4">
          {/* Success Banner */}
          {saveSuccessMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{saveSuccessMessage}</span>
              </div>
              <button
                onClick={() => setSaveSuccessMessage(null)}
                className="text-emerald-700 hover:text-emerald-900 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Global Commission Quick Controller */}
          <div className="bg-gradient-to-r from-sky-900 to-slate-900 text-white rounded-lg p-4 shadow-sm border border-sky-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-amber-400 text-sky-950 flex items-center justify-center font-bold">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-xs">Dynamic Platform Commission & Revenue Engine</h4>
                  <p className="text-[10px] text-sky-200">
                    Adjust platform monetization rates in real time. Drivers are debited this percentage on in-app and cash trips.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-sky-950/60 px-3 py-1.5 rounded border border-sky-700/50">
                <span className="text-[10px] text-sky-300 font-bold uppercase tracking-wider">Fleet Average:</span>
                <span className="font-mono text-amber-400 font-bold text-sm">{avgCommission}%</span>
              </div>
            </div>

            <div className="pt-2 border-t border-sky-800/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-[280px]">
                <span className="text-xs text-sky-200 font-medium whitespace-nowrap">Global Commission:</span>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="0.5"
                  value={globalCommissionInput}
                  onChange={(e) => setGlobalCommissionInput(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-1.5 bg-sky-950 rounded-lg"
                />
                <span className="font-mono font-bold text-amber-400 text-sm w-12 text-right">
                  {globalCommissionInput}%
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleApplyGlobalCommission}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-sky-950 font-bold text-xs rounded shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Apply to All Categories</span>
                </button>
              </div>
            </div>
          </div>

          {/* Category-by-Category Pricing & Commission Grid */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div>
                <h4 className="text-slate-900 font-bold text-xs flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-sky-800" />
                  <span>Vehicle Category Pricing & Commission Matrices</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Configure per-category baseline fare algorithm variables, commission rates, and cash-trip levies.
                </p>
              </div>
              <button
                onClick={handleSaveAllPricing}
                className="px-3.5 py-1.5 bg-sky-900 hover:bg-sky-800 text-white font-bold text-xs rounded shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Save className="w-3.5 h-3.5 text-amber-400" />
                <span>Save All Matrices</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {editingPricing.map((config) => {
                const driverKeeps = (100 - config.commissionPercentage).toFixed(1);
                return (
                  <div
                    key={config.category}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div>
                        <span className="font-bold text-slate-900 text-xs block">{config.name}</span>
                        <span className="text-[9px] font-mono uppercase text-slate-400 tracking-wider">
                          {config.category}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-emerald-700 block">
                          Driver: {driverKeeps}%
                        </span>
                      </div>
                    </div>

                    {/* Commission Rate Configurator */}
                    <div className="bg-sky-50/70 border border-sky-100 p-2 rounded space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-sky-950 flex items-center gap-1">
                          <Percent className="w-3 h-3 text-amber-500" />
                          <span>Platform Commission:</span>
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="50"
                            step="0.5"
                            value={config.commissionPercentage}
                            onChange={(e) =>
                              handleCategoryFieldChange(
                                config.category,
                                'commissionPercentage',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-14 bg-white border border-sky-200 rounded px-1.5 py-0.5 text-xs text-right font-mono font-bold text-sky-900 focus:outline-none focus:border-sky-500"
                          />
                          <span className="text-[10px] font-bold text-sky-800">%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-[10px] text-slate-600">Cash-Trip Levy:</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="50"
                            step="0.5"
                            value={config.cashLevyPercentage}
                            onChange={(e) =>
                              handleCategoryFieldChange(
                                config.category,
                                'cashLevyPercentage',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-14 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-right font-mono text-slate-800 focus:outline-none focus:border-sky-500"
                          />
                          <span className="text-[10px] text-slate-500">%</span>
                        </div>
                      </div>
                    </div>

                    {/* Matrix Rates */}
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between text-slate-700">
                        <span>Base Fare ($):</span>
                        <input
                          type="number"
                          min="0"
                          step="0.25"
                          value={config.baseFareUSD}
                          onChange={(e) =>
                            handleCategoryFieldChange(
                              config.category,
                              'baseFareUSD',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-16 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-right font-mono font-bold text-slate-900"
                        />
                      </div>

                      <div className="flex items-center justify-between text-slate-700">
                        <span>Per KM ($/km):</span>
                        <input
                          type="number"
                          min="0"
                          step="0.05"
                          value={config.perKmUSD}
                          onChange={(e) =>
                            handleCategoryFieldChange(
                              config.category,
                              'perKmUSD',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-16 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-right font-mono text-slate-900"
                        />
                      </div>

                      <div className="flex items-center justify-between text-slate-700">
                        <span>Per Minute ($/min):</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={config.perMinuteUSD}
                          onChange={(e) =>
                            handleCategoryFieldChange(
                              config.category,
                              'perMinuteUSD',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-16 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-right font-mono text-slate-900"
                        />
                      </div>

                      <div className="flex items-center justify-between text-slate-700">
                        <span>Minimum Fare ($):</span>
                        <input
                          type="number"
                          min="0"
                          step="0.50"
                          value={config.minimumFareUSD}
                          onChange={(e) =>
                            handleCategoryFieldChange(
                              config.category,
                              'minimumFareUSD',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-16 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-right font-mono font-bold text-slate-900"
                        />
                      </div>

                      <div className="flex items-center justify-between text-slate-700">
                        <span>Surge Multiplier:</span>
                        <select
                          value={config.surgeMultiplier}
                          onChange={(e) =>
                            handleCategoryFieldChange(
                              config.category,
                              'surgeMultiplier',
                              parseFloat(e.target.value) || 1.0
                            )
                          }
                          className="w-16 bg-white border border-slate-200 rounded px-1 py-0.5 text-xs font-mono text-slate-900"
                        >
                          <option value="1.0">1.0x</option>
                          <option value="1.2">1.2x</option>
                          <option value="1.5">1.5x</option>
                          <option value="2.0">2.0x</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Operational Policy & Driver Permit Restriction Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Driver Operating Policy & Debt Ceiling */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3.5">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="text-slate-900 font-bold text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Driver Operations & Permit Policy</span>
                </h4>
                <p className="text-[10px] text-slate-500">
                  Control operational restrictions and statutory compliance gating.
                </p>
              </div>

              {/* Permit Gating Control */}
              <div className="p-3 rounded-lg border bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 block">
                      Driver Permit Requirement
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {enforcePermitToggle
                        ? 'Permit Mandatory (Drivers blocked without permit)'
                        : 'Unrestricted: Drivers can operate without a permit'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnforcePermitToggle(!enforcePermitToggle)}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      enforcePermitToggle ? 'bg-sky-900' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        enforcePermitToggle ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <div className="text-[10px] text-slate-600 bg-white p-2 rounded border border-slate-200 flex items-start gap-1.5">
                  <ShieldOff className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Current Policy:</strong> Drivers can go online, receive ride bids, and accept passenger requests without requiring a verified government permit.
                  </span>
                </div>
              </div>

              {/* Debt Ceiling */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-200">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 block">
                    Cash-Trip Debt Ceiling ($)
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Maximum unpaid cash commission before driver is blocked
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-400">$</span>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    step="1"
                    value={debtCeilingInput}
                    onChange={(e) => setDebtCeilingInput(parseFloat(e.target.value) || 15)}
                    className="w-16 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono font-bold text-right text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Right: Driver Subscriptions & Currency Rates */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3.5">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="text-slate-900 font-bold text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Subscription Passes & Currency Rates</span>
                </h4>
                <p className="text-[10px] text-slate-500">
                  Flat-rate 0% commission pass pricing and official ZiG conversion.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-200">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Weekly 0% Pass</span>
                    <span className="text-[10px] text-slate-500">7-day unlimited commission waiver</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-400">$</span>
                    <input
                      type="number"
                      min="1"
                      step="0.5"
                      value={weeklySubInput}
                      onChange={(e) => setWeeklySubInput(parseFloat(e.target.value) || 7)}
                      className="w-16 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono font-bold text-right text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-200">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Monthly 0% Pass</span>
                    <span className="text-[10px] text-slate-500">30-day unlimited commission waiver</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-400">$</span>
                    <input
                      type="number"
                      min="5"
                      step="1"
                      value={monthlySubInput}
                      onChange={(e) => setMonthlySubInput(parseFloat(e.target.value) || 25)}
                      className="w-16 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono font-bold text-right text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-200">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Exchange Rate (USD → ZiG)</span>
                    <span className="text-[10px] text-slate-500">Official reserve bank conversion peg</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      step="0.05"
                      value={exchangeRateInput}
                      onChange={(e) => setExchangeRateInput(parseFloat(e.target.value) || 26.85)}
                      className="w-20 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono font-bold text-right text-slate-900"
                    />
                    <span className="text-[10px] font-bold text-slate-500">ZiG</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Revenue & Payout Simulator */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-sky-800" />
                <h4 className="text-slate-900 font-bold text-xs">Live Fare & Commission Payout Simulator</h4>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-600 font-medium">Test Trip Fare:</span>
                <input
                  type="range"
                  min="2"
                  max="50"
                  step="0.5"
                  value={simulatedFareUSD}
                  onChange={(e) => setSimulatedFareUSD(parseFloat(e.target.value))}
                  className="w-32 accent-sky-800 cursor-pointer h-1.5 bg-slate-200 rounded"
                />
                <span className="font-mono font-bold text-slate-900 text-xs w-16 text-right">
                  ${simulatedFareUSD.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400">
                    <th className="py-2 px-3">Vehicle Tier</th>
                    <th className="py-2 px-3">Commission %</th>
                    <th className="py-2 px-3">Rider Pays</th>
                    <th className="py-2 px-3 text-sky-900 font-bold">Platform Revenue</th>
                    <th className="py-2 px-3 text-emerald-700 font-bold">Driver Net Payout</th>
                    <th className="py-2 px-3">In ZiG Equiv.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {editingPricing.map((config) => {
                    const commissionAmount = (simulatedFareUSD * config.commissionPercentage) / 100;
                    const driverEarnings = simulatedFareUSD - commissionAmount;
                    const zigFare = (simulatedFareUSD * exchangeRateInput).toFixed(1);
                    return (
                      <tr key={config.category} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-sans font-bold text-slate-900">{config.name}</td>
                        <td className="py-2.5 px-3 text-slate-600 font-bold">{config.commissionPercentage}%</td>
                        <td className="py-2.5 px-3 text-slate-900 font-bold">${simulatedFareUSD.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-sky-900 font-bold bg-sky-50/50">
                          ${commissionAmount.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-emerald-700 font-bold bg-emerald-50/50">
                          ${driverEarnings.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-amber-700 font-bold">{zigFare} ZiG</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 5: EMERGENCY SOS MONITOR */}
      {/* ============================================================= */}
      {adminTab === 'sos' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h4 className="text-slate-900 font-bold text-xs">24/7 Security Incident Response Desk</h4>
              </div>
              <span className="text-[10px] font-mono text-rose-600 font-bold">{activeSosList.length} ACTIVE INCIDENTS</span>
            </div>

            {activeSosList.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded border border-slate-200 text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="font-bold text-slate-800">All Security Desks Clear</p>
                <p className="text-[11px]">No active SOS emergency alerts across Harare & Bulawayo fleets.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeSosList.map((sos) => (
                  <div
                    key={sos.id}
                    className="p-3 bg-rose-50 border border-rose-200 rounded flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="mono font-bold text-rose-800 text-[10px] uppercase">
                        INCIDENT #{sos.id} • TRIGGERED BY {sos.triggeredBy.toUpperCase()}
                      </span>
                      <p className="font-bold text-slate-900 mt-0.5">Location: {sos.address || `${sos.lat}, ${sos.lng}`}</p>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Time: {new Date(sos.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <button
                      onClick={() => store.resolveSos(sos.id, 'resolved')}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded shadow-xs"
                    >
                      Resolve Alert
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
        </main>
      </div>

      {/* Genesis Admin Setup Modal */}
      <GenesisAdminSetupModal
        isOpen={showGenesisModal}
        onClose={() => setShowGenesisModal(false)}
      />
    </div>
  );
};
