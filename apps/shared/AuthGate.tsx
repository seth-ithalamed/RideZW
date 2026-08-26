import { useEffect, useState, useRef } from 'react';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { ridezwApi } from './api';

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

const OPERATING_CITIES = [
  'Harare',
  'Bulawayo',
  'Chitungwiza',
  'Victoria Falls',
  'Mutare',
  'Gweru',
  'Masvingo',
  'Kwekwe',
  'Kadoma',
  'Hwange'
];

const VEHICLE_CATEGORIES = [
  { id: 'economy', label: 'Go (Budget / Hatchback)', sub: 'Compact 4-seater' },
  { id: 'comfort', label: 'Comfort (Sedan / AC)', sub: 'Standard 4-seater' },
  { id: 'xl', label: 'XL (6+ Seater SUV / Van)', sub: 'Spacious 6-7 seater' },
  { id: 'motorbike', label: 'Delivery Bike / Express', sub: 'Single courier / express' }
];

export function AuthGate({ role, children }: { role: 'rider' | 'driver'; children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Mode: Sign In vs Create Account
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  // Step: Form input vs OTP verification
  const [step, setStep] = useState<'form' | 'otp'>('form');

  // Country Code State
  const [selectedCountry, setSelectedCountry] = useState<CountryDial>(COUNTRIES[0]);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [customCountryCode, setCustomCountryCode] = useState('+263');
  const [countrySearch, setCountrySearch] = useState('');

  // Form Inputs
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Harare');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleCategory, setVehicleCategory] = useState<'economy' | 'comfort' | 'xl' | 'motorbike'>('economy');

  // OTP Verification
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<any>(null);

  // Check existing session on mount
  useEffect(() => {
    ridezwApi.me()
      .then(u => {
        if (u) setUser(u);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      cooldownRef.current = setTimeout(() => {
        setResendCooldown(c => c - 1);
      }, 1000);
    }
    return () => {
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
    };
  }, [resendCooldown]);

  const getFullPhone = () => {
    const dial = customCountryCode.trim().startsWith('+')
      ? customCountryCode.trim()
      : `+${customCountryCode.trim()}`;
    const cleanNum = phoneNumber.trim().replace(/^0+/, '');
    return `${dial}${cleanNum}`;
  };

  const handleSelectCountry = (country: CountryDial) => {
    setSelectedCountry(country);
    setCustomCountryCode(country.code);
    setShowCountryModal(false);
  };

  const handleInitiateAuth = async () => {
    const cleanNum = phoneNumber.trim();
    if (!cleanNum) {
      setError('Please enter your mobile phone number.');
      return;
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setError('Please enter your full legal name.');
        return;
      }
      if (role === 'driver') {
        if (!nationalId.trim()) {
          setError('Please enter your National ID number.');
          return;
        }
        if (!vehicleMake.trim()) {
          setError('Please enter your vehicle make and model.');
          return;
        }
        if (!vehiclePlate.trim()) {
          setError('Please enter your vehicle registration plate.');
          return;
        }
      }
    }

    const fullPhone = getFullPhone();
    setSubmitting(true);
    setError('');
    setInfoMessage('');

    try {
      const res = await ridezwApi.sendOtp(fullPhone, role);
      setInfoMessage(`SMS verification code dispatched to ${res.targetPhone || fullPhone}`);
      setStep('otp');
      setResendCooldown(30);
    } catch (e: any) {
      setError(e.message || 'Failed to dispatch verification SMS. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim() || otpCode.trim().length < 4) {
      setError('Please enter the 6-digit verification code sent via SMS.');
      return;
    }

    const fullPhone = getFullPhone();
    setSubmitting(true);
    setError('');

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

      const authenticatedUser = await ridezwApi.verifyOtp(
        fullPhone,
        otpCode.trim(),
        role,
        regDetails
      );

      if (authenticatedUser?.user_metadata?.role && authenticatedUser.user_metadata.role !== role) {
        throw new Error(`This account is registered as a ${authenticatedUser.user_metadata.role}. Please use the ${authenticatedUser.user_metadata.role} app.`);
      }

      setUser(authenticatedUser);
    } catch (e: any) {
      setError(e.message || 'Invalid verification code. Please check your SMS and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    const fullPhone = getFullPhone();
    setSubmitting(true);
    setError('');
    try {
      const res = await ridezwApi.sendOtp(fullPhone, role);
      setInfoMessage(`New verification SMS dispatched to ${res.targetPhone || fullPhone}`);
      setResendCooldown(30);
    } catch (e: any) {
      setError(e.message || 'Could not resend SMS. Please try again in a few moments.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={s.splashLoading}>
        <ActivityIndicator size="large" color="#0e7490" />
        <Text style={s.splashLoadingText}>Connecting to RideZW...</Text>
      </View>
    );
  }

  if (user) {
    return (
      <View style={{ flex: 1 }}>
        {children}
        <Pressable
          style={s.signout}
          onPress={async () => {
            await ridezwApi.signOut();
            setUser(null);
            setStep('form');
            setOtpCode('');
            setPhoneNumber('');
            setError('');
            setInfoMessage('');
          }}
        >
          <Text style={s.signoutText}>Sign out</Text>
        </Pressable>
      </View>
    );
  }

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.includes(countrySearch)
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#f8fafc' }}
    >
      <ScrollView
        contentContainerStyle={s.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Branding */}
        <View style={s.heroContainer}>
          <View style={s.badge}>
            <Text style={s.badgeText}>ZIMBABWE MOBILITY NETWORK</Text>
          </View>
          <Text style={s.heroBrand}>RIDEZW</Text>
          <Text style={s.heroSubtitle}>
            {role === 'driver' ? 'Driver Partner Cockpit & Registration' : 'Rider App & Fare Negotiation'}
          </Text>
        </View>

        {/* Main Card */}
        <View style={s.card}>
          {/* Tab Switcher: Sign In vs Create Account */}
          {step === 'form' && (
            <View style={s.tabContainer}>
              <TouchableOpacity
                onPress={() => {
                  setMode('signin');
                  setError('');
                  setInfoMessage('');
                }}
                style={[s.tabButton, mode === 'signin' && s.tabButtonActive]}
                activeOpacity={0.8}
              >
                <Text style={[s.tabButtonText, mode === 'signin' && s.tabButtonTextActive]}>
                  Sign In
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setMode('signup');
                  setError('');
                  setInfoMessage('');
                }}
                style={[s.tabButton, mode === 'signup' && s.tabButtonActive]}
                activeOpacity={0.8}
              >
                <Text style={[s.tabButtonText, mode === 'signup' && s.tabButtonTextActive]}>
                  {role === 'driver' ? 'Register Driver' : 'Create Account'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Info / Success Message */}
          {infoMessage ? (
            <View style={s.infoBanner}>
              <Text style={s.infoBannerText}>{infoMessage}</Text>
            </View>
          ) : null}

          {/* Error Message */}
          {error ? (
            <View style={s.errorBanner}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Step 1: Form (Sign In or Registration) */}
          {step === 'form' ? (
            <View style={s.formSection}>
              {/* Registration Specific Fields */}
              {mode === 'signup' && (
                <>
                  <View style={s.inputGroup}>
                    <Text style={s.inputLabel}>Full Legal Name *</Text>
                    <TextInput
                      style={s.input}
                      placeholder="e.g. Farai Ndlovu"
                      placeholderTextColor="#94a3b8"
                      value={fullName}
                      onChangeText={setFullName}
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={s.inputGroup}>
                    <Text style={s.inputLabel}>Operating Hub / City</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.cityScroll}>
                      {OPERATING_CITIES.map((c) => (
                        <TouchableOpacity
                          key={c}
                          onPress={() => setCity(c)}
                          style={[s.cityChip, city === c && s.cityChipActive]}
                        >
                          <Text style={[s.cityChipText, city === c && s.cityChipTextActive]}>
                            {c}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </>
              )}

              {/* Mobile Phone Input with Country Code Selector */}
              <View style={s.inputGroup}>
                <Text style={s.inputLabel}>
                  {mode === 'signup' ? 'Mobile Phone (EcoCash / NetOne / InnBucks) *' : 'Mobile Phone Number *'}
                </Text>
                <View style={s.phoneRow}>
                  {/* Country Selector Button */}
                  <TouchableOpacity
                    style={s.countryButton}
                    onPress={() => setShowCountryModal(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={s.flagText}>{selectedCountry.flag}</Text>
                    <Text style={s.prefixText}>{customCountryCode}</Text>
                    <Text style={s.dropdownArrow}>▾</Text>
                  </TouchableOpacity>

                  {/* Phone Number Input */}
                  <TextInput
                    style={[s.input, s.phoneInput]}
                    placeholder="77 123 4567"
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                  />
                </View>
                <Text style={s.fieldHint}>Enter your mobile number without leading 0</Text>
              </View>

              {/* Driver Registration Details */}
              {mode === 'signup' && role === 'driver' && (
                <>
                  <View style={s.inputGroup}>
                    <Text style={s.inputLabel}>National ID Number *</Text>
                    <TextInput
                      style={s.input}
                      placeholder="e.g. 63-1284920-A63"
                      placeholderTextColor="#94a3b8"
                      value={nationalId}
                      onChangeText={t => setNationalId(t.toUpperCase())}
                      autoCapitalize="characters"
                    />
                  </View>

                  <View style={s.inputRow}>
                    <View style={[s.inputGroup, { flex: 1.2, marginRight: 8 }]}>
                      <Text style={s.inputLabel}>Vehicle Make & Model *</Text>
                      <TextInput
                        style={s.input}
                        placeholder="Toyota Passo"
                        placeholderTextColor="#94a3b8"
                        value={vehicleMake}
                        onChangeText={setVehicleMake}
                      />
                    </View>

                    <View style={[s.inputGroup, { flex: 0.9 }]}>
                      <Text style={s.inputLabel}>Number Plate *</Text>
                      <TextInput
                        style={s.input}
                        placeholder="AFE-8921"
                        placeholderTextColor="#94a3b8"
                        value={vehiclePlate}
                        onChangeText={t => setVehiclePlate(t.toUpperCase())}
                        autoCapitalize="characters"
                      />
                    </View>
                  </View>

                  <View style={s.inputGroup}>
                    <Text style={s.inputLabel}>Vehicle Category</Text>
                    <View style={s.categoryList}>
                      {VEHICLE_CATEGORIES.map(cat => (
                        <TouchableOpacity
                          key={cat.id}
                          onPress={() => setVehicleCategory(cat.id as any)}
                          style={[s.categoryCard, vehicleCategory === cat.id && s.categoryCardActive]}
                        >
                          <View style={s.radioCircle}>
                            {vehicleCategory === cat.id && <View style={s.radioDot} />}
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[s.categoryLabel, vehicleCategory === cat.id && s.categoryLabelActive]}>
                              {cat.label}
                            </Text>
                            <Text style={s.categorySub}>{cat.sub}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </>
              )}

              {/* Optional Email */}
              {mode === 'signup' && (
                <View style={s.inputGroup}>
                  <Text style={s.inputLabel}>Email Address (Optional)</Text>
                  <TextInput
                    style={s.input}
                    placeholder={role === 'driver' ? 'driver@example.com' : 'rider@example.com'}
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                  />
                </View>
              )}

              {/* Action Button */}
              <TouchableOpacity
                style={[s.button, submitting && s.buttonDisabled]}
                onPress={handleInitiateAuth}
                disabled={submitting}
                activeOpacity={0.85}
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={s.buttonText}>
                    {mode === 'signup' ? 'Continue to SMS Verification' : 'Send Verification Code (SMS)'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            /* Step 2: OTP Verification */
            <View style={s.otpSection}>
              <View style={s.otpTargetBox}>
                <Text style={s.otpTargetTitle}>VERIFICATION CODE SENT</Text>
                <Text style={s.otpTargetPhone}>To: {getFullPhone()}</Text>
                <TouchableOpacity
                  onPress={() => {
                    setStep('form');
                    setError('');
                    setInfoMessage('');
                    setOtpCode('');
                  }}
                  style={s.changePhoneBtn}
                >
                  <Text style={s.changePhoneText}>Change phone number</Text>
                </TouchableOpacity>
              </View>

              <View style={s.inputGroup}>
                <Text style={[s.inputLabel, { textAlign: 'center' }]}>Enter 6-Digit SMS Code</Text>
                <TextInput
                  style={[s.input, s.otpInput]}
                  placeholder="••••••"
                  placeholderTextColor="#cbd5e1"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otpCode}
                  onChangeText={setOtpCode}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={[s.button, submitting && s.buttonDisabled]}
                onPress={handleVerifyOtp}
                disabled={submitting}
                activeOpacity={0.85}
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={s.buttonText}>
                    {mode === 'signup' ? `Verify & Complete Registration` : `Verify & Enter App`}
                  </Text>
                )}
              </TouchableOpacity>

              <View style={s.resendRow}>
                {resendCooldown > 0 ? (
                  <Text style={s.cooldownText}>Resend SMS in {resendCooldown}s</Text>
                ) : (
                  <TouchableOpacity onPress={handleResendOtp} disabled={submitting}>
                    <Text style={s.resendLink}>Didn't receive code? Resend SMS</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Footer info */}
        <View style={s.footer}>
          <Text style={s.footerText}>Secure End-to-End Encrypted Authentication</Text>
          <Text style={s.footerText}>RideZW Mobility Platform Zimbabwe • {role.toUpperCase()} PORTAL</Text>
        </View>
      </ScrollView>

      {/* Country Code Selection Modal */}
      <Modal
        visible={showCountryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCountryModal(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Select Country Code</Text>
              <TouchableOpacity
                onPress={() => setShowCountryModal(false)}
                style={s.modalCloseBtn}
              >
                <Text style={s.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <TextInput
              style={s.modalSearchInput}
              placeholder="Search country or dial code..."
              placeholderTextColor="#94a3b8"
              value={countrySearch}
              onChangeText={setCountrySearch}
            />

            {/* Custom Code Entry */}
            <View style={s.customCodeRow}>
              <Text style={s.customCodeLabel}>Or type dial code:</Text>
              <TextInput
                style={s.customCodeInput}
                placeholder="+263"
                placeholderTextColor="#94a3b8"
                value={customCountryCode}
                onChangeText={setCustomCountryCode}
              />
              <TouchableOpacity
                onPress={() => setShowCountryModal(false)}
                style={s.customCodeApplyBtn}
              >
                <Text style={s.customCodeApplyText}>Apply</Text>
              </TouchableOpacity>
            </View>

            {/* Country List */}
            <ScrollView style={s.countryList}>
              {filteredCountries.map((c) => (
                <TouchableOpacity
                  key={c.code + c.name}
                  style={[s.countryItem, customCountryCode === c.code && s.countryItemActive]}
                  onPress={() => handleSelectCountry(c)}
                >
                  <Text style={s.countryItemFlag}>{c.flag}</Text>
                  <Text style={s.countryItemName}>{c.name}</Text>
                  <Text style={s.countryItemCode}>{c.code}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  splashLoading: {
    flex: 1,
    backgroundColor: '#082f49',
    alignItems: 'center',
    justifyContent: 'center'
  },
  splashLoadingText: {
    color: '#38bdf8',
    marginTop: 16,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40
  },
  heroContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  badge: {
    backgroundColor: '#0c4a6e',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 8
  },
  badgeText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5
  },
  heroBrand: {
    fontSize: 28,
    fontWeight: '900',
    color: '#082f49',
    letterSpacing: 3
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 3,
    textAlign: 'center'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 9
  },
  tabButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b'
  },
  tabButtonTextActive: {
    color: '#082f49'
  },
  formSection: {
    gap: 14
  },
  inputGroup: {
    marginBottom: 2
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500'
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  countryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginRight: 8
  },
  flagText: {
    fontSize: 18,
    marginRight: 4
  },
  prefixText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a'
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4
  },
  phoneInput: {
    flex: 1
  },
  fieldHint: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4
  },
  cityScroll: {
    flexDirection: 'row',
    marginBottom: 4
  },
  cityChip: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8
  },
  cityChipActive: {
    backgroundColor: '#0c4a6e',
    borderColor: '#0c4a6e'
  },
  cityChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569'
  },
  cityChipTextActive: {
    color: '#ffffff'
  },
  categoryList: {
    gap: 8,
    marginTop: 2
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 10
  },
  categoryCardActive: {
    borderColor: '#0284c7',
    backgroundColor: '#f0f9ff'
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#94a3b8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0284c7'
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155'
  },
  categoryLabelActive: {
    color: '#0369a1'
  },
  categorySub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1
  },
  button: {
    backgroundColor: '#082f49',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#082f49',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3
  },
  buttonDisabled: {
    opacity: 0.65
  },
  buttonText: {
    color: '#38bdf8',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.3
  },
  otpSection: {
    gap: 16
  },
  otpTargetBox: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center'
  },
  otpTargetTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0369a1',
    letterSpacing: 1
  },
  otpTargetPhone: {
    fontSize: 16,
    fontWeight: '800',
    color: '#082f49',
    marginTop: 3
  },
  changePhoneBtn: {
    marginTop: 6,
    paddingVertical: 2
  },
  changePhoneText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284c7',
    textDecorationLine: 'underline'
  },
  otpInput: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 10,
    color: '#082f49',
    borderColor: '#0284c7',
    paddingVertical: 14
  },
  resendRow: {
    alignItems: 'center',
    marginTop: 4
  },
  cooldownText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600'
  },
  resendLink: {
    fontSize: 13,
    color: '#0284c7',
    fontWeight: '700'
  },
  infoBanner: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14
  },
  infoBannerText: {
    color: '#065f46',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center'
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center'
  },
  footer: {
    marginTop: 24,
    alignItems: 'center'
  },
  footerText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 2
  },
  signout: {
    position: 'absolute',
    right: 18,
    top: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  signoutText: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: 12
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 36,
    maxHeight: '75%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a'
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalCloseText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: 'bold'
  },
  modalSearchInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0f172a',
    marginBottom: 10
  },
  customCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 10,
    marginBottom: 12
  },
  customCodeLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
    marginRight: 8
  },
  customCodeInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f172a'
  },
  customCodeApplyBtn: {
    backgroundColor: '#082f49',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    marginLeft: 8
  },
  customCodeApplyText: {
    color: '#38bdf8',
    fontWeight: '700',
    fontSize: 12
  },
  countryList: {
    maxHeight: 280
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  countryItemActive: {
    backgroundColor: '#f0f9ff'
  },
  countryItemFlag: {
    fontSize: 22,
    marginRight: 12
  },
  countryItemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#334155'
  },
  countryItemCode: {
    fontSize: 14,
    fontWeight: '800',
    color: '#082f49'
  }
});
