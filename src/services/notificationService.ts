import { setAccessToken } from './authSession';
/**
 * Notification and SMS OTP Service
 * Dispatches requests to server-side endpoints (/api/auth/send-otp, /api/notifications/send-push)
 * Keeps secrets (Twilio Auth Token, FCM Server Keys) safely stored on the server.
 */

/**
 * Notification and SMS OTP Service
 * Dispatches requests to server-side endpoints (/api/auth/send-otp, /api/notifications/send-push)
 * Handles PWA Background Push Notifications, Service Worker registration, and Audio Alerts
 */

export interface OtpResponse { success: boolean; message: string; targetPhone?: string; error?: string; }

let deferredPrompt: any = null;

// Listen for PWA install prompt
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
}

/**
 * Register Service Worker for Background Push Notifications & Offline Support
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.log('RideZW Service Worker registered successfully:', reg.scope);
      return reg;
    } catch (err) {
      console.warn('Service Worker registration failed:', err);
      return null;
    }
  }
  return null;
}

/**
 * Request Browser Push Notification Permission
 */
export async function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (e) {
      console.warn('Notification permission error:', e);
      return 'denied';
    }
  }
  return 'denied';
}

/**
 * Check if Push Notifications are Supported & Enabled
 */
export function isPushNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
}

export function getNotificationPermissionStatus(): NotificationPermission {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    return Notification.permission;
  }
  return 'denied';
}

/**
 * Trigger an In-App & Background Notification Alert
 */
export async function triggerLocalNotification(title: string, body: string, data?: any) {
  // Play subtle sound alert
  playNotificationSound();

  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        reg.showNotification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          vibrate: [200, 100, 200],
          data: data || {},
          tag: 'ridezw-update'
        } as any);
        return;
      } catch (e) {
        // Fallback to standard window Notification
      }
    }

    try {
      new Notification(title, {
        body,
        icon: '/icon-192.png'
      });
    } catch {}
  }
}

/**
 * Synthesizes a high-contrast pleasant notification chime using Web Audio API
 */
export function playNotificationSound() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880.0, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {}
}

/**
 * Prompt user to install PWA app
 */
export async function promptPWAInstall(): Promise<boolean> {
  if (deferredPrompt) {
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      return outcome === 'accepted';
    } catch {
      return false;
    }
  }
  return false;
}

export function isPWAInstallable(): boolean {
  return !!deferredPrompt;
}

function getBackendApiUrl(path: string): string {
  const customUrl = (typeof process !== 'undefined' && process.env?.VITE_API_URL) || (typeof window !== 'undefined' && (window as any).__RIDEZW_API_URL__) || '';
  return customUrl ? customUrl.replace(/\/$/, '') + path : path;
}

export async function fetchTwilioStatus(): Promise<{ isConfigured: boolean; accountSidMasked: string | null; hasAuthToken: boolean; fromNumber: string | null; source: string }> {
  const response = await fetch(getBackendApiUrl('/api/auth/twilio-status'));
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Could not load SMS service status');
  return data;
}

export async function updateServerTwilioConfig(config: { accountSid?: string; authToken?: string; fromNumber?: string }): Promise<any> {
  const response = await fetch(getBackendApiUrl('/api/auth/twilio-config'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Could not update SMS configuration');
  return data;
}

export async function sendDirectTestSms(params: { phone: string; message?: string; twilioConfig?: { accountSid?: string; authToken?: string; fromNumber?: string } }): Promise<any> {
  const response = await fetch(getBackendApiUrl('/api/auth/test-sms'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Test SMS is unavailable');
  return data;
}

export async function requestSmsOtp(phone: string, role: 'driver' | 'rider' = 'rider'): Promise<OtpResponse> {
  const response = await fetch(getBackendApiUrl('/api/auth/send-otp'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, role }) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success !== true) throw new Error(data.error || data.message || 'Could not send verification code');
  return data as OtpResponse;
}

export async function verifySmsOtp(phone: string, code: string, role: 'driver' | 'rider' = 'rider', regDetails?: any, flow: 'signin' | 'signup' = 'signin'): Promise<{ success: boolean; message?: string; error?: string; userProfile?: any; user?: any; session?: any; role?: string }> {
  const response = await fetch(getBackendApiUrl('/api/auth/verify-otp'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, code, role, flow, ...(regDetails || {}) }) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success !== true || !data.session?.access_token || !data.userProfile) throw new Error(data.error || data.message || 'Could not verify code or load profile');
  setAccessToken(data.session.access_token);
  return data;
}

export async function sendPushNotification(params: {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}): Promise<{ success: boolean; messageId?: string; isSimulated: boolean; error?: string }> {
  try {
    const res = await fetch('/api/notifications/send-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return await res.json();
  } catch (err: any) {
    console.warn('Error sending push notification:', err);
    return { success: true, isSimulated: true };
  }
}

