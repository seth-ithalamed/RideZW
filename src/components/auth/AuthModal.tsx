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
  KeyRound,
  Loader2,
  RotateCw,
  Edit3,
  MessageSquare,
  Sparkles,
  Radio,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Terminal,
  Send,
  Settings,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { store } from '../../services/store';
import { CoverageCity } from '../../types';
import { RideZWLogo } from '../common/RideZWLogo';
import {
  requestSmsOtp,
  verifySmsOtp,
  OtpResponse,
  fetchTwilioStatus,
  updateServerTwilioConfig,
  sendDirectTestSms
} from '../../services/notificationService';

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
  const [signInIdentifier, setSignInIdentifier] = useState(
    initialRole === 'admin' ? 'seth.bbd@gmail.com' : '+263 77 123 4567'
  );
  const [signInPassword, setSignInPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpDetails, setOtpDetails] = useState<OtpResponse | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Twilio Gateway Live Diagnostics & Raw API State
  const [showTwilioInspector, setShowTwilioInspector] = useState(false);
  const [showTwilioSettings, setShowTwilioSettings] = useState(false);
  const [twilioStatusInfo, setTwilioStatusInfo] = useState<{
    isConfigured: boolean;
    accountSidMasked: string | null;
    hasAuthToken: boolean;
    fromNumber: string | null;
    source: string;
  } | null>(null);
  const [customAccountSid, setCustomAccountSid] = useState('');
  const [customAuthToken, setCustomAuthToken] = useState('');
  const [customFromNumber, setCustomFromNumber] = useState('');
  const [isSavingTwilio, setIsSavingTwilio] = useState(false);
  const [isTestingTwilio, setIsTestingTwilio] = useState(false);
  const [twilioConfigSuccess, setTwilioConfigSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchTwilioStatus().then(setTwilioStatusInfo);
    }
  }, [isOpen]);

  const handleSaveTwilioConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingTwilio(true);
    setTwilioConfigSuccess(null);
    try {
      const updated = await fetchTwilioStatus();
      setTwilioStatusInfo(updated);
      setTwilioConfigSuccess('Twilio is managed by backend environment configuration.');
      const updated = await fetchTwilioStatus();
      setTwilioStatusInfo(updated);
      setTimeout(() => setTwilioConfigSuccess(null), 3000);
    } catch (e: any) {
      setAuthError(e.message || 'Failed to update Twilio credentials');
    } finally {
      setIsSavingTwilio(false);
    }
  };

  const handleSendDirectTest = async () => {
    if (!signInIdentifier.trim()) {
      setAuthError('Please enter a target phone number.');
      return;
    }
    setIsTestingTwilio(true);
    setAuthError('');
    try {
      const res = await sendDirectTestSms({
        phone: signInIdentifier.trim(),
        message: `RideZW Twilio Test Message sent at ${new Date().toLocaleTimeString()}`,
      });

      if (res.success) {
        setSuccessMessage(`Twilio real test SMS sent! SID: ${res.rawTwilioResponse?.sid}`);
        setOtpDetails((prev) => ({
          success: true,
          message: 'Direct test SMS dispatched',
          calledTwilio: true,
          isSimulated: false,
          twilioSid: res.rawTwilioResponse?.sid,
          twilioStatus: res.rawTwilioResponse?.status,
          targetPhone: signInIdentifier.trim(),
          rawTwilioResponse: res.rawTwilioResponse,
          code: prev?.code || '123456',
          dispatchedMessage: res.rawTwilioResponse?.body || 'Test SMS dispatched'
        }));
      } else {
        setAuthError(res.rawTwilioError?.message || res.error || 'Twilio test SMS failed');
        setOtpDetails((prev) => ({
          success: false,
          message: 'Twilio test SMS call failed',
          calledTwilio: true,
          isSimulated: false,
          twilioError: res.rawTwilioError?.message,
          rawTwilioError: res.rawTwilioError,
          targetPhone: signInIdentifier.trim(),
          code: prev?.code || '123456'
        }));
      }
    } catch (e: any) {
      setAuthError(e.message || 'Test SMS dispatch failed');
    } finally {
      setIsTestingTwilio(false);
    }
  };

  // Coverage Cities dynamically from Database / Store
  const [coverageCities, setCoverageCities] = useState<CoverageCity[]>(() => store.getState().coverageCities || []);

  // Sign Up States
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('+263 77 ');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState<string>('Harare');
  const [vehicleMake, setVehicleMake] = useState('Toyota Passo');
  const [vehiclePlate, setVehiclePlate] = useState('AFE-8921');
  const [vehicleCategory, setVehicleCategory] = useState<'economy' | 'comfort' | 'xl' | 'motorbike'>('economy');

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

  if (!isOpen) return null;

  const handleRoleChange = (role: 'rider' | 'driver' | 'admin') => {
    setSelectedRole(role);
    setAuthError('');
    setSuccessMessage(null);
    setSignInPassword('');
    setOtpCode('');
    setOtpSent(false);
    setOtpDetails(null);
    if (role === 'admin') {
      setSignInIdentifier('seth.bbd@gmail.com');
    } else {
      setSignInIdentifier('+263 77 123 4567');
    }
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!signInIdentifier.trim()) {
      setAuthError('Please enter your mobile phone number.');
      return;
    }
    setOtpLoading(true);
    setAuthError('');
    setSuccessMessage(null);
    try {
      const roleParam = selectedRole === 'driver' ? 'driver' : 'rider';
      const res = await requestSmsOtp(
        signInIdentifier.trim(),
        roleParam,
        customAccountSid ? {
          accountSid: customAccountSid.trim(),
          authToken: customAuthToken.trim(),
          fromNumber: customFromNumber.trim()
        } : undefined
      );
      setOtpDetails(res);
      setOtpSent(true);
      
      const dbStatusText = res.userFoundInDb 
        ? `• DB Profile: ${res.registeredName || 'Registered'} (${res.dbAccountType || roleParam})`
        : `• DB Profile: New ${roleParam}`;

      if (res.calledTwilio && res.twilioSid) {
        setSuccessMessage(`Twilio API invoked successfully! SMS queued (SID: ${res.twilioSid}). ${dbStatusText}`);
      } else if (res.calledTwilio && res.twilioError) {
        setAuthError(`Twilio API responded with error: ${res.twilioError}`);
      } else if (!res.calledTwilio) {
        setSuccessMessage(`OTP Generated for verification. Note: Twilio API was NOT called because credentials are not set on server. ${dbStatusText}`);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Failed to connect to SMS service.');
      setOtpSent(true);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setSuccessMessage(null);

    // If Rider or Driver and OTP has not been requested yet
    if (selectedRole !== 'admin' && !otpSent) {
      handleSendOtp(e);
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Staff Admin Sign In (Email + Password)
      if (selectedRole === 'admin') {
        if (!signInIdentifier.trim()) {
          setAuthError('Please enter your corporate administrator email.');
          setIsSubmitting(false);
          return;
        }
        if (!signInPassword.trim()) {
          setAuthError('Please enter your administrator password.');
          setIsSubmitting(false);
          return;
        }
        const adminAuth = await fetch('/api/auth/admin-login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: signInIdentifier.trim(), password: signInPassword }) });
        if (!adminAuth.ok) { const detail = await adminAuth.json().catch(() => ({})); throw new Error(detail.error || 'Invalid administrator credentials'); }
        store.loginAsAdmin(signInIdentifier, signInPassword);
        setIsSubmitting(false);
        onClose();
        return;
      }

      // 2. Rider or Driver Sign In (Pure Phone OTP)
      if (!otpCode.trim()) {
        setAuthError('Please enter the 6-digit verification code sent to your phone.');
        setIsSubmitting(false);
        return;
      }

      const roleParam = selectedRole === 'driver' ? 'driver' : 'rider';
      const verifyRes = await verifySmsOtp(signInIdentifier.trim(), otpCode.trim(), roleParam);
      if (!verifyRes.success) {
        setAuthError(verifyRes.error || 'Invalid verification code. Please check your SMS and try again.');
        setIsSubmitting(false);
        return;
      }

      if (selectedRole === 'driver') {
        store.loginAsDriver(signInIdentifier.trim());
      } else {
        store.loginAsRider(signInIdentifier.trim());
      }

      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please check credentials.');
      setIsSubmitting(false);
    }
  };

  const handleCompleteSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmitting(true);

    try {
      if (selectedRole === 'driver') {
        if (!fullName.trim() || !phone.trim() || !vehiclePlate.trim()) {
          setAuthError('Please fill out all driver & vehicle details.');
          setIsSubmitting(false);
          return;
        }

        store.registerDriver({
          name: fullName.trim(),
          phone: phone.trim(),
          nationalId: nationalId.trim() || '63-1284920-A63',
          email: email.trim() || 'driver@ridezw.co.zw',
          city,
          vehicle: {
            make: vehicleMake.split(' ')[0] || 'Toyota',
            model: vehicleMake.split(' ').slice(1).join(' ') || 'Vitz',
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
        setIsSubmitting(false);
        onClose();
      } else {
        if (!fullName.trim() || !phone.trim()) {
          setAuthError('Please enter your name and phone number.');
          setIsSubmitting(false);
          return;
        }

        store.registerRiderAccount({
          name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          city: 'Nationwide'
        });
        setIsSubmitting(false);
        onClose();
      }
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed.');
      setIsSubmitting(false);
    }
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
              setAuthError('');
              setSuccessMessage(null);
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

          {/* Account Category Selector */}
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
                    ? 'bg-sky-50 border-sky-600 text-sky-950 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                <Car className="w-3.5 h-3.5 mx-auto mb-0.5 text-emerald-600" />
                <span className="text-xs block leading-tight">Driver</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
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
              {/* STAFF ADMIN: Corporate Email + Security Password */}
              {selectedRole === 'admin' ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-tight block mb-1">
                      Corporate Email / Super-Admin ID
                    </label>
                    <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus-within:ring-2 focus-within:ring-sky-800 focus-within:border-sky-800">
                      <KeyRound className="w-4 h-4 text-amber-600 mr-2 shrink-0" />
                      <input
                        type="email"
                        required
                        value={signInIdentifier}
                        onChange={(e) => setSignInIdentifier(e.target.value)}
                        placeholder="seth.bbd@gmail.com"
                        className="w-full bg-transparent text-xs text-slate-900 font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-tight block mb-1">
                      Administrator Security Password
                    </label>
                    <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus-within:ring-2 focus-within:ring-sky-800 focus-within:border-sky-800">
                      <Lock className="w-4 h-4 text-amber-600 mr-2 shrink-0" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        placeholder="Enter administrator password"
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

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-sky-700 mt-0.5 shrink-0" />
                    <div className="text-[11px] leading-relaxed">
                      <p className="font-bold text-slate-900">Single-Instance Session Enforcement</p>
                      <p className="text-slate-600 mt-0.5">
                        Signing in establishes an exclusive session token. Any active session on another device will be terminated automatically. Database seeding runs upon verification.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* RIDER & DRIVER: Pure Phone + SMS OTP Flow */
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">
                        Mobile Phone Number
                      </label>
                      {otpSent && (
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setOtpCode('');
                            setSuccessMessage(null);
                          }}
                          className="text-[10px] text-sky-800 font-bold hover:underline flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Change Number</span>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus-within:ring-2 focus-within:ring-sky-800 focus-within:border-sky-800">
                      <Phone className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                      <input
                        type="tel"
                        required
                        disabled={otpSent}
                        value={signInIdentifier}
                        onChange={(e) => setSignInIdentifier(e.target.value)}
                        placeholder="+263 77 123 4567"
                        className={`w-full bg-transparent text-xs text-slate-900 font-mono focus:outline-none ${
                          otpSent ? 'opacity-70' : ''
                        }`}
                      />
                    </div>

                    {/* Pre-Send Twilio Gateway Status & Config Trigger */}
                    {!otpSent && (
                      <div className="mt-1.5 flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <span className={`w-2 h-2 rounded-full ${twilioStatusInfo?.isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                          <span>
                            {twilioStatusInfo?.isConfigured
                              ? `Twilio Gateway Ready (${twilioStatusInfo.accountSidMasked})`
                              : 'Twilio Keys: Not Set on Server'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowTwilioSettings(!showTwilioSettings)}
                          className="text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1"
                        >
                          <Settings className="w-2.5 h-2.5" />
                          <span>{showTwilioSettings ? 'Close Config' : 'Twilio Settings'}</span>
                        </button>
                      </div>
                    )}

                    {/* Twilio Settings Drawer when not sent */}
                    {!otpSent && showTwilioSettings && (
                      <form onSubmit={handleSaveTwilioConfig} className="mt-2 bg-slate-900 text-slate-100 rounded-lg p-3 border border-slate-700 space-y-2 text-xs animate-in fade-in">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                          <span className="font-bold text-amber-300">Live Twilio Gateway Credentials</span>
                          <span className="text-[10px] text-slate-400">Runtime Process</span>
                        </div>

                        {twilioConfigSuccess && (
                          <div className="p-2 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded text-[11px]">
                            {twilioConfigSuccess}
                          </div>
                        )}

                        <div>
                          <label className="block text-[10px] text-slate-400 font-mono uppercase mb-0.5">Account SID</label>
                          <input
                            type="text"
                            value={customAccountSid}
                            onChange={(e) => setCustomAccountSid(e.target.value)}
                            placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-[11px]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 font-mono uppercase mb-0.5">Auth Token</label>
                          <input
                            type="password"
                            value={customAuthToken}
                            onChange={(e) => setCustomAuthToken(e.target.value)}
                            placeholder="••••••••••••••••••••••••••••••••"
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-[11px]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 font-mono uppercase mb-0.5">Twilio Phone Number / Messaging SID</label>
                          <input
                            type="text"
                            value={customFromNumber}
                            onChange={(e) => setCustomFromNumber(e.target.value)}
                            placeholder="+14244868730 or MGxxxxxxxxxxxx"
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-[11px]"
                          />
                        </div>

                        <div className="pt-2 flex items-center gap-2">
                          <button
                            type="submit"
                            disabled={isSavingTwilio}
                            className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold py-1.5 px-3 rounded text-[11px] transition-colors"
                          >
                            {isSavingTwilio ? 'Saving...' : 'Apply Credentials'}
                          </button>
                          <button
                            type="button"
                            onClick={handleSendDirectTest}
                            disabled={isTestingTwilio}
                            className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-1.5 px-3 rounded text-[11px] transition-colors flex items-center justify-center gap-1"
                          >
                            {isTestingTwilio ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Send className="w-3 h-3" />
                            )}
                            <span>Test Live SMS</span>
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* OTP Code Entry Section (Appears after code is sent) */}
                  {otpSent && (
                    <div className="space-y-3 pt-1 animate-in fade-in slide-in-from-top-2">
                      {/* Live Backend Message Payload & Twilio Gateway Inspector */}
                      <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 shadow-md">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Twilio Gateway & SMS Dispatch</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {otpDetails?.userFoundInDb ? (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-700">
                                DB: {otpDetails.registeredName || 'Verified'}
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-sky-950 text-sky-300 border border-sky-700">
                                DB: New {selectedRole}
                              </span>
                            )}
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                              otpDetails?.calledTwilio && otpDetails?.twilioSid 
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' 
                                : otpDetails?.calledTwilio && (otpDetails?.rawTwilioError || otpDetails?.twilioError)
                                ? 'bg-rose-950 text-rose-300 border border-rose-700'
                                : 'bg-amber-950 text-amber-300 border border-amber-700'
                            }`}>
                              {otpDetails?.calledTwilio && otpDetails?.twilioSid 
                                ? `Twilio: ${otpDetails.twilioStatus || 'sent'}` 
                                : otpDetails?.calledTwilio && (otpDetails?.rawTwilioError || otpDetails?.twilioError)
                                ? 'Twilio: Rejected / Error' 
                                : 'Twilio: Not Configured'}
                            </span>
                          </div>
                        </div>

                        {/* Exact Message Sent */}
                        <div className="bg-slate-950/80 rounded-lg p-2.5 border border-slate-800 font-mono text-[11px] text-slate-300 leading-relaxed">
                          <div className="text-[10px] text-slate-400 font-sans uppercase font-bold tracking-tight mb-1.5 flex items-center justify-between">
                            <span>To: {otpDetails?.targetPhone || signInIdentifier}</span>
                            {otpDetails?.twilioSid && (
                              <span className="text-[9px] text-emerald-400 font-mono">SID: {otpDetails.twilioSid.slice(0, 14)}...</span>
                            )}
                          </div>
                          <p className="text-amber-300 font-sans bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 text-xs">
                            "{otpDetails?.dispatchedMessage || `Your RideZW security verification code is: ${otpDetails?.code}. Valid for 5 minutes. Do not share this code with anyone.`}"
                          </p>
                        </div>

                        {/* Raw Twilio Response & Inspector Toggle */}
                        <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                          <button
                            type="button"
                            onClick={() => setShowTwilioInspector(!showTwilioInspector)}
                            className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold transition-colors"
                          >
                            <Terminal className="w-3 h-3" />
                            <span>{showTwilioInspector ? 'Hide Twilio Raw JSON' : 'Inspect Twilio Raw API Response'}</span>
                            {showTwilioInspector ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowTwilioSettings(!showTwilioSettings)}
                            className="text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                          >
                            <Settings className="w-3 h-3" />
                            <span>Gateway Config</span>
                          </button>
                        </div>

                        {/* Raw Twilio Payload & Response Box */}
                        {showTwilioInspector && (
                          <div className="mt-2.5 bg-black/90 rounded-lg p-2.5 border border-slate-800 font-mono text-[10px] space-y-2 text-slate-300 animate-in fade-in">
                            <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800">
                              <span className="font-bold uppercase text-[9px] text-slate-400">Twilio Telemetry & Raw Payload</span>
                              <span className="text-[9px]">
                                {otpDetails?.calledTwilio ? (
                                  <span className="text-emerald-400">API Call Executed</span>
                                ) : (
                                  <span className="text-amber-400">API Call Skipped (No Server Keys)</span>
                                )}
                              </span>
                            </div>

                            {/* Raw Twilio Response (if returned) */}
                            {otpDetails?.rawTwilioResponse && (
                              <div>
                                <p className="text-emerald-400 font-bold mb-1">Twilio API 200/201 Response:</p>
                                <pre className="bg-slate-950 p-2 rounded border border-emerald-900/50 text-emerald-300 overflow-x-auto text-[10px] leading-tight">
                                  {JSON.stringify(otpDetails.rawTwilioResponse, null, 2)}
                                </pre>
                              </div>
                            )}

                            {/* Raw Twilio Error (if returned) */}
                            {otpDetails?.rawTwilioError && (
                              <div>
                                <p className="text-rose-400 font-bold mb-1">Twilio API Error Response:</p>
                                <pre className="bg-slate-950 p-2 rounded border border-rose-900/50 text-rose-300 overflow-x-auto text-[10px] leading-tight">
                                  {JSON.stringify(otpDetails.rawTwilioError, null, 2)}
                                </pre>
                                {otpDetails.rawTwilioError.moreInfo && (
                                  <a 
                                    href={otpDetails.rawTwilioError.moreInfo} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-[10px] text-sky-400 hover:underline flex items-center gap-1 mt-1"
                                  >
                                    <span>Twilio Docs for Error {otpDetails.rawTwilioError.twilioErrorCode}</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>
                            )}

                            {/* Request sent to Twilio */}
                            {otpDetails?.twilioRequestPayload && (
                              <div>
                                <p className="text-slate-400 font-bold mb-1">Request Dispatched To Twilio:</p>
                                <pre className="bg-slate-950 p-2 rounded border border-slate-800 text-slate-300 overflow-x-auto text-[10px] leading-tight">
                                  {JSON.stringify(otpDetails.twilioRequestPayload, null, 2)}
                                </pre>
                              </div>
                            )}

                            {/* Reason if Twilio was not called */}
                            {!otpDetails?.calledTwilio && (
                              <div className="bg-amber-950/40 p-2 rounded border border-amber-800/60 text-amber-200">
                                <p className="font-bold">Why was Twilio not called?</p>
                                <p className="mt-0.5 text-[10px] leading-normal">
                                  {otpDetails?.message || 'Server environment variables TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are not configured in this container runtime.'}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Twilio Gateway Settings & Direct Test Dispatch */}
                        {showTwilioSettings && (
                          <form onSubmit={handleSaveTwilioConfig} className="mt-2.5 bg-slate-950 rounded-lg p-3 border border-slate-800 space-y-2 text-xs animate-in fade-in">
                            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                              <span className="font-bold text-amber-300">Live Twilio Gateway Credentials</span>
                              <span className="text-[10px] text-slate-400">Runtime Config</span>
                            </div>

                            {twilioConfigSuccess && (
                              <div className="p-2 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded text-[11px]">
                                {twilioConfigSuccess}
                              </div>
                            )}

                            <div>
                              <label className="block text-[10px] text-slate-400 font-mono uppercase mb-0.5">Account SID</label>
                              <input
                                type="text"
                                value={customAccountSid}
                                onChange={(e) => setCustomAccountSid(e.target.value)}
                                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-[11px]"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-400 font-mono uppercase mb-0.5">Auth Token</label>
                              <input
                                type="password"
                                value={customAuthToken}
                                onChange={(e) => setCustomAuthToken(e.target.value)}
                                placeholder="••••••••••••••••••••••••••••••••"
                                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-[11px]"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-400 font-mono uppercase mb-0.5">Twilio Phone Number / Messaging SID</label>
                              <input
                                type="text"
                                value={customFromNumber}
                                onChange={(e) => setCustomFromNumber(e.target.value)}
                                placeholder="+14244868730 or MGxxxxxxxxxxxx"
                                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-[11px]"
                              />
                            </div>

                            <div className="pt-2 flex items-center gap-2">
                              <button
                                type="submit"
                                disabled={isSavingTwilio}
                                className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold py-1.5 px-3 rounded text-[11px] transition-colors"
                              >
                                {isSavingTwilio ? 'Saving...' : 'Apply Credentials'}
                              </button>
                              <button
                                type="button"
                                onClick={handleSendDirectTest}
                                disabled={isTestingTwilio}
                                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-1.5 px-3 rounded text-[11px] transition-colors flex items-center justify-center gap-1"
                              >
                                {isTestingTwilio ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Send className="w-3 h-3" />
                                )}
                                <span>Test Live SMS</span>
                              </button>
                            </div>
                          </form>
                        )}

                        {/* Dynamic Code Action */}
                        {otpDetails?.code && (
                          <div className="mt-2.5 flex items-center justify-between bg-amber-400/10 border border-amber-400/30 rounded-lg p-2.5">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                              <div>
                                <span className="text-[11px] text-amber-200 block">Session Code:</span>
                                <span className="font-mono text-white text-sm font-bold bg-slate-950 px-2 py-0.5 rounded border border-amber-400/60 tracking-wider">
                                  {otpDetails.code}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setOtpCode(otpDetails.code || '');
                                setCopiedCode(true);
                                setTimeout(() => setCopiedCode(false), 2000);
                              }}
                              className="text-[11px] bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                            >
                              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-950" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedCode ? 'Auto-Filled!' : 'Auto-Fill Code'}</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">
                          6-Digit SMS Verification Code
                        </label>
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={otpLoading}
                          className="text-[10px] text-sky-800 font-bold hover:underline flex items-center gap-1"
                        >
                          <RotateCw className={`w-2.5 h-2.5 ${otpLoading ? 'animate-spin' : ''}`} />
                          <span>Resend SMS</span>
                        </button>
                      </div>

                      <div className="flex items-center bg-slate-50 border-2 border-sky-600 rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-sky-800">
                        <KeyRound className="w-4 h-4 text-sky-700 mr-2 shrink-0" />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          autoFocus
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="••••••"
                          className="w-full bg-transparent text-base text-slate-900 font-mono font-bold tracking-widest text-center focus:outline-none"
                        />
                      </div>

                      <p className="text-[10px] text-slate-500 text-center">
                        Enter the 6-digit code sent via SMS. <span className="text-sky-800 font-semibold">(Master code 123456 is also valid)</span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              <button
                type="submit"
                disabled={isSubmitting || otpLoading}
                className="w-full py-3 rounded-xl bg-sky-950 hover:bg-sky-900 text-amber-400 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                {isSubmitting || otpLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : !otpSent && selectedRole !== 'admin' ? (
                  <>
                    <span>Send Verification Code (SMS)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>
                      Verify & Enter {selectedRole === 'rider' ? 'Rider Portal' : selectedRole === 'driver' ? 'Driver Cockpit' : 'Operations Suite'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================= */}
          {/* SIGN UP VIEW */}
          {/* ========================================================= */}
          {mode === 'signup' && (
            <>
              {selectedRole === 'admin' ? (
                /* Admin Cannot Self-Register Notice */
                <div className="space-y-3 text-xs">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-amber-900 font-bold">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <span>Admin Self-Registration is Disabled</span>
                    </div>
                    <p className="text-amber-800 leading-relaxed text-[11px]">
                      Administrative and operational accounts cannot self-register. All dispatch officers, auditors, and staff must be provisioned directly by a Super Admin.
                    </p>
                    <p className="text-slate-700 text-[11px]">
                      If you are the Root Super Admin (<strong>seth.bbd@gmail.com</strong>), please switch to the <strong>Sign In</strong> tab to access your executive dashboard.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setSelectedRole('admin');
                      setSignInIdentifier('seth.bbd@gmail.com');
                      setSignInPassword('');
                    }}
                    className="w-full py-2.5 rounded-lg bg-sky-950 hover:bg-sky-900 text-amber-400 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                  >
                    <span>Switch to Super Admin Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
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

                  {selectedRole === 'rider' ? (
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Mobile Phone (EcoCash / NetOne)</label>
                      <input
                        type="tel"
                        required
                        placeholder="+263 77 ..."
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-sky-600"
                      />
                    </div>
                  ) : (
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
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-sky-600 font-medium"
                        >
                          {coverageCities.length > 0 ? (
                            coverageCities.map((hub) => (
                              <option key={hub.id} value={hub.name}>
                                {hub.name} {hub.province ? `(${hub.province})` : ''} {hub.isPrimaryHub ? '★' : ''}
                              </option>
                            ))
                          ) : (
                            <>
                              <option value="Harare">Harare (Harare Metropolitan)</option>
                              <option value="Bulawayo">Bulawayo (Bulawayo Metropolitan)</option>
                              <option value="Victoria Falls">Victoria Falls (Matabeleland North)</option>
                              <option value="Mutare">Mutare (Manicaland)</option>
                              <option value="Gweru">Gweru (Midlands)</option>
                              <option value="Masvingo">Masvingo (Masvingo)</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>
                  )}

                  {selectedRole === 'driver' && (
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">National ID Number</label>
                        <input
                          type="text"
                          required
                          placeholder="63-1284920-A63"
                          value={nationalId}
                          onChange={(e) => setNationalId(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-sky-600 uppercase"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Vehicle Make & Model</label>
                          <input
                            type="text"
                            required
                            placeholder="Toyota Passo"
                            value={vehicleMake}
                            onChange={(e) => setVehicleMake(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Number Plate</label>
                          <input
                            type="text"
                            required
                            placeholder="AFE-8921"
                            value={vehiclePlate}
                            onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-sky-600 uppercase"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Vehicle Category</label>
                        <select
                          value={vehicleCategory}
                          onChange={(e) => setVehicleCategory(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                        >
                          <option value="economy">Go (Budget / Hatchback)</option>
                          <option value="comfort">Comfort (Sedan / AC)</option>
                          <option value="xl">XL (6+ Seater SUV / Van)</option>
                          <option value="motorbike">Delivery Bike / Express</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-sky-950 hover:bg-sky-900 text-amber-400 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>{selectedRole === 'driver' ? 'Register Driver Account' : 'Create Rider Account'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
