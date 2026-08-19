import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Users,
  Key,
  Lock,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Trash2,
  Edit2,
  RefreshCw,
  Sparkles,
  Shield,
  HelpCircle
} from 'lucide-react';
import { store } from '../../services/store';
import { AdminUser, AdminRole } from '../../types';

interface StaffManagementTabProps {
  onOpenGenesisSetup: () => void;
}

export const StaffManagementTab: React.FC<StaffManagementTabProps> = ({ onOpenGenesisSetup }) => {
  const state = store.getState();
  const adminUsers = state.adminUsers || [];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showHowGenesisWorks, setShowHowGenesisWorks] = useState(false);

  // New Staff Invite Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+263 ');
  const [role, setRole] = useState<AdminRole>('dispatch_officer');
  const [department, setDepartment] = useState('Central Harare Operations');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'view_ledgers',
    'manage_sos'
  ]);

  const allAvailablePermissions = [
    { id: 'all_access', label: 'Full Root Super-Admin Access', desc: 'Can manage platform pricing, staff accounts, encryption keys' },
    { id: 'manage_pricing', label: 'Pricing & Algorithm Rules', desc: 'Can alter base fares, per-km rates, and commission percentages' },
    { id: 'approve_kyc', label: 'Driver KYC & Document Audit', desc: 'Can approve/reject national IDs, fitness certs, and permits' },
    { id: 'process_payouts', label: 'Financial Disbursals & Payouts', desc: 'Can authorize EcoCash and bank payouts to driver wallets' },
    { id: 'manage_sos', label: 'Emergency SOS & ZRP Dispatch', desc: 'Can receive and resolve live GPS panic beacons' },
    { id: 'manage_staff', label: 'Operator & Staff Management', desc: 'Can invite and modify roles for other operators' },
    { id: 'view_ledgers', label: 'Financial Ledgers & Tax Reports', desc: 'Can inspect transaction ledgers and export ZIMRA reports' }
  ];

  const handleTogglePermission = (permId: string) => {
    if (selectedPermissions.includes(permId)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== permId));
    } else {
      setSelectedPermissions([...selectedPermissions, permId]);
    }
  };

  const handleInviteStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert('Please provide staff member name and email address.');
      return;
    }

    store.addAdminUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role,
      department: department.trim(),
      avatarUrl: `https://images.unsplash.com/photo-${role === 'super_admin' ? '1534528741775-53994a69daeb' : '1507003211169-0a1dd7228f2d'}?w=150&auto=format&fit=crop&q=80`,
      status: 'active',
      permissions: role === 'super_admin' ? ['all_access', ...selectedPermissions] : selectedPermissions
    });

    setName('');
    setEmail('');
    setPhone('+263 ');
    setShowInviteModal(false);
    alert(`Staff account provisioned for ${name} (${email}). Initial invitation credentials have been generated.`);
  };

  const filteredUsers = adminUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery);

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: AdminRole, isRoot?: boolean) => {
    if (isRoot) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400 text-slate-950 flex items-center gap-1 shadow-xs">
          <Sparkles className="w-3 h-3 text-slate-950" />
          ROOT SUPER ADMIN
        </span>
      );
    }
    switch (role) {
      case 'super_admin':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-900 text-amber-300">SUPER ADMIN</span>;
      case 'operations_manager':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800">OPERATIONS MGR</span>;
      case 'dispatch_officer':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">DISPATCH OFFICER</span>;
      case 'financial_auditor':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-100 text-purple-800">FINANCIAL AUDITOR</span>;
      case 'kyc_compliance_lead':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-100 text-sky-800">KYC & PERMITS</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">SUPPORT AGENT</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Architecture Explanation & Genesis Box */}
      <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-sky-900 border border-sky-800/60 rounded-xl p-4 sm:p-5 text-white shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Platform Operator & Staff RBAC Administration
              </h2>
              <span className="bg-rose-500/20 text-rose-300 border border-rose-400/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                SELF-REGISTRATION DISABLED
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Staff and operational accounts <strong>cannot self-register</strong>. All dispatch officers, KYC compliance reviewers, and treasury auditors must be explicitly provisioned by an authenticated Super Admin with strict Role-Based Access Control (RBAC).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setShowHowGenesisWorks(!showHowGenesisWorks)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-sky-300 border border-sky-600/40 rounded-lg text-xs font-semibold transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>How Initial Admin is Created</span>
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs shadow-sm transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite New Staff Member</span>
            </button>
          </div>
        </div>

        {/* Expandable Genesis Lifecycle Card */}
        {showHowGenesisWorks && (
          <div className="mt-4 pt-4 border-t border-slate-700/60 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-900/80 border border-slate-700/60 rounded-lg p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                <Key className="w-3.5 h-3.5" />
                <span>1. Genesis Initialization Seed</span>
              </div>
              <p className="text-[11px] text-slate-300">
                During deployment, the system checks for a root administrator. If none exists, an immutable Genesis record (<code className="text-amber-300">admin@ride.co.zw</code>) is provisioned using the server environment secret.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-700/60 rounded-lg p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                <Shield className="w-3.5 h-3.5" />
                <span>2. Multi-Factor & RBAC Scopes</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Super Admins can invite staff with limited scopes (e.g. KYC reviewers cannot alter pricing algorithms, and dispatchers cannot trigger treasury payouts).
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-700/60 rounded-lg p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-sky-400 font-bold text-[11px]">
                <Lock className="w-3.5 h-3.5" />
                <span>3. Initial Admin Bootstrap Action</span>
              </div>
              <p className="text-[11px] text-slate-300 mb-2">
                Need to re-bootstrap or reset root administrator credentials on this environment?
              </p>
              <button
                onClick={onOpenGenesisSetup}
                className="w-full py-1 px-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded text-[10px] flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                Launch Genesis Setup Wizard
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Staff Filter and Metrics Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search staff by name, email, department, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded pl-8 pr-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-600 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-sky-600 font-medium"
            >
              <option value="all">All Roles ({adminUsers.length})</option>
              <option value="super_admin">Super Admins</option>
              <option value="operations_manager">Operations Managers</option>
              <option value="dispatch_officer">Dispatch Officers</option>
              <option value="financial_auditor">Financial Auditors</option>
              <option value="kyc_compliance_lead">KYC Compliance</option>
              <option value="customer_support_agent">Support Agents</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500">
          <span className="bg-slate-100 px-2 py-1 rounded font-bold text-slate-700">
            ACTIVE OPERATORS: {adminUsers.filter((u) => u.status === 'active').length}
          </span>
          <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-1 rounded font-bold">
            ROOT PROTECTED: 1
          </span>
        </div>
      </div>

      {/* Staff Directory Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
              <tr>
                <th className="cell-condensed">Operator / Staff Name</th>
                <th className="cell-condensed">Role & Department</th>
                <th className="cell-condensed">Contact Details</th>
                <th className="cell-condensed">Permission Scopes</th>
                <th className="cell-condensed">Last Active</th>
                <th className="cell-condensed text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="cell-condensed">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{user.name}</span>
                          {user.isRootSuperAdmin && (
                            <span className="w-2 h-2 rounded-full bg-amber-400" title="Genesis Root Administrator" />
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 block">{user.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="cell-condensed">
                    <div className="space-y-1">
                      <div>{getRoleBadge(user.role, user.isRootSuperAdmin)}</div>
                      <span className="text-[10px] text-slate-500 block">{user.department}</span>
                    </div>
                  </td>
                  <td className="cell-condensed font-mono text-[11px]">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-slate-700">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 text-[10px]">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{user.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="cell-condensed">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {user.permissions.slice(0, 3).map((perm) => (
                        <span key={perm} className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[9px] font-mono">
                          {perm.replace('_', ' ')}
                        </span>
                      ))}
                      {user.permissions.length > 3 && (
                        <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded text-[9px] font-mono font-bold">
                          +{user.permissions.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="cell-condensed font-mono text-[10px] text-slate-500">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never logged in'}
                  </td>
                  <td className="cell-condensed text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          const newPhone = prompt('Update phone number:', user.phone);
                          if (newPhone) {
                            store.updateAdminUser(user.id, { phone: newPhone });
                          }
                        }}
                        className="p-1 rounded text-slate-400 hover:text-sky-700 hover:bg-sky-50"
                        title="Edit Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {!user.isRootSuperAdmin && (
                        <button
                          onClick={() => {
                            if (confirm(`Remove administrator privileges for ${user.name}?`)) {
                              store.deleteAdminUser(user.id);
                            }
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Revoke Administrator Access"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Provision Platform Operator Account</h3>
                  <p className="text-[10px] text-slate-400">Add an employee, dispatcher, or compliance auditor</p>
                </div>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInviteStaff} className="p-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tatenda Gono"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:border-sky-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Corporate Email</label>
                  <input
                    type="email"
                    required
                    placeholder="t.gono@ride.co.zw"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:border-sky-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone (EcoCash / WhatsApp)</label>
                  <input
                    type="text"
                    placeholder="+263 77 ..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:border-sky-600 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Role Designation</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as AdminRole)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:border-sky-600 focus:bg-white font-medium"
                  >
                    <option value="super_admin">Super Administrator (Full Access)</option>
                    <option value="operations_manager">Operations Manager</option>
                    <option value="dispatch_officer">Dispatch & SOS Officer</option>
                    <option value="financial_auditor">Financial & Treasury Auditor</option>
                    <option value="kyc_compliance_lead">KYC & Document Reviewer</option>
                    <option value="customer_support_agent">Customer Support Agent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Operating Department / Hub</label>
                <input
                  type="text"
                  placeholder="e.g. Bulawayo Regional Hub or Treasury Reconciliation"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:border-sky-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Assigned Permission Scopes</label>
                <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {allAvailablePermissions.map((perm) => (
                    <label
                      key={perm.id}
                      className={`flex items-start gap-2 p-1.5 rounded border text-[11px] cursor-pointer transition-colors ${
                        selectedPermissions.includes(perm.id)
                          ? 'bg-sky-50 border-sky-300 text-sky-950 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(perm.id)}
                        onChange={() => handleTogglePermission(perm.id)}
                        className="mt-0.5 rounded text-sky-600 focus:ring-0"
                      />
                      <div>
                        <span className="font-bold block">{perm.label}</span>
                        <span className="text-[10px] text-slate-500 font-normal">{perm.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-sky-900 hover:bg-sky-950 text-amber-400 font-bold shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Create Operator Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
