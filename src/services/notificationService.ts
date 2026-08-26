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

export interface OtpResponse {
  success: boolean;
  message: string;
  isSimulated?: boolean;
  calledTwilio?: boolean;
  code?: string;
  dispatchedMessage?: string;
  targetPhone?: string;
  twilioSid?: string;
  twilioStatus?: string;
  twilioFrom?: string;
  twilioError?: string;
  twilioRequestPayload?: {
    to: string;
    from: string;
    body: string;
    accountSidMasked?: string | null;
  };
  rawTwilioResponse?: {
    sid: string;
    status: string;
    to: string;
    from: string;
    body: string;
    dateCreated?: string;
    dateSent?: string;
    direction?: string;
    price?: string | null;
    priceUnit?: string | null;
    errorCode?: number | null;
    errorMessage?: string | null;
    uri?: string;
  };
  rawTwilioError?: {
    httpStatus: number;
    twilioErrorCode?: number | null;
    message: string;
    moreInfo?: string;
    details?: any;
  };
  missingConfig?: string[];
  userFoundInDb?: boolean;
  dbAccountType?: 'driver' | 'rider';
  registeredName?: string;
  dbRecordId?: string;
  error?: string;
}

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

// Fallback in-memory OTP store for offline resilience
const clientOtpStore: Record<string, { code: string; expiresAt: number }> = {};

export async function fetchTwilioStatus(): Promise<{
  isConfigured: boolean;
  accountSidMasked: string | null;
  hasAuthToken: boolean;
  fromNumber: string | null;
  source: string;
}> {
  try {
    const res = await fetch('/api/auth/twilio-status');
    return await res.json();
  } catch (e) {
    return {
      isConfigured: false,
      accountSidMasked: null,
      hasAuthToken: false,
      fromNumber: null,
      source: 'offline'
    };
  }
}

export async function updateServerTwilioConfig(config: {
  accountSid?: string;
  authToken?: string;
  fromNumber?: string;
}): Promise<any> {
  const res = await fetch('/api/auth/twilio-config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  return await res.json();
}

export async function sendDirectTestSms(params: {
  phone: string;
  message?: string;
  twilioConfig?: { accountSid?: string; authToken?: string; fromNumber?: string };
}): Promise<any> {
  const res = await fetch('/api/auth/test-sms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  return await res.json();
}

export async function requestSmsOtp(
  phone: string,
  role?: 'driver' | 'rider'
): Promise<OtpResponse> {
  try {
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, role })
    });
    return await res.json();
  } catch (err: any) {
    console.warn('Network error requesting OTP:', err);
    return { success: false, calledTwilio: false, message: 'Unable to reach the authentication backend. Please try again.', error: err?.message || 'OTP backend unavailable' };
  }
}

export async function verifySmsOtp(
  phone: string,
  code: string,
  role?: 'driver' | 'rider',
  regDetails?: any
): Promise<{ success: boolean; message?: string; error?: string; userProfile?: any; user?: any; session?: any }> {
  try {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code, role, ...(regDetails || {}) })
    });
    return await res.json();
  } catch (err: any) {
    console.warn('Network error verifying OTP:', err);
    return { success: false, error: 'Verification network error. Please try again.' };
  }
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

