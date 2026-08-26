import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  Lock,
  ShieldCheck,
  Car,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  RotateCw,
  Search,
  ChevronDown,
  User,
  Mail,
  MapPin,
  FileText,
  Radio,
  Server,
  Key,
  Info,
  ExternalLink
} from 'lucide-react';
import { store } from '../../services/store';
import { CoverageCity } from '../../types';
import { RideZWLogo } from '../common/RideZWLogo';
import { requestSmsOtp, verifySmsOtp, OtpResponse } from '../../services/notificationService';

interface CountryDial {
  code: string;
  name: string;
  flag: string;
}

const COUNTRIES: CountryDial[] = [
  { code: '+263', name: 'Zimbabwe', flag: '🇿🇼' },
  { code: '+27', name: 'South Africa', flag: '🇿🇦' },
  { code: '+260', name: 'Zambia', flag: '🇿🇲' },
  { code: '+267', name: 'Botswana', flag: '🇧🇼' },
  { code: '+258', name: 'Mozambique', flag: '🇲🇿' },
  { code: '+264', name: 'Namibia', flag: '🇳🇦' },
  { code: '+254', name: 'Kenya', flag: '🇰🇪' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: '+1', name: 'United States / Canada', flag: '🇺🇸' },
  { code: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: '+971', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: '+86', name: 'China', flag: '🇨🇳' },
  { code: '+91', name: 'India', flag: '🇮🇳' },
];

