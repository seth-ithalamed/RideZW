import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Compass,
  Car,
  Bike,
  Users,
  Sparkles,
  Search,
  Filter,
  Sliders,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { store } from '../../services/store';
import { CoverageCity, VehicleCategory } from '../../types';

interface CoverageCitiesTabProps {
  coverageCities: CoverageCity[];
}

export const CoverageCitiesTab: React.FC<CoverageCitiesTabProps> = ({ coverageCities }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'coming_soon' | 'inactive'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCity, setEditingCity] = useState<CoverageCity | null>(null);

  // New City Form State
  const [newCityName, setNewCityName] = useState('');
  const [newProvince, setNewProvince] = useState('Harare Metropolitan');
  const [newCode, setNewCode] = useState('');
  const [newStatus, setNewStatus] = useState<'active' | 'coming_soon' | 'inactive'>('active');
  const [newRadiusKm, setNewRadiusKm] = useState(25);
  const [newBaseMultiplier, setNewBaseMultiplier] = useState(1.0);
  const [newCenterLat, setNewCenterLat] = useState(-17.8292);
  const [newCenterLng, setNewCenterLng] = useState(31.0522);
  const [newCategories, setNewCategories] = useState<VehicleCategory[]>(['economy', 'comfort', 'motorbike']);

  const ZIM_PROVINCES = [
    'Harare Metropolitan',
    'Bulawayo Metropolitan',
    'Matabeleland North',
    'Matabeleland South',
    'Manicaland',
    'Midlands',
    'Masvingo',
    'Mashonaland West',
    'Mashonaland East',
    'Mashonaland Central'
  ];

  const PRESET_CITIES: Array<{ name: string; province: string; code: string; lat: number; lng: number }> = [
    { name: 'Victoria Falls', province: 'Matabeleland North', code: 'VFA', lat: -17.9311, lng: 25.8307 },
    { name: 'Mutare', province: 'Manicaland', code: 'UTA', lat: -18.9728, lng: 32.6695 },
    { name: 'Gweru', province: 'Midlands', code: 'GWE', lat: -19.4587, lng: 29.8153 },
    { name: 'Masvingo', province: 'Masvingo', code: 'MVG', lat: -20.0744, lng: 30.8328 },
    { name: 'Chinhoyi', province: 'Mashonaland West', code: 'CHY', lat: -17.3667, lng: 30.2000 },
    { name: 'Kwekwe', province: 'Midlands', code: 'KWE', lat: -18.9281, lng: 29.8149 },
    { name: 'Marondera', province: 'Mashonaland East', code: 'MRD', lat: -18.1853, lng: 31.5519 },
    { name: 'Kadoma', province: 'Mashonaland West', code: 'KDM', lat: -18.3333, lng: 29.9167 },
    { name: 'Zvishavane', province: 'Midlands', code: 'ZVS', lat: -20.3267, lng: 30.0665 },
    { name: 'Beitbridge', province: 'Matabeleland South', code: 'BBG', lat: -22.2167, lng: 30.0000 },
    { name: 'Hwange', province: 'Matabeleland North', code: 'HWG', lat: -18.3647, lng: 25.4981 },
    { name: 'Bindura', province: 'Mashonaland Central', code: 'BND', lat: -17.3000, lng: 31.3333 },
    { name: 'Gwanda', province: 'Matabeleland South', code: 'GWA', lat: -20.9333, lng: 29.0000 },
    { name: 'Kariba', province: 'Mashonaland West', code: 'KRB', lat: -16.5167, lng: 28.8000 },
    { name: 'Chipinge', province: 'Manicaland', code: 'CHP', lat: -20.2000, lng: 32.6167 }
  ];

  const handleSelectPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = PRESET_CITIES.find((p) => p.name === e.target.value);
    if (selected) {
      setNewCityName(selected.name);
      setNewProvince(selected.province);
      setNewCode(selected.code);
      setNewCenterLat(selected.lat);
      setNewCenterLng(selected.lng);
    }
  };

  const handleAddCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName.trim()) {
      alert('City name is required');
      return;
    }
    store.addCoverageCity({
      name: newCityName.trim(),
      province: newProvince,
      status: newStatus,
      code: newCode.trim().toUpperCase() || newCityName.slice(0, 3).toUpperCase(),
      centerLat: newCenterLat,
      centerLng: newCenterLng,
      radiusKm: Number(newRadiusKm),
      baseFareMultiplier: Number(newBaseMultiplier),
      supportedCategories: newCategories,
      isPrimaryHub: false
    });

    setShowAddModal(false);
    // Reset form
    setNewCityName('');
    setNewCode('');
    setNewRadiusKm(25);
    setNewBaseMultiplier(1.0);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCity) return;
    store.updateCoverageCity(editingCity.id, editingCity);
    setEditingCity(null);
  };

  const handleCategoryToggle = (cat: VehicleCategory, isEdit = false) => {
    if (isEdit && editingCity) {
      const exists = editingCity.supportedCategories.includes(cat);
      const updated = exists
        ? editingCity.supportedCategories.filter((c) => c !== cat)
        : [...editingCity.supportedCategories, cat];
      setEditingCity({ ...editingCity, supportedCategories: updated });
    } else {
      const exists = newCategories.includes(cat);
      setNewCategories(exists ? newCategories.filter((c) => c !== cat) : [...newCategories, cat]);
    }
  };

  const filteredCities = coverageCities.filter((city) => {
    const matchesSearch =
      city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.province.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || city.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalActive = coverageCities.filter((c) => c.status === 'active').length;
  const totalComingSoon = coverageCities.filter((c) => c.status === 'coming_soon').length;
  const totalFleet = store.getActiveDriversCount();
  const totalRegisteredDrivers = store.getTotalDriversCount();

  return (
    <div className="space-y-4">
      {/* Top Banner & Action */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-sky-50 border border-sky-200 text-sky-800 flex items-center justify-center font-bold">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-slate-900 font-bold text-xs">National Coverage Cities & Geofencing</h3>
            <p className="text-[10px] text-slate-500">
              Configure operational service areas, geofenced radius corridors, and city-level fare multipliers across all 10 provinces of Zimbabwe.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-800 hover:bg-sky-900 text-white font-bold text-xs transition-all shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Coverage City</span>
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Cities Defined</span>
          <p className="text-base font-mono font-bold text-slate-900 mt-0.5">{coverageCities.length}</p>
          <span className="text-[9px] text-slate-500 font-medium">Across all 10 Provinces</span>
        </div>
        <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Active Live Corridors</span>
          <p className="text-base font-mono font-bold text-emerald-700 mt-0.5">{totalActive} Live</p>
          <span className="text-[9px] text-emerald-700 font-bold">Full Dispatch & SOS</span>
        </div>
        <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Expansion Pipeline</span>
          <p className="text-base font-mono font-bold text-amber-700 mt-0.5">{totalComingSoon} Cities</p>
          <span className="text-[9px] text-amber-700 font-medium">Coming soon / Driver onboarding</span>
        </div>
        <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Active Online Drivers</span>
          <p className="text-base font-mono font-bold text-emerald-700 mt-0.5">{totalFleet} Active</p>
          <span className="text-[9px] text-slate-500 font-medium">{totalRegisteredDrivers} total on platform</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by city name, code (e.g. HRE, BYO, VFA), or province..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:bg-white focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <div className="flex items-center bg-slate-50 p-0.5 rounded border border-slate-200 text-xs">
            {(['all', 'active', 'coming_soon', 'inactive'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold capitalize transition-all ${
                  statusFilter === status
                    ? 'bg-sky-800 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {status === 'all' ? 'All' : status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cities Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">City & Code</th>
                <th className="p-3">Province</th>
                <th className="p-3">Status</th>
                <th className="p-3">Radius & Geofence</th>
                <th className="p-3">Fare Multiplier</th>
                <th className="p-3">Active Fleet</th>
                <th className="p-3">Fleet Categories</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCities.map((city) => (
                <tr key={city.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-sky-50 border border-sky-200 text-sky-800 flex items-center justify-center font-mono font-bold text-[10px]">
                        {city.code}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{city.name}</span>
                          {city.isPrimaryHub && (
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-200 font-bold">
                              PRIMARY HUB
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {city.centerLat.toFixed(3)}, {city.centerLng.toFixed(3)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-medium text-slate-600">{city.province}</td>
                  <td className="p-3">
                    <button
                      onClick={() => store.toggleCoverageCityStatus(city.id)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                        city.status === 'active'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          : city.status === 'coming_soon'
                          ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                      title="Click to toggle status"
                    >
                      {city.status === 'active' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Active</span>
                        </>
                      ) : city.status === 'coming_soon' ? (
                        <>
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Coming Soon</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-slate-400" />
                          <span>Inactive</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="p-3 font-mono font-medium text-slate-700">
                    <div className="flex items-center gap-1">
                      <Compass className="w-3 h-3 text-slate-400" />
                      <span>{city.radiusKm} km radius</span>
                    </div>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-900">
                    <span className={city.baseFareMultiplier > 1.0 ? 'text-amber-800' : 'text-slate-700'}>
                      {city.baseFareMultiplier.toFixed(2)}x
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="font-bold text-sky-900">
                        {store.getCityActiveDriversCount(city.name)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        active ({store.getTotalDriversCount(city.name)} total)
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      {city.supportedCategories?.map((cat) => (
                        <span
                          key={cat}
                          className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[9px] font-mono capitalize font-bold text-slate-600"
                        >
                          {cat === 'motorbike' ? 'Boda' : cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setEditingCity(city)}
                        className="p-1 rounded text-slate-500 hover:text-sky-800 hover:bg-slate-100 transition-colors"
                        title="Edit City Configuration"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {!city.isPrimaryHub && (
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to remove coverage city ${city.name}?`)) {
                              store.deleteCoverageCity(city.id);
                            }
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Coverage City"
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

      {/* Add City Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 border border-slate-200 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-800" />
                <h3 className="text-slate-900 font-bold text-sm">Add New Coverage City</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {/* Quick Preset Selector */}
            <div className="p-2.5 bg-sky-50/60 border border-sky-200/70 rounded-lg space-y-1">
              <label className="text-[10px] font-bold text-sky-900 uppercase tracking-wider block">
                Quick Select from Zimbabwean Cities
              </label>
              <select
                onChange={handleSelectPreset}
                className="w-full p-1.5 text-xs bg-white border border-sky-200 rounded font-medium focus:outline-none"
              >
                <option value="">-- Choose a standard city or enter manually below --</option>
                {PRESET_CITIES.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} ({p.province}) — {p.code}
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={handleAddCity} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    City Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCityName}
                    onChange={(e) => setNewCityName(e.target.value)}
                    placeholder="e.g. Victoria Falls, Mutare"
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Airport / City Code
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    placeholder="e.g. VFA, UTA"
                    className="w-full p-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Province
                  </label>
                  <select
                    value={newProvince}
                    onChange={(e) => setNewProvince(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:bg-white"
                  >
                    {ZIM_PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Coverage Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:bg-white"
                  >
                    <option value="active">Active (Instant Live Dispatch)</option>
                    <option value="coming_soon">Coming Soon (Driver Pipeline)</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Geofence Radius (KM)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={150}
                    value={newRadiusKm}
                    onChange={(e) => setNewRadiusKm(Number(e.target.value))}
                    className="w-full p-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Base Fare Multiplier (e.g. 1.15 for tourist corridor)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min={0.8}
                    max={2.5}
                    value={newBaseMultiplier}
                    onChange={(e) => setNewBaseMultiplier(Number(e.target.value))}
                    className="w-full p-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Center Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newCenterLat}
                    onChange={(e) => setNewCenterLat(Number(e.target.value))}
                    className="w-full p-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Center Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newCenterLng}
                    onChange={(e) => setNewCenterLng(Number(e.target.value))}
                    className="w-full p-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              {/* Supported Vehicle Categories */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Supported Vehicle Tiers
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['economy', 'comfort', 'xl', 'motorbike'] as VehicleCategory[]).map((cat) => {
                    const isSelected = newCategories.includes(cat);
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => handleCategoryToggle(cat)}
                        className={`p-2 rounded border text-left text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-sky-50 border-sky-400 text-sky-900'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          {cat === 'economy' && <Car className="w-3.5 h-3.5" />}
                          {cat === 'comfort' && <Sparkles className="w-3.5 h-3.5" />}
                          {cat === 'xl' && <Users className="w-3.5 h-3.5" />}
                          {cat === 'motorbike' && <Bike className="w-3.5 h-3.5" />}
                          <span className="capitalize">{cat === 'motorbike' ? 'Boda' : cat}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-sky-800 hover:bg-sky-900 text-white text-xs font-bold transition-all shadow-xs"
                >
                  Save & Publish City
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit City Modal */}
      {editingCity && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 border border-slate-200 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-sky-800" />
                <h3 className="text-slate-900 font-bold text-sm">Edit Coverage City: {editingCity.name}</h3>
              </div>
              <button
                onClick={() => setEditingCity(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    City Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCity.name}
                    onChange={(e) => setEditingCity({ ...editingCity, name: e.target.value })}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Code
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={editingCity.code}
                    onChange={(e) => setEditingCity({ ...editingCity, code: e.target.value.toUpperCase() })}
                    className="w-full p-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Province
                  </label>
                  <select
                    value={editingCity.province}
                    onChange={(e) => setEditingCity({ ...editingCity, province: e.target.value })}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:bg-white"
                  >
                    {ZIM_PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Coverage Status
                  </label>
                  <select
                    value={editingCity.status}
                    onChange={(e) => setEditingCity({ ...editingCity, status: e.target.value as any })}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:bg-white"
                  >
                    <option value="active">Active (Instant Live Dispatch)</option>
                    <option value="coming_soon">Coming Soon (Driver Pipeline)</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Geofence Radius (KM)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={150}
                    value={editingCity.radiusKm}
                    onChange={(e) => setEditingCity({ ...editingCity, radiusKm: Number(e.target.value) })}
                    className="w-full p-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Base Fare Multiplier
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min={0.8}
                    max={2.5}
                    value={editingCity.baseFareMultiplier}
                    onChange={(e) => setEditingCity({ ...editingCity, baseFareMultiplier: Number(e.target.value) })}
                    className="w-full p-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Supported Vehicle Tiers
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['economy', 'comfort', 'xl', 'motorbike'] as VehicleCategory[]).map((cat) => {
                    const isSelected = editingCity.supportedCategories.includes(cat);
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => handleCategoryToggle(cat, true)}
                        className={`p-2 rounded border text-left text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-sky-50 border-sky-400 text-sky-900'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          {cat === 'economy' && <Car className="w-3.5 h-3.5" />}
                          {cat === 'comfort' && <Sparkles className="w-3.5 h-3.5" />}
                          {cat === 'xl' && <Users className="w-3.5 h-3.5" />}
                          {cat === 'motorbike' && <Bike className="w-3.5 h-3.5" />}
                          <span className="capitalize">{cat === 'motorbike' ? 'Boda' : cat}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCity(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-sky-800 hover:bg-sky-900 text-white text-xs font-bold transition-all shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
