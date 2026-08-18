import React, { useState } from 'react';
import {
  X,
  Phone,
  Lock,
  User,
  ShieldCheck,
  Car,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  Building,
  KeyRound
} from 'lucide-react';
import { store } from '../../services/store';
import { RideZWLogo } from '../common/RideZWLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  initialRole?: 'rider' | 'driver' | 'admin';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  initialRole = 'rider'
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<'rider' | 'driver' | 'admin'>(initialRole);
  
  // Sign In States
  const [signInIdentifier, setSignInIdentifier] = useState('+263 77 123 9988');
  const [signInPassword, setSignInPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState<'otp' | 'password'>('otp');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [authError, setAuthError] = useState('');

  // Sign Up States
  const [signUpStep, setSignUpStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('+263 77 ');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState<'Harare' | 'Bulawayo'>('Harare');
  const [vehicleMake, setVehicleMake] = useState('Toyota Passo');
  const [vehiclePlate, setVehiclePlate] = useState('AFE-8921');
  const [vehicleCategory, setVehicleCategory] = useState<'economy' | 'comfort' | 'xl' | 'motorbike'>('economy');

  if (!isOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (selectedRole === 'rider') {
      store.setActiveTab('rider');
    } else if (selectedRole === 'driver') {
      store.setActiveTab('driver');
    } else if (selectedRole === 'admin') {
      store.setActiveTab('admin');
    }

    onClose();
  };

  const handleSendOtp = () => {
    setOtpSent(true);
    setOtpCode('892014');
  };

  const handleCompleteSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === 'driver') {
      store.registerDriver({
        name: fullName || 'New Driver Partner',
        phone: phone || '+263 77 999 0000',
        nationalId: nationalId || '63-1284920-A63',
        email: email || 'driver@ridezw.co.zw',
        city,
        vehicle: {
          make: vehicleMake.split(' ')[0] || 'Toyota',
          model: vehicleMake.split(' ').slice(1).join(' ') || 'Vitz',
          year: 2020,
          color: 'Silver',
          plateNumber: vehiclePlate || 'AGX-8821',
          category: vehicleCategory,
          capacity: vehicleCategory === 'xl' ? 6 : vehicleCategory === 'motorbike' ? 1 : 4,
          fitnessCertNumber: 'VID-2026-REG',
          fitnessExpiry: '2027-04-01',
          insuranceNumber: 'OM-2026-PUB',
          insuranceExpiry: '2027-04-01'
        }
      });
      store.setActiveTab('driver');
    } else {
      store.setActiveTab('rider');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header with Official Logo */}
        <div className="p-4 bg-gradient-to-r from-sky-950 via-[#0d3a54] to-sky-900 border-b border-sky-800 text-white flex items-center justify-between">
          <RideZWLogo size="sm" theme="dark" showTagline={true} />
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Sign In vs Create Account */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            onClick={() => {
              setMode('signin');
              setAuthError('');
            }}
            className={`flex-1 py-3 text-center transition-colors ${
              mode === 'signin'
                ? 'bg-white text-sky-950 border-b-2 border-amber-400 font-extrabold shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode('signup');
              setSignUpStep(1);
              setAuthError('');
            }}
            className={`flex-1 py-3 text-center transition-colors ${
              mode === 'signup'
                ? 'bg-white text-sky-950 border-b-2 border-amber-400 font-extrabold shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Account Category Selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-tight block mb-1.5">
              Account Type
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedRole('rider')}
                className={`py-2 px-2 rounded-lg border text-center transition-all ${
                  selectedRole === 'rider'
                    ? 'bg-sky-50 border-sky-600 text-sky-950 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 mx-auto mb-0.5 text-sky-700" />
                <span className="text-xs block leading-tight">Rider</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('driver')}
                className={`py-2 px-2 rounded-lg border text-center transition-all ${
                  selectedRole === 'driver'
                    ? 'bg-sky-50 border-sky-600 text-sky-950 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                <Car className="w-3.5 h-3.5 mx-auto mb-0.5 text-emerald-600" />
                <span className="text-xs block leading-tight">Driver</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`py-2 px-2 rounded-lg border text-center transition-all ${
                  selectedRole === 'admin'
                    ? 'bg-sky-50 border-sky-600 text-sky-950 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 mx-auto mb-0.5 text-amber-600" />
                <span className="text-xs block leading-tight">Staff Admin</span>
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SIGN IN VIEW */}
          {/* ========================================================= */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-tight block mb-1">
                  {selectedRole === 'admin' ? 'Corporate Email / Staff ID' : 'Mobile Phone (EcoCash / NetOne)'}
                </label>
                <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus-within:ring-2 focus-within:ring-sky-800 focus-within:border-sky-800">
                  {selectedRole === 'admin' ? (
                    <KeyRound className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  ) : (
                    <Phone className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  )}
                  <input
                    type={selectedRole === 'admin' ? 'text' : 'tel'}
                    required
                    value={signInIdentifier}
                    onChange={(e) => setSignInIdentifier(e.target.value)}
                    placeholder={selectedRole === 'admin' ? 'admin@ride.co.zw' : '+263 77 123 4567'}
                    className="w-full bg-transparent text-xs text-slate-900 font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Password or SMS OTP */}
              {authMethod === 'password' || selectedRole === 'admin' ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">
                      Security Password
                    </label>
                    {selectedRole !== 'admin' && (
                      <button
                        type="button"
                        onClick={() => setAuthMethod('otp')}
                        className="text-[10px] text-sky-800 font-bold hover:underline"
                      >
                        Use SMS OTP instead
                      </button>
                    )}
                  </div>
                  <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus-within:ring-2 focus-within:ring-sky-800 focus-within:border-sky-800">
                    <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full bg-transparent text-xs text-slate-900 font-mono focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 ml-1"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">
                      SMS One-Time PIN
                    </label>
                    <button
                      type="button"
                      onClick={() => setAuthMethod('password')}
                      className="text-[10px] text-sky-800 font-bold hover:underline"
                    >
                      Use Password instead
                    </button>
                  </div>

                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-sky-900 font-bold text-xs border border-slate-300 transition-colors"
                    >
                      Send Verification Code (SMS)
                    </button>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2">
                        <KeyRound className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
                        <input
                          type="text"
                          required
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="Enter 6-digit OTP"
                          className="w-full bg-transparent text-xs text-slate-900 font-mono font-bold tracking-widest focus:outline-none"
                        />
                      </div>
                      <span className="text-[10px] text-emerald-700 block font-medium">
                        ✓ SMS OTP sent to {signInIdentifier}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-sky-950 hover:bg-sky-900 text-amber-400 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4"
              >
                <span>
                  Sign In & Enter {selectedRole === 'rider' ? 'Rider Portal' : selectedRole === 'driver' ? 'Driver Cockpit' : 'Operations Suite'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* ========================================================= */}
          {/* SIGN UP VIEW */}
          {/* ========================================================= */}
          {mode === 'signup' && (
            <form onSubmit={handleCompleteSignUp} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Farai Ndlovu"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="+263 77 ..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-sky-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Operating Hub</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-sky-600 font-medium"
                  >
                    <option value="Harare">Greater Harare</option>
                    <option value="Bulawayo">Bulawayo Metro</option>
                  </select>
                </div>
              </div>

              {selectedRole === 'driver' && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="bg-sky-50 border border-sky-200 rounded-lg p-2.5 text-[11px] text-sky-950 font-medium">
                    🚗 Driver Partner Registration • Vehicle Verification
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Vehicle Model</label>
                      <input
                        type="text"
                        required
                        placeholder="Toyota Passo / Fit"
                        value={vehicleMake}
                        onChange={(e) => setVehicleMake(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Registration Plate</label>
                      <input
                        type="text"
                        required
                        placeholder="AFE-8921"
                        value={vehiclePlate}
                        onChange={(e) => setVehiclePlate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono uppercase text-slate-900 focus:outline-none focus:border-sky-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Vehicle Class</label>
                    <select
                      value={vehicleCategory}
                      onChange={(e) => setVehicleCategory(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                    >
                      <option value="economy">Economy (Passo, Fit, Vitz, March)</option>
                      <option value="comfort">Comfort (Axio, Premio, Sedan)</option>
                      <option value="xl">XL 6-Seater (Wish, Noah, Voxy)</option>
                      <option value="motorbike">Motorbike / Express Courier</option>
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4"
              >
                <span>Complete Registration & Open {selectedRole === 'driver' ? 'Driver Cockpit' : 'Rider App'}</span>
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