const VEHICLE_CATEGORIES = [
  { id: 'economy', label: 'Go (Budget / Hatchback)', sub: 'Compact 4-seater' },
  { id: 'comfort', label: 'Comfort (Sedan / AC)', sub: 'Standard 4-seater' },
  { id: 'xl', label: 'XL (6+ Seater SUV / Van)', sub: 'Spacious 6-7 seater' },
  { id: 'motorbike', label: 'Delivery Bike / Express', sub: 'Single courier / express' }
];

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
  const [step, setStep] = useState<'form' | 'otp'>('form');

  // Country Dial State
  const [selectedCountry, setSelectedCountry] = useState<CountryDial>(COUNTRIES[0]);
  const [customCountryCode, setCustomCountryCode] = useState('+263');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  // Form Fields
  const [rawPhone, setRawPhone] = useState('');
  const [adminEmail, setAdminEmail] = useState('seth.bbd@gmail.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Registration Fields
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Harare');
  const [vehicleMake, setVehicleMake] = useState('Toyota Passo');
  const [vehiclePlate, setVehiclePlate] = useState('AFE-8921');
  const [vehicleCategory, setVehicleCategory] = useState<'economy' | 'comfort' | 'xl' | 'motorbike'>('economy');

  // OTP Verification
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastOtpResponse, setLastOtpResponse] = useState<OtpResponse | null>(null);
  const [showTwilioDetails, setShowTwilioDetails] = useState(true);

  // Coverage Cities
  const [coverageCities, setCoverageCities] = useState<CoverageCity[]>(() => store.getState().coverageCities || []);

  useEffect(() => {
    const syncCities = () => {
      const currentCities = store.getState().coverageCities || [];
      setCoverageCities(currentCities);
      if (currentCities.length > 0 && !currentCities.some((c) => c.name.toLowerCase() === city.toLowerCase())) {
        setCity(currentCities[0].name);
      }
    };
    syncCities();
    const unsubscribe = store.subscribe(syncCities);
    return () => unsubscribe();
  }, [city]);

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  const getFullPhone = () => {
    let raw = rawPhone.trim().replace(/[\s\-()]/g, '');
    const dial = customCountryCode.trim().startsWith('+')
      ? customCountryCode.trim()
      : `+${customCountryCode.trim()}`;
    const dialDigits = dial.replace(/\D/g, '');

    // Remove leading pluses or zeros
    raw = raw.replace(/^\++/, '').replace(/^0+/, '');

    // If user typed the country dial code into the input, strip it so it doesn't duplicate (+27 + 27696... -> +27696...)
    if (raw.startsWith(dialDigits)) {
      raw = raw.slice(dialDigits.length).replace(/^0+/, '');
    }
    return `${dial}${raw}`;
  };

  const handleRoleChange = (role: 'rider' | 'driver' | 'admin') => {
    setSelectedRole(role);
    setAuthError('');
    setSuccessMessage(null);
    setStep('form');
    setOtpCode('');
  };

  const handleSelectCountry = (c: CountryDial) => {
    setSelectedCountry(c);
    setCustomCountryCode(c.code);
    setShowCountryDropdown(false);
  };

  // Dispatch OTP SMS
  const handleInitiateSmsAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setSuccessMessage(null);

    const cleanNum = rawPhone.trim();
    if (!cleanNum) {
      setAuthError('Please enter your mobile phone number.');
      return;
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setAuthError('Please enter your full legal name.');
        return;
      }
      if (selectedRole === 'driver') {
        if (!nationalId.trim()) {
          setAuthError('Please enter your National ID number.');
          return;
        }
        if (!vehicleMake.trim()) {
          setAuthError('Please enter your vehicle make and model.');
          return;
        }
        if (!vehiclePlate.trim()) {
          setAuthError('Please enter your vehicle registration plate.');
          return;
        }
      }
    }

    const fullPhone = getFullPhone();
    setIsSubmitting(true);

    try {
      const res = await requestSmsOtp(fullPhone, selectedRole === 'driver' ? 'driver' : 'rider');
      setLastOtpResponse(res);
      if (res.success) {
        setSuccessMessage(`SMS security verification code dispatched to ${res.targetPhone || fullPhone}`);
        setStep('otp');
        setResendCooldown(30);
      } else {
        setAuthError(res.message || res.error || 'Failed to dispatch verification SMS.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Network error dispatching SMS. Please check connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Finalize OTP Verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!otpCode.trim() || otpCode.trim().length < 4) {
      setAuthError('Please enter the 6-digit verification code sent via SMS.');
      return;
    }

    const fullPhone = getFullPhone();
    setIsSubmitting(true);

    try {
      const regDetails = mode === 'signup' ? {
        name: fullName.trim(),
        city,
        nationalId: nationalId.trim().toUpperCase(),
        email: email.trim() || undefined,
        vehicleMake: vehicleMake.trim(),
        vehiclePlate: vehiclePlate.trim().toUpperCase(),
        vehicleCategory
      } : {
        name: fullName.trim() || undefined
      };

      const result = await verifySmsOtp(
        fullPhone,
        otpCode.trim(),
        selectedRole === 'driver' ? 'driver' : 'rider',
        regDetails
      );

      if (!result.success) {
        setAuthError(result.error || 'Invalid verification code. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // If registered or signed in, sync store session
      if (selectedRole === 'driver') {
        if (mode === 'signup') {
          store.registerDriver({
            name: fullName.trim() || result.user?.user_metadata?.name || 'Driver Partner',
            phone: fullPhone,
            nationalId: nationalId.trim() || result.user?.user_metadata?.nationalId || '63-1284920-A63',
            email: email.trim() || result.user?.email || 'driver@ridezw.co.zw',
            city: city || result.user?.user_metadata?.city || 'Harare',
            vehicle: {
              make: vehicleMake.split(' ')[0] || 'Toyota',
              model: vehicleMake.split(' ').slice(1).join(' ') || 'Passo',
              year: 2020,
              color: 'Silver',
              plateNumber: vehiclePlate.trim().toUpperCase(),
              category: vehicleCategory,
              capacity: vehicleCategory === 'xl' ? 6 : vehicleCategory === 'motorbike' ? 1 : 4,
              fitnessCertNumber: 'VID-2026-REG',
              fitnessExpiry: '2027-04-01',
              insuranceNumber: 'OM-2026-PUB',
              insuranceExpiry: '2027-04-01'
            }
          });
        } else {
          store.loginAsDriver(fullPhone);
        }
      } else {
        if (mode === 'signup') {
          store.registerRiderAccount({
            name: fullName.trim() || result.user?.user_metadata?.name || 'RideZW Passenger',
            phone: fullPhone,
            email: email.trim() || result.user?.email || undefined,
            city: city || 'Harare'
          });
        } else {
          store.loginAsRider(fullPhone);
        }
      }

      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setAuthError(err.message || 'Verification failed. Please check your code.');
      setIsSubmitting(false);
    }
  };

  // Admin Password Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmitting(true);

    try {
      store.loginAsAdmin(adminEmail.trim(), adminPassword);
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setAuthError(err.message || 'Invalid administrator credentials.');
      setIsSubmitting(false);
    }
  };

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.includes(countrySearch)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header with Official Brand Identity */}
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
        {selectedRole !== 'admin' && (
          <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
            <button
              onClick={() => {
                setMode('signin');
                setStep('form');
                setAuthError('');
                setSuccessMessage(null);
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
                setStep('form');
                setAuthError('');
                setSuccessMessage(null);
              }}
              className={`flex-1 py-3 text-center transition-colors ${
                mode === 'signup'
                  ? 'bg-white text-sky-950 border-b-2 border-amber-400 font-extrabold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Register Account
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Success Banner */}
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-xl p-3.5 flex items-center gap-3 animate-in fade-in zoom-in-95">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs font-bold">{successMessage}</div>
            </div>
          )}

          {/* Error Banner */}
          {authError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 flex items-center gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Role Selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-tight block mb-1.5">
              Account Type
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleRoleChange('rider')}
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
                onClick={() => handleRoleChange('driver')}
                className={`py-2 px-2 rounded-lg border text-center transition-all ${
                  selectedRole === 'driver'
                    ? 'bg-amber-50 border-amber-600 text-amber-950 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                <Car className="w-3.5 h-3.5 mx-auto mb-0.5 text-amber-700" />
                <span className="text-xs block leading-tight">Driver</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`py-2 px-2 rounded-lg border text-center transition-all ${
                  selectedRole === 'admin'
                    ? 'bg-slate-900 border-slate-900 text-white font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 mx-auto mb-0.5 text-emerald-500" />
                <span className="text-xs block leading-tight">Admin</span>
              </button>
            </div>
          </div>

          {/* ADMIN LOGIN */}
          {selectedRole === 'admin' ? (
            <form onSubmit={handleAdminLogin} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                    placeholder="admin@ridezw.co.zw"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Master Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-10 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Admin Access...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Access Admin Portal</span>
                  </>
                )}
              </button>
            </form>
          ) : step === 'otp' ? (
            /* OTP VERIFICATION STEP */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-900 flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Verification code dispatched via SMS</div>
                  <div className="text-slate-600 mt-0.5">
                    Enter the 6-digit code sent to <span className="font-mono font-bold text-sky-950">{getFullPhone()}</span>
                  </div>
                </div>
              </div>

              {/* Twilio Live Diagnostics Panel */}
              {lastOtpResponse && (
                <div className="border border-slate-200 rounded-xl bg-slate-50/80 p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <Server className="w-3.5 h-3.5 text-sky-600" />
                      <span>Twilio Gateway Status</span>
                    </div>
                    {lastOtpResponse.calledTwilio ? (
                      lastOtpResponse.twilioSid ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Live SMS Sent
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Twilio Error
                        </span>
                      )
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                        <Info className="w-3 h-3" /> Server Keys Missing
                      </span>
                    )}
                  </div>

                  {/* If Twilio was called and succeeded */}
                  {lastOtpResponse.calledTwilio && lastOtpResponse.twilioSid && (
                    <div className="p-2 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-1 text-emerald-950 text-[11px]">
                      <div className="font-mono flex justify-between">
                        <span className="text-slate-500">Twilio SID:</span>
                        <span className="font-bold">{lastOtpResponse.twilioSid}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Dispatch Status:</span>
                        <span className="font-bold uppercase text-emerald-700">{lastOtpResponse.twilioStatus || 'queued'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Sender Number:</span>
                        <span className="font-mono">{lastOtpResponse.twilioFrom || 'Configured Caller'}</span>
                      </div>
                    </div>
                  )}

                  {/* If Twilio was called but Twilio rejected / returned error */}
                  {lastOtpResponse.calledTwilio && (lastOtpResponse.twilioError || lastOtpResponse.rawTwilioError) && (
                    <div className="p-2.5 bg-rose-50/80 border border-rose-200 rounded-lg space-y-1.5 text-rose-950 text-[11px]">
                      <div className="font-bold text-rose-900 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>Twilio API Response:</span>
                      </div>
                      <div className="font-mono bg-white/80 p-1.5 rounded border border-rose-200 text-rose-800 text-[10.5px] leading-tight break-all">
                        {lastOtpResponse.rawTwilioError?.message || lastOtpResponse.twilioError || 'Twilio refused connection'}
                      </div>
                      {lastOtpResponse.rawTwilioError?.twilioErrorCode && (
                        <div className="text-[10px] text-rose-700">
                          Twilio Error Code: <span className="font-bold font-mono">{lastOtpResponse.rawTwilioError.twilioErrorCode}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* If Twilio is not configured in server environment */}
                  {!lastOtpResponse.calledTwilio && (
                    <div className="p-2 bg-amber-50/70 border border-amber-200 rounded-lg space-y-1 text-amber-950 text-[11px]">
                      <div className="text-slate-600 leading-snug">
                        Twilio credentials (<span className="font-mono font-bold text-amber-900">TWILIO_ACCOUNT_SID</span>, <span className="font-mono font-bold text-amber-900">TWILIO_AUTH_TOKEN</span>, <span className="font-mono font-bold text-amber-900">TWILIO_PHONE_NUMBER</span>) are not set in the server environment.
                      </div>
                    </div>
                  )}

                  {/* Quick Auto-Fill for Testing */}
                  {(lastOtpResponse.code || lastOtpResponse.isSimulated) && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 text-[11px]">
                      <span className="text-slate-500 font-medium">Test verification code:</span>
                      <button
                        type="button"
                        onClick={() => setOtpCode(lastOtpResponse.code || '123456')}
                        className="px-2 py-0.5 bg-sky-100 hover:bg-sky-200 text-sky-900 font-mono font-bold rounded flex items-center gap-1 transition-colors"
                      >
                        <Key className="w-3 h-3 text-sky-700" />
                        <span>Auto-fill {lastOtpResponse.code || '123456'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  autoFocus
                  required
                  className="w-full py-3 px-4 text-center tracking-[0.4em] font-mono text-xl font-bold bg-white border-2 border-sky-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sky-950"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || otpCode.length < 4}
                className="w-full py-3 px-4 bg-sky-950 hover:bg-[#0d3a54] text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Security Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Verify & Continue</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="text-slate-500 hover:text-slate-800 font-semibold"
                >
                  ← Change Details
                </button>

                <button
                  type="button"
                  disabled={resendCooldown > 0 || isSubmitting}
                  onClick={handleInitiateSmsAuth}
                  className="text-sky-700 hover:text-sky-900 font-bold disabled:text-slate-400 flex items-center gap-1"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? 'animate-spin' : ''}`} />
                  <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend SMS Code'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* PHONE / REGISTRATION FORM STEP */
            <form onSubmit={handleInitiateSmsAuth} className="space-y-3.5">
              {/* Registration Extra Fields */}
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Full Legal Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                        placeholder="e.g. Tinashe Moyo"
                      />
                    </div>
                  </div>

                  {selectedRole === 'driver' && (
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        National ID Number
                      </label>
                      <div className="relative">
                        <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={nationalId}
                          onChange={(e) => setNationalId(e.target.value)}
                          required
                          className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                          placeholder="63-1284920-A63"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Operating City
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium appearance-none"
                      >
                        {coverageCities.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name} ({c.province})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                        placeholder="tinashe@example.com"
                      />
                    </div>
                  </div>

                  {selectedRole === 'driver' && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <div className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-amber-600" />
                        <span>Vehicle Details</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 block mb-1">
                            Make & Model
                          </label>
                          <input
                            type="text"
                            value={vehicleMake}
                            onChange={(e) => setVehicleMake(e.target.value)}
                            required
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium"
                            placeholder="Toyota Passo"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-600 block mb-1">
                            Number Plate
                          </label>
                          <input
                            type="text"
                            value={vehiclePlate}
                            onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                            required
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono font-bold uppercase"
                            placeholder="AFE-8921"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">
                          Ride Tier Category
                        </label>
                        <select
                          value={vehicleCategory}
                          onChange={(e) => setVehicleCategory(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium"
                        >
                          {VEHICLE_CATEGORIES.map(v => (
                            <option key={v.id} value={v.id}>
                              {v.label} - {v.sub}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Mobile Phone Input with International Country Dial Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Mobile Phone Number
                </label>
                <div className="flex gap-2">
                  {/* Country Selector Button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className="h-10 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg flex items-center gap-1.5 text-xs font-bold text-slate-800 transition-colors"
                    >
                      <span>{selectedCountry.flag}</span>
                      <span>{customCountryCode}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {/* Country Dropdown Menu */}
                    {showCountryDropdown && (
                      <div className="absolute left-0 top-full mt-1 w-64 max-h-60 bg-white border border-slate-300 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col">
                        <div className="p-2 border-b border-slate-100 bg-slate-50">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={countrySearch}
                              onChange={(e) => setCountrySearch(e.target.value)}
                              placeholder="Search country or code..."
                              className="w-full pl-8 pr-2 py-1 text-xs bg-white border border-slate-200 rounded-md focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="overflow-y-auto flex-1 divide-y divide-slate-50">
                          {filteredCountries.map((c) => (
                            <button
                              key={c.code + c.name}
                              type="button"
                              onClick={() => handleSelectCountry(c)}
                              className="w-full px-3 py-2 text-left hover:bg-sky-50 flex items-center justify-between text-xs transition-colors"
                            >
                              <span className="flex items-center gap-2">
                                <span>{c.flag}</span>
                                <span className="font-medium text-slate-800">{c.name}</span>
                              </span>
                              <span className="font-mono font-bold text-sky-950">{c.code}</span>
                            </button>
                          ))}
                        </div>

                        {/* Custom Code Input Footer */}
                        <div className="p-2 border-t border-slate-100 bg-slate-50 flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 whitespace-nowrap">Custom:</span>
                          <input
                            type="text"
                            value={customCountryCode}
                            onChange={(e) => setCustomCountryCode(e.target.value)}
                            placeholder="+263"
                            className="w-full px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Raw Phone Number Input */}
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={rawPhone}
                      onChange={(e) => setRawPhone(e.target.value)}
                      required
                      placeholder="77 123 4567"
                      className="w-full pl-9 pr-3 h-10 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono font-medium"
                    />
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>Standard SMS carrier delivery rates apply</span>
                  <span className="font-mono font-bold text-sky-950">Target: {getFullPhone()}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting || !rawPhone.trim()}
                className="w-full py-3 px-4 bg-sky-950 hover:bg-[#0d3a54] text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Dispatching SMS Code...</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'signup' ? 'Continue to SMS Verification' : 'Send SMS Verification Code'}</span>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
