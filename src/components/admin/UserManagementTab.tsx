import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Ban,
  CheckCircle2,
  XCircle,
  Wallet,
  Building,
  Star,
  Phone,
  Mail,
  MapPin,
  Clock,
  Car,
  FileText,
  Download,
  Edit3,
  Trash2,
  Eye,
  Plus,
  ChevronRight,
  AlertCircle,
  X,
  CreditCard,
  Building2,
  Sparkles,
  Award
} from 'lucide-react';
import { store } from '../../services/store';
import { RiderProfile, RiderAccountStatus, RiderAccountType, Currency } from '../../types';

interface UserManagementTabProps {
  currency: Currency;
}

export const UserManagementTab: React.FC<UserManagementTabProps> = ({ currency }) => {
  const state = store.getState();
  const riders = state.riders || [state.rider];
  const allTrips = state.tripHistory;

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RiderAccountStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | RiderAccountType>('all');
  const [cityFilter, setCityFilter] = useState<'all' | 'Harare' | 'Bulawayo'>('all');

  // Modals & Drawers
  const [selectedRider, setSelectedRider] = useState<RiderProfile | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [targetRiderForWallet, setTargetRiderForWallet] = useState<RiderProfile | null>(null);
  const [walletAmount, setWalletAmount] = useState<number>(10);
  const [walletReason, setWalletReason] = useState<string>('Customer Support Resolution Credit');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // New User Form State
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    phone: '+263 ',
    email: '',
    nationalId: '',
    city: 'Harare' as 'Harare' | 'Bulawayo',
    accountType: 'standard' as RiderAccountType,
    companyName: '',
    emergencyContactName: '',
    emergencyContactPhone: '+263 ',
    initialBalance: 0,
    notes: 'Onboarded via Operator Console'
  });

  // Edit User Form State
  const [editUserForm, setEditUserForm] = useState<{
    id: string;
    name: string;
    phone: string;
    email: string;
    nationalId: string;
    city: 'Harare' | 'Bulawayo';
    accountType: RiderAccountType;
    companyName: string;
    status: RiderAccountStatus;
    emergencyContactName: string;
    emergencyContactPhone: string;
    notes: string;
  } | null>(null);

  // Currency Formatter
  const formatMoney = (amountUSD: number) => {
    if (currency === 'ZWG') {
      const zwg = amountUSD * state.settings.exchangeRateUSDToZWG;
      return `${zwg.toFixed(1)} ZiG`;
    }
    return `$${amountUSD.toFixed(2)}`;
  };

  // Filtered riders
  const filteredRiders = riders.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.email && r.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.nationalId && r.nationalId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.companyName && r.companyName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesType = typeFilter === 'all' || r.accountType === typeFilter;
    const matchesCity = cityFilter === 'all' || r.city === cityFilter;

    return matchesSearch && matchesStatus && matchesType && matchesCity;
  });

  // KPI Calculations
  const totalRidersCount = riders.length;
  const activeRidersCount = riders.filter((r) => r.status === 'active').length;
  const suspendedRidersCount = riders.filter((r) => r.status === 'suspended' || r.status === 'banned').length;
  const corporateCount = riders.filter((r) => r.accountType === 'corporate' || r.accountType === 'vip').length;
  const totalWalletSumUSD = riders.reduce((acc, r) => acc + (r.walletBalance || 0), 0);

  // Handlers
  const handleToggleStatus = (riderId: string, currentStatus: RiderAccountStatus) => {
    const nextStatus: RiderAccountStatus =
      currentStatus === 'active' ? 'suspended' : currentStatus === 'suspended' ? 'active' : 'active';
    const reason = prompt(`Enter reason for changing status to ${nextStatus.toUpperCase()}:`);
    if (reason !== null) {
      store.updateRiderStatus(riderId, nextStatus, reason || 'Operator Manual Update');
      setActionSuccessMsg(`Updated user account status to ${nextStatus.toUpperCase()}`);
      setTimeout(() => setActionSuccessMsg(null), 3500);
    }
  };

  const handleOpenWalletModal = (rider: RiderProfile) => {
    setTargetRiderForWallet(rider);
    setWalletAmount(10);
    setWalletReason('Support compensation');
    setShowWalletModal(true);
  };

  const handleApplyWalletAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRiderForWallet) return;
    store.updateRiderWallet(targetRiderForWallet.id, Number(walletAmount), walletReason);
    setShowWalletModal(false);
    setActionSuccessMsg(
      `Adjusted wallet of ${targetRiderForWallet.name} by ${walletAmount >= 0 ? '+' : ''}$${Number(walletAmount).toFixed(2)}`
    );
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name.trim() || !newUserForm.phone.trim()) {
      alert('Please fill in user full name and phone number.');
      return;
    }

    store.addRider({
      name: newUserForm.name,
      phone: newUserForm.phone,
      email: newUserForm.email || undefined,
      nationalId: newUserForm.nationalId || undefined,
      city: newUserForm.city,
      accountType: newUserForm.accountType,
      companyName: newUserForm.companyName || undefined,
      emergencyContactName: newUserForm.emergencyContactName || 'None',
      emergencyContactPhone: newUserForm.emergencyContactPhone || '+263 ',
      initialBalance: Number(newUserForm.initialBalance) || 0,
      notes: newUserForm.notes
    });

    setShowAddModal(false);
    setNewUserForm({
      name: '',
      phone: '+263 ',
      email: '',
      nationalId: '',
      city: 'Harare',
      accountType: 'standard',
      companyName: '',
      emergencyContactName: '',
      emergencyContactPhone: '+263 ',
      initialBalance: 0,
      notes: 'Onboarded via Operator Console'
    });
    setActionSuccessMsg(`Successfully registered new user account: ${newUserForm.name}`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const handleOpenEditModal = (rider: RiderProfile) => {
    setEditUserForm({
      id: rider.id,
      name: rider.name,
      phone: rider.phone,
      email: rider.email || '',
      nationalId: rider.nationalId || '',
      city: rider.city || 'Harare',
      accountType: rider.accountType || 'standard',
      companyName: rider.companyName || '',
      status: rider.status || 'active',
      emergencyContactName: rider.emergencyContactName || '',
      emergencyContactPhone: rider.emergencyContactPhone || '',
      notes: rider.notes || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserForm) return;

    store.updateRiderProfile(editUserForm.id, {
      name: editUserForm.name,
      phone: editUserForm.phone,
      email: editUserForm.email,
      nationalId: editUserForm.nationalId,
      city: editUserForm.city,
      accountType: editUserForm.accountType,
      companyName: editUserForm.companyName,
      status: editUserForm.status,
      emergencyContactName: editUserForm.emergencyContactName,
      emergencyContactPhone: editUserForm.emergencyContactPhone,
      notes: editUserForm.notes
    });

    setShowEditModal(false);
    setEditUserForm(null);
    setActionSuccessMsg(`Updated profile for ${editUserForm.name}`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const handleDeleteUser = (rider: RiderProfile) => {
    if (confirm(`Are you sure you want to permanently delete user account "${rider.name}" (${rider.phone})?`)) {
      store.deleteRider(rider.id);
      if (selectedRider?.id === rider.id) {
        setSelectedRider(null);
      }
      setActionSuccessMsg(`Deleted user ${rider.name}`);
      setTimeout(() => setActionSuccessMsg(null), 3500);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Name',
      'Phone',
      'Email',
      'National ID',
      'City',
      'Account Type',
      'Company',
      'Status',
      'Rating',
      'Total Trips',
      'Wallet Balance USD',
      'Emergency Contact Name',
      'Emergency Contact Phone',
      'Registered At'
    ];

    const rows = riders.map((r) => [
      r.id,
      `"${r.name}"`,
      `"${r.phone}"`,
      `"${r.email || ''}"`,
      `"${r.nationalId || ''}"`,
      r.city || 'Harare',
      r.accountType || 'standard',
      `"${r.companyName || ''}"`,
      r.status || 'active',
      r.rating || 5.0,
      r.totalTrips || 0,
      r.walletBalance || 0,
      `"${r.emergencyContactName || ''}"`,
      `"${r.emergencyContactPhone || ''}"`,
      r.registeredAt || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ridezw_users_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Toast Alert Notification */}
      {actionSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-md text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">
            ✕
          </button>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Registered Users</span>
            <Users className="w-4 h-4 text-sky-800" />
          </div>
          <p className="text-xl font-mono font-bold text-slate-900">{totalRidersCount}</p>
          <span className="text-[10px] text-emerald-700 font-bold font-mono">
            {activeRidersCount} Active ({Math.round((activeRidersCount / (totalRidersCount || 1)) * 100)}%)
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Corporate & VIP</span>
            <Building2 className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-mono font-bold text-slate-900">{corporateCount}</p>
          <span className="text-[10px] text-slate-500 font-mono">B2B Billing Accounts</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Restricted / Suspended</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl font-mono font-bold text-slate-900">{suspendedRidersCount}</p>
          <span className="text-[10px] text-rose-600 font-bold font-mono">Security Interventions</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total User Wallet Funds</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-mono font-bold text-emerald-800">{formatMoney(totalWalletSumUSD)}</p>
          <span className="text-[10px] text-slate-500 font-mono">Stored Value Holdings</span>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3.5">
        {/* Actions & Filters Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-sky-900 text-amber-400 flex items-center justify-center font-bold text-xs">
              <Users className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-slate-900 font-bold text-xs">Platform User & Rider Accounts Directory</h3>
              <p className="text-[10px] text-slate-500">
                Manage personal, corporate, and VIP rider accounts, wallet adjustments, and ride audit trails
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold transition-colors border border-slate-200"
              title="Download Rider Records as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-sky-900 hover:bg-sky-800 text-amber-400 rounded text-xs font-bold shadow-xs transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register User</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          {/* Search Box */}
          <div className="relative sm:col-span-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search user name, phone, national ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded pl-8 pr-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-600"
            >
              <option value="all">All Statuses (Active / Suspended / Banned)</option>
              <option value="active">Active Accounts Only</option>
              <option value="suspended">Suspended Accounts Only</option>
              <option value="banned">Banned Accounts Only</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-600"
            >
              <option value="all">All Account Types</option>
              <option value="standard">Standard Individual</option>
              <option value="corporate">Corporate B2B</option>
              <option value="vip">VIP Priority</option>
            </select>
          </div>

          {/* City Filter */}
          <div>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-600"
            >
              <option value="all">All Operational Hubs</option>
              <option value="Harare">Harare Hub</option>
              <option value="Bulawayo">Bulawayo Hub</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">User & Identity</th>
                <th className="py-2.5 px-3">National ID & City</th>
                <th className="py-2.5 px-3">Account Class</th>
                <th className="py-2.5 px-3">Wallet Balance</th>
                <th className="py-2.5 px-3">Trips & Rating</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredRiders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                    <p className="font-bold text-slate-700">No matching user accounts found</p>
                    <p className="text-[11px] text-slate-400">Try modifying your search query or filters.</p>
                  </td>
                </tr>
              ) : (
                filteredRiders.map((rider) => {
                  const isCurrentActive = rider.status === 'active';
                  const isCorporate = rider.accountType === 'corporate';
                  const isVIP = rider.accountType === 'vip';

                  return (
                    <tr key={rider.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* User & Identity */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={rider.avatarUrl}
                            alt={rider.name}
                            className="w-7 h-7 rounded-full object-cover border border-slate-300 shadow-xs shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 truncate">{rider.name}</span>
                              {isVIP && (
                                <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                  VIP
                                </span>
                              )}
                              {isCorporate && (
                                <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-900 border border-indigo-300">
                                  CORP
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 font-mono truncate">{rider.phone}</p>
                          </div>
                        </div>
                      </td>

                      {/* National ID & City */}
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-slate-700 text-[11px] block">{rider.nationalId || 'Unrecorded'}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{rider.city || 'Harare'} Hub</span>
                      </td>

                      {/* Account Class */}
                      <td className="py-2.5 px-3">
                        <span className="capitalize font-bold text-slate-800 block text-[11px]">
                          {rider.accountType || 'Standard'}
                        </span>
                        {rider.companyName && (
                          <span className="text-[10px] text-slate-500 font-medium truncate block max-w-[120px]">
                            {rider.companyName}
                          </span>
                        )}
                      </td>

                      {/* Wallet Balance */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-mono font-bold ${
                              (rider.walletBalance || 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {formatMoney(rider.walletBalance || 0)}
                          </span>
                          <button
                            onClick={() => handleOpenWalletModal(rider)}
                            className="p-0.5 text-slate-400 hover:text-sky-800 hover:bg-sky-50 rounded"
                            title="Adjust User Wallet Balance"
                          >
                            <Wallet className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Trips & Rating */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                          <span className="font-mono font-bold text-slate-800">{rider.rating?.toFixed(1) || '5.0'}</span>
                          <span className="text-slate-400 text-[10px] font-mono">({rider.totalTrips || 0} rides)</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                            rider.status === 'active'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : rider.status === 'suspended'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              rider.status === 'active'
                                ? 'bg-emerald-500'
                                : rider.status === 'suspended'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                          />
                          {rider.status || 'Active'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedRider(rider)}
                            className="p-1 text-slate-500 hover:text-sky-900 hover:bg-sky-50 rounded transition-colors"
                            title="Inspect User Details & Trip Ledger"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(rider)}
                            className="p-1 text-slate-500 hover:text-amber-800 hover:bg-amber-50 rounded transition-colors"
                            title="Edit User Profile"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(rider.id, rider.status || 'active')}
                            className={`p-1 rounded transition-colors ${
                              isCurrentActive
                                ? 'text-slate-500 hover:text-rose-700 hover:bg-rose-50'
                                : 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-50'
                            }`}
                            title={isCurrentActive ? 'Suspend User Account' : 'Reactivate User Account'}
                          >
                            {isCurrentActive ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(rider)}
                            className="p-1 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                            title="Delete User Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================= */}
      {/* DRAWER / MODAL: RIDER PROFILE & TRIP AUDIT TRAIL */}
      {/* ============================================================= */}
      {selectedRider && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg border border-slate-300 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 bg-sky-950 text-white flex items-center justify-between border-b border-sky-900">
              <div className="flex items-center gap-3">
                <img
                  src={selectedRider.avatarUrl}
                  alt={selectedRider.name}
                  className="w-10 h-10 rounded-full border-2 border-amber-400 object-cover shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white">{selectedRider.name}</h3>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-bold">
                      {selectedRider.accountType || 'Standard'}
                    </span>
                  </div>
                  <p className="text-[10px] text-sky-300 font-mono">
                    ID: {selectedRider.id} • Registered: {selectedRider.registeredAt || '2026-08'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRider(null)}
                className="text-sky-300 hover:text-white p-1 rounded hover:bg-sky-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body (Scrollable) */}
            <div className="p-4 space-y-4 overflow-y-auto text-xs">
              {/* Profile Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone Number</span>
                  <span className="font-mono font-bold text-slate-900">{selectedRider.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
                  <span className="font-mono text-slate-800 truncate block">{selectedRider.email || 'None'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">National ID</span>
                  <span className="font-mono font-bold text-slate-900">{selectedRider.nationalId || 'Unrecorded'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Operating City</span>
                  <span className="font-bold text-slate-900">{selectedRider.city || 'Harare'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Wallet Balance</span>
                  <span className="font-mono font-bold text-emerald-700">{formatMoney(selectedRider.walletBalance || 0)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Account Status</span>
                  <span
                    className={`font-mono font-bold uppercase text-[10px] ${
                      selectedRider.status === 'active'
                        ? 'text-emerald-700'
                        : selectedRider.status === 'suspended'
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {selectedRider.status || 'Active'}
                  </span>
                </div>
              </div>

              {/* Emergency Contact Information */}
              <div className="bg-rose-50/60 border border-rose-200 rounded p-3 text-xs space-y-1">
                <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-rose-600" />
                  <span>SOS & Emergency Dispatch Contact</span>
                </span>
                <div className="flex flex-wrap gap-4 text-slate-800 mt-1">
                  <div>
                    <span className="text-slate-500 text-[10px]">Contact Name: </span>
                    <strong className="font-mono">{selectedRider.emergencyContactName || 'None Designated'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">Contact Phone: </span>
                    <strong className="font-mono">{selectedRider.emergencyContactPhone || 'None'}</strong>
                  </div>
                </div>
              </div>

              {/* Internal Operator Audit Notes */}
              {selectedRider.notes && (
                <div className="bg-amber-50/70 border border-amber-200 rounded p-2.5 text-xs text-amber-950">
                  <span className="font-bold text-[10px] uppercase tracking-wider block text-amber-800 mb-0.5">
                    Operator Notes & Audit Trail
                  </span>
                  <p className="font-mono text-[11px]">{selectedRider.notes}</p>
                </div>
              )}

              {/* Ride History Ledger */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-sky-800" />
                    <span>Recent Trip Audit History</span>
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">Total Rides: {selectedRider.totalTrips || 0}</span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {allTrips.slice(0, 5).map((trip) => (
                    <div
                      key={trip.id}
                      className="p-2.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-xs">
                            {trip.pickup.neighborhood} → {trip.destination.neighborhood}
                          </span>
                          <span
                            className={`text-[8px] font-mono font-bold uppercase px-1 py-0.2 rounded ${
                              trip.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {trip.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono">
                          Driver: {trip.driverName || 'Assigned Driver'} ({trip.driverVehicle?.plateNumber || 'ZW'}) •{' '}
                          {new Date(trip.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right shrink-0 font-mono">
                        <span className="font-bold text-slate-900 block">{formatMoney(trip.agreedFareUSD)}</span>
                        <span className="text-[9px] text-slate-400 uppercase">{trip.paymentMethod}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => handleOpenWalletModal(selectedRider)}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded text-xs transition-colors"
              >
                Adjust Wallet
              </button>
              <button
                onClick={() => {
                  handleOpenEditModal(selectedRider);
                  setSelectedRider(null);
                }}
                className="px-3 py-1.5 bg-sky-900 hover:bg-sky-800 text-white font-bold rounded text-xs shadow-xs transition-colors"
              >
                Edit Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: WALLET BALANCE ADJUSTMENT */}
      {/* ============================================================= */}
      {showWalletModal && targetRiderForWallet && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-lg border border-slate-300 shadow-2xl max-w-md w-full p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-xs">Adjust Rider Wallet Balance</h3>
              </div>
              <button onClick={() => setShowWalletModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs">
              <p className="font-bold text-slate-900">{targetRiderForWallet.name}</p>
              <p className="text-[10px] text-slate-500 font-mono">
                Current Balance: <strong>{formatMoney(targetRiderForWallet.walletBalance || 0)}</strong>
              </p>
            </div>

            <form onSubmit={handleApplyWalletAdjustment} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 text-[11px]">
                  Adjustment Delta in USD (+ to credit, - to debit)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={walletAmount}
                  onChange={(e) => setWalletAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-sky-600 focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 text-[11px]">Audit / Reason for Adjustment</label>
                <input
                  type="text"
                  value={walletReason}
                  onChange={(e) => setWalletReason(e.target.value)}
                  placeholder="e.g. Promo refund, Corporate credit..."
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-600 focus:bg-white"
                  required
                />
              </div>

              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-900 font-mono">
                New Projected Balance:{' '}
                <strong>{formatMoney((targetRiderForWallet.walletBalance || 0) + Number(walletAmount))}</strong>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWalletModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded shadow-xs"
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: REGISTER NEW USER / CORPORATE ACCOUNT */}
      {/* ============================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-lg border border-slate-300 shadow-2xl max-w-lg w-full p-4 space-y-3.5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-sky-900" />
                <h3 className="font-bold text-slate-900 text-xs">Register New Rider / Corporate Account</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tendai Moyo"
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+263 77 123 4567"
                    value={newUserForm.phone}
                    onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">National ID</label>
                  <input
                    type="text"
                    placeholder="63-123456-Z-42"
                    value={newUserForm.nationalId}
                    onChange={(e) => setNewUserForm({ ...newUserForm, nationalId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">Email Address</label>
                  <input
                    type="email"
                    placeholder="user@example.co.zw"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">Account Class</label>
                  <select
                    value={newUserForm.accountType}
                    onChange={(e) => setNewUserForm({ ...newUserForm, accountType: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                  >
                    <option value="standard">Standard Personal Account</option>
                    <option value="corporate">Corporate B2B Account</option>
                    <option value="vip">VIP Priority Account</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">Primary Operating City</label>
                  <select
                    value={newUserForm.city}
                    onChange={(e) => setNewUserForm({ ...newUserForm, city: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                  >
                    <option value="Harare">Harare Hub</option>
                    <option value="Bulawayo">Bulawayo Hub</option>
                  </select>
                </div>
              </div>

              {newUserForm.accountType === 'corporate' && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">Corporate Entity / Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Stanbic Bank Zimbabwe, Delta Beverages"
                    value={newUserForm.companyName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, companyName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">Emergency Contact Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Chipo Moyo (Spouse)"
                    value={newUserForm.emergencyContactName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, emergencyContactName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">Emergency Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+263 77 987 6543"
                    value={newUserForm.emergencyContactPhone}
                    onChange={(e) => setNewUserForm({ ...newUserForm, emergencyContactPhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">Initial Wallet Credit (USD)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={newUserForm.initialBalance}
                    onChange={(e) => setNewUserForm({ ...newUserForm, initialBalance: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">Operator Notes</label>
                  <input
                    type="text"
                    value={newUserForm.notes}
                    onChange={(e) => setNewUserForm({ ...newUserForm, notes: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-sky-900 hover:bg-sky-800 text-amber-400 font-bold rounded shadow-xs"
                >
                  Register Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: EDIT USER ACCOUNT DETAILS */}
      {/* ============================================================= */}
      {showEditModal && editUserForm && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-lg border border-slate-300 shadow-2xl max-w-lg w-full p-4 space-y-3.5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-700" />
                <h3 className="font-bold text-slate-900 text-xs">Edit User Profile: {editUserForm.name}</h3>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editUserForm.name}
                    onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={editUserForm.phone}
                    onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">National ID</label>
                  <input
                    type="text"
                    value={editUserForm.nationalId}
                    onChange={(e) => setEditUserForm({ ...editUserForm, nationalId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">Email</label>
                  <input
                    type="email"
                    value={editUserForm.email}
                    onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">Status</label>
                  <select
                    value={editUserForm.status}
                    onChange={(e) => setEditUserForm({ ...editUserForm, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="banned">Banned</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">Class</label>
                  <select
                    value={editUserForm.accountType}
                    onChange={(e) => setEditUserForm({ ...editUserForm, accountType: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                  >
                    <option value="standard">Standard</option>
                    <option value="corporate">Corporate</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">City</label>
                  <select
                    value={editUserForm.city}
                    onChange={(e) => setEditUserForm({ ...editUserForm, city: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                  >
                    <option value="Harare">Harare</option>
                    <option value="Bulawayo">Bulawayo</option>
                  </select>
                </div>
              </div>

              {editUserForm.accountType === 'corporate' && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">Company Name</label>
                  <input
                    type="text"
                    value={editUserForm.companyName}
                    onChange={(e) => setEditUserForm({ ...editUserForm, companyName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={editUserForm.emergencyContactName}
                    onChange={(e) => setEditUserForm({ ...editUserForm, emergencyContactName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">Emergency Contact Phone</label>
                  <input
                    type="text"
                    value={editUserForm.emergencyContactPhone}
                    onChange={(e) => setEditUserForm({ ...editUserForm, emergencyContactPhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 text-[11px]">Notes</label>
                <input
                  type="text"
                  value={editUserForm.notes}
                  onChange={(e) => setEditUserForm({ ...editUserForm, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-sky-900 hover:bg-sky-800 text-white font-bold rounded shadow-xs"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
