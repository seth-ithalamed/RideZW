import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, MapPin, Shield, Car, Save, CheckCircle2, AlertCircle, HeartHandshake } from 'lucide-react';
import { store } from '../../services/store';
import { RiderProfile, DriverProfile, VehicleCategory, PaymentMethod } from '../../types';
import { dialog } from '../../services/dialogService';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'rider' | 'driver';
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  role
}) => {
  const state = store.getState();
  const rider = state.rider;
  const activeDriver = state.drivers.find((d) => d.id === state.activeDriverId) || state.drivers[0];

  // Rider Form State
  const [riderName, setRiderName] = useState(rider?.name || '');
  const [riderPhone, setRiderPhone] = useState(rider?.phone || '');
  const [riderEmail, setRiderEmail] = useState(rider?.email || '');
  const [riderNationalId, setRiderNationalId] = useState(rider?.nationalId || '');
  const [riderCity, setRiderCity] = useState(rider?.city || 'Harare');
  const [riderEmergencyName, setRiderEmergencyName] = useState(rider?.emergencyContactName || '');
  const [riderEmergencyPhone, setRiderEmergencyPhone] = useState(rider?.emergencyContactPhone || '');
  const [riderPaymentMethod, setRiderPaymentMethod] = useState<PaymentMethod>(rider?.preferredPaymentMethod || 'ecocash');

  // Driver Form State
  const [driverName, setDriverName] = useState(activeDriver?.name || '');
  const [driverPhone, setDriverPhone] = useState(activeDriver?.phone || '');
  const [driverEmail, setDriverEmail] = useState(activeDriver?.email || '');
  const [driverNationalId, setDriverNationalId] = useState(activeDriver?.nationalId || '');
  const [driverCity, setDriverCity] = useState(activeDriver?.city || 'Harare');
  const [vehicleMake, setVehicleMake] = useState(activeDriver?.vehicle?.make || 'Toyota');
  const [vehicleModel, setVehicleModel] = useState(activeDriver?.vehicle?.model || 'Passo');
  const [vehicleColor, setVehicleColor] = useState(activeDriver?.vehicle?.color || 'Silver');
  const [vehiclePlate, setVehiclePlate] = useState(activeDriver?.vehicle?.plateNumber || '');
  const [vehicleCategory, setVehicleCategory] = useState<VehicleCategory>(activeDriver?.vehicle?.category || 'economy');

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (role === 'rider' && rider) {
      setRiderName(rider.name);
      setRiderPhone(rider.phone);
      setRiderEmail(rider.email || '');
      setRiderNationalId(rider.nationalId || '');
      setRiderCity(rider.city || 'Harare');
      setRiderEmergencyName(rider.emergencyContactName || '');
      setRiderEmergencyPhone(rider.emergencyContactPhone || '');
      setRiderPaymentMethod(rider.preferredPaymentMethod || 'ecocash');
    } else if (role === 'driver' && activeDriver) {
      setDriverName(activeDriver.name);
      setDriverPhone(activeDriver.phone);
      setDriverEmail(activeDriver.email || '');
      setDriverNationalId(activeDriver.nationalId || '');
      setDriverCity(activeDriver.city || 'Harare');
      setVehicleMake(activeDriver.vehicle?.make || 'Toyota');
      setVehicleModel(activeDriver.vehicle?.model || 'Passo');
      setVehicleColor(activeDriver.vehicle?.color || 'Silver');
      setVehiclePlate(activeDriver.vehicle?.plateNumber || '');
      setVehicleCategory(activeDriver.vehicle?.category || 'economy');
    }
  }, [isOpen, role, rider, activeDriver]);

  if (!isOpen) return null;

  const handleSaveRider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!riderName.trim() || !riderPhone.trim()) {
      dialog.alert('Validation Error', 'Full Name and Phone Number are required.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      store.updateRiderProfile(rider.id, {
        name: riderName.trim(),
        phone: riderPhone.trim(),
        email: riderEmail.trim() || undefined,
        nationalId: riderNationalId.trim() || undefined,
        city: riderCity,
        emergencyContactName: riderEmergencyName.trim() || 'Emergency Hotline',
        emergencyContactPhone: riderEmergencyPhone.trim() || '+263 77 000 9999',
        preferredPaymentMethod: riderPaymentMethod
      });

      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      dialog.alert('Save Failed', err.message || 'Could not update rider profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName.trim() || !driverPhone.trim() || !vehiclePlate.trim()) {
      dialog.alert('Validation Error', 'Driver Name, Phone, and Vehicle Plate are required.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      store.updateDriverProfile(activeDriver.id, {
        name: driverName.trim(),
        phone: driverPhone.trim(),
        email: driverEmail.trim() || 'driver@ridezw.co.zw',
        nationalId: driverNationalId.trim() || activeDriver.nationalId,
        city: driverCity,
        vehicle: {
          make: vehicleMake.trim(),
          model: vehicleModel.trim(),
          color: vehicleColor.trim(),
          plateNumber: vehiclePlate.trim().toUpperCase(),
          category: vehicleCategory
        }
      });

      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      dialog.alert('Save Failed', err.message || 'Could not update driver profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      id="user-profile-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in"
    >
      <div
        id="user-profile-modal-card"
        className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col animate-scale-up"
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-sky-950 via-[#0d3a54] to-sky-900 border-b border-sky-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-sky-950 flex items-center justify-center font-bold shadow-xs">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">
                {role === 'rider' ? 'Passenger Profile Settings' : 'Driver Partner Profile & Vehicle'}
              </h3>
              <p className="text-[10px] text-sky-200 font-medium">
                Manage personal account credentials and operational settings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Alert */}
        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Profile successfully updated and synced to database!</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-800 flex-1">
          {role === 'rider' ? (
            <form id="rider-profile-form" onSubmit={handleSaveRider} className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-sky-700" />
                  <span>Personal Details</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      value={riderName}
                      onChange={(e) => setRiderName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-sky-600 focus:bg-white"
                      placeholder="e.g. Tafadzwa Moyo"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mobile Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={riderPhone}
                      onChange={(e) => setRiderPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-600 focus:bg-white"
                      placeholder="+263 77 123 4567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={riderEmail}
                      onChange={(e) => setRiderEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-600 focus:bg-white"
                      placeholder="rider@example.co.zw"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Primary Municipal City</label>
                    <select
                      value={riderCity}
                      onChange={(e) => setRiderCity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-600 focus:bg-white"
                    >
                      {(state.coverageCities || []).map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} ({c.province})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Safety & Emergency Contact */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-1 flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-rose-600" />
                  <span>Safety & SOS Emergency Contact</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Emergency Contact Name</label>
                    <input
                      type="text"
                      value={riderEmergencyName}
                      onChange={(e) => setRiderEmergencyName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-600 focus:bg-white"
                      placeholder="Next of Kin or Hotline"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Emergency Contact Phone</label>
                    <input
                      type="text"
                      value={riderEmergencyPhone}
                      onChange={(e) => setRiderEmergencyPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-600 focus:bg-white"
                      placeholder="+263 77 000 9999"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Preferences */}
              <div className="space-y-2 pt-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Default In-App Payment Method</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'ecocash', label: 'EcoCash' },
                    { id: 'onemoney', label: 'OneMoney' },
                    { id: 'innbucks', label: 'InnBucks' },
                    { id: 'cash', label: 'Cash USD' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setRiderPaymentMethod(p.id as PaymentMethod)}
                      className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                        riderPaymentMethod === p.id
                          ? 'bg-sky-900 text-white border-sky-900 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg bg-sky-900 hover:bg-sky-800 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          ) : (
            <form id="driver-profile-form" onSubmit={handleSaveDriver} className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-sky-700" />
                  <span>Driver Partner Credentials</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Driver Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-sky-600 focus:bg-white"
                      placeholder="e.g. Farai Chigumba"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Driver Mobile Phone *</label>
                    <input
                      type="text"
                      required
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-600 focus:bg-white"
                      placeholder="+263 77 123 4567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">National ID Number</label>
                    <input
                      type="text"
                      value={driverNationalId}
                      onChange={(e) => setDriverNationalId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-600 focus:bg-white"
                      placeholder="63-1284920-A63"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Base Operational City</label>
                    <select
                      value={driverCity}
                      onChange={(e) => setDriverCity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-600 focus:bg-white"
                    >
                      {(state.coverageCities || []).map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} ({c.province})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Vehicle Specifications */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-1 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-amber-500" />
                  <span>Vehicle Specifications & Registration</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Vehicle Make</label>
                    <input
                      type="text"
                      value={vehicleMake}
                      onChange={(e) => setVehicleMake(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-600 focus:bg-white"
                      placeholder="Toyota"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Vehicle Model</label>
                    <input
                      type="text"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-600 focus:bg-white"
                      placeholder="Passo"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Exterior Color</label>
                    <input
                      type="text"
                      value={vehicleColor}
                      onChange={(e) => setVehicleColor(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-600 focus:bg-white"
                      placeholder="Silver"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Plate Registration Number *</label>
                    <input
                      type="text"
                      required
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono font-bold uppercase focus:outline-none focus:border-sky-600 focus:bg-white"
                      placeholder="AFE-8921"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Vehicle Category</label>
                    <select
                      value={vehicleCategory}
                      onChange={(e) => setVehicleCategory(e.target.value as VehicleCategory)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-600 focus:bg-white font-semibold"
                    >
                      <option value="economy">Economy (4 Seats)</option>
                      <option value="comfort">Comfort (Premium Sedan)</option>
                      <option value="xl">XL (6+ Seats / Van)</option>
                      <option value="motorbike">Motorbike / Express</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg bg-sky-900 hover:bg-sky-800 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isSaving ? 'Saving...' : 'Save Driver Profile'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
