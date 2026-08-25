import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { ridezwApi } from './api';

export function AuthGate({ role, children }: { role: 'rider' | 'driver'; children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState(role === 'driver' ? '0772123456' : '0771234567');
  const [name, setName] = useState('');
  const [otpCode, setOtpCode] = useState('');

  useEffect(() => {
    ridezwApi.me()
      .then(u => {
        if (u) setUser(u);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSendOtp = async (targetPhone?: string) => {
    const p = (targetPhone || phone).trim();
    if (!p) {
      setError('Please enter your mobile phone number');
      return;
    }

    setSubmitting(true);
    setError('');
    setInfoMessage('');

    try {
      const res = await ridezwApi.sendOtp(p, role);
      if (res.code) {
        setOtpCode(res.code);
      }
      setInfoMessage(
        res.isSimulated
          ? `Test Mode: Verification code is ${res.code}`
          : `SMS verification code dispatched to ${res.targetPhone || p}`
      );
      setStep('otp');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send verification SMS');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const u = await ridezwApi.verifyOtp(phone.trim(), otpCode.trim(), role, name.trim() || undefined);
      if (u?.user_metadata?.role && u.user_metadata.role !== role) {
        throw new Error(`This account is registered as a ${u.user_metadata.role}. Please use the ${u.user_metadata.role} app.`);
      }
      setUser(u);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid code or authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (demoPhone: string, demoName: string) => {
    setPhone(demoPhone);
    setName(demoName);
    setSubmitting(true);
    setError('');
    try {
      await ridezwApi.sendOtp(demoPhone, role).catch(() => {});
      const u = await ridezwApi.verifyOtp(demoPhone, '123456', role, demoName);
      setUser(u);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Quick login failed');
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
            setStep('phone');
            setOtpCode('');
          }}
        >
          <Text style={s.signoutText}>Sign out</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={s.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.heroContainer}>
          <View style={s.badge}>
            <Text style={s.badgeText}>ZIMBABWE MOBILITY NETWORK</Text>
          </View>
          <Text style={s.heroBrand}>RIDEZW</Text>
          <Text style={s.heroSubtitle}>
            {role === 'driver' ? 'Driver Partner Cockpit' : 'Rider App & Fare Negotiation'}
          </Text>
        </View>

        <View style={s.card}>
          {step === 'phone' ? (
            <>
              <Text style={s.formTitle}>
                {role === 'driver' ? 'Driver Partner Login' : 'Welcome to RideZW'}
              </Text>
              <Text style={s.formDesc}>
                Enter your Zimbabwean mobile number to receive an instant SMS verification code.
              </Text>

              <Text style={s.label}>Full Name (Optional)</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={role === 'driver' ? 'e.g. Farai Moyo' : 'e.g. Tanaka Ndlovu'}
                placeholderTextColor="#94a3b8"
                style={s.input}
              />

              <Text style={s.label}>Mobile Phone Number</Text>
              <View style={s.phoneRow}>
                <View style={s.countryPrefix}>
                  <Text style={s.flagText}>🇿🇼</Text>
                  <Text style={s.prefixText}>+263</Text>
                </View>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="077 123 4567"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  style={[s.input, s.phoneInput]}
                />
              </View>
              <Text style={s.networkHint}>Econet (077/078) • NetOne (071) • Telecel (073)</Text>

              <Pressable
                style={[s.button, submitting && s.buttonDisabled]}
                onPress={() => handleSendOtp()}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.buttonText}>Send Verification Code (SMS OTP)</Text>
                )}
              </Pressable>

              <View style={s.demoSection}>
                <Text style={s.demoTitle}>⚡ Quick Demo Sign-In</Text>
                {role === 'driver' ? (
                  <Pressable
                    style={s.demoButton}
                    onPress={() => handleQuickDemoLogin('+263 77 212 3456', 'Farai Moyo')}
                    disabled={submitting}
                  >
                    <Text style={s.demoButtonText}>🚗 Log in as Farai Moyo (Driver)</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    style={s.demoButton}
                    onPress={() => handleQuickDemoLogin('+263 77 123 4567', 'Tanaka Ndlovu')}
                    disabled={submitting}
                  >
                    <Text style={s.demoButtonText}>👤 Log in as Tanaka Ndlovu (Rider)</Text>
                  </Pressable>
                )}
              </View>
            </>
          ) : (
            <>
              <Text style={s.formTitle}>Enter Verification Code</Text>
              <Text style={s.formDesc}>
                We sent a 6-digit security code to{' '}
                <Text style={{ fontWeight: '700', color: '#0f172a' }}>{phone}</Text>
              </Text>

              {infoMessage ? (
                <View style={s.infoBanner}>
                  <Text style={s.infoBannerText}>{infoMessage}</Text>
                </View>
              ) : null}

              <Text style={s.label}>6-Digit Security Code</Text>
              <TextInput
                value={otpCode}
                onChangeText={setOtpCode}
                placeholder="123456"
                placeholderTextColor="#94a3b8"
                keyboardType="number-pad"
                maxLength={6}
                style={[s.input, s.otpInput]}
                autoFocus
              />

              <Text style={s.otpHint}>Master bypass code for testing: 123456</Text>

              <Pressable
                style={[s.button, submitting && s.buttonDisabled]}
                onPress={handleVerifyOtp}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.buttonText}>Verify Code & Sign In</Text>
                )}
              </Pressable>

              <View style={s.otpFooter}>
                <Pressable
                  onPress={() => handleSendOtp()}
                  disabled={submitting}
                  style={s.textLink}
                >
                  <Text style={s.linkText}>Resend SMS Code</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setStep('phone');
                    setError('');
                    setInfoMessage('');
                  }}
                  style={s.textLink}
                >
                  <Text style={s.linkTextSecondary}>Change Phone Number</Text>
                </Pressable>
              </View>
            </>
          )}

          {error ? (
            <View style={s.errorBanner}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>Secure 256-Bit Encrypted Mobile Gateway</Text>
          <Text style={s.footerText}>Harare • Bulawayo • Victoria Falls • Mutare • Gweru</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  splashLoading: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center'
  },
  splashLoadingText: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 16
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#f1f5f9',
    paddingBottom: 40
  },
  heroContainer: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: '#0f172a',
    alignItems: 'center'
  },
  badge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 6
  },
  badgeText: {
    color: '#0f172a',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1
  },
  heroBrand: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 2
  },
  card: {
    marginHorizontal: 16,
    marginTop: -16,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6
  },
  formDesc: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 20
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0f172a',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    marginBottom: 14
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  countryPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: '#cbd5e1'
  },
  flagText: {
    fontSize: 16,
    marginRight: 4
  },
  prefixText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a'
  },
  phoneInput: {
    flex: 1,
    marginBottom: 0
  },
  networkHint: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 20,
    marginTop: 4
  },
  button: {
    backgroundColor: '#0e7490',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0e7490',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3
  },
  buttonDisabled: {
    opacity: 0.7
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5
  },
  demoSection: {
    marginTop: 24,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9'
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    textAlign: 'center'
  },
  demoButton: {
    backgroundColor: '#f0fdfa',
    borderWidth: 1.5,
    borderColor: '#ccfbf1',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center'
  },
  demoButtonText: {
    color: '#0e7490',
    fontWeight: '700',
    fontSize: 14
  },
  otpInput: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 8,
    color: '#0e7490',
    borderColor: '#0e7490'
  },
  otpHint: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16
  },
  infoBanner: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16
  },
  infoBannerText: {
    color: '#065f46',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center'
  },
  otpFooter: {
    marginTop: 20,
    alignItems: 'center',
    gap: 12
  },
  textLink: {
    padding: 6
  },
  linkText: {
    color: '#0e7490',
    fontWeight: '700',
    fontSize: 14
  },
  linkTextSecondary: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 13
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: 12,
    marginTop: 16
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center'
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
    paddingHorizontal: 20
  },
  footerText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 3
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
  }
});
