import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory OTP cache for verification (in production, synced with Supabase / Redis)
const otpStore: Record<string, { code: string; expiresAt: number }> = {};

// =============================================================================
// LAZY-LOADED THIRD-PARTY SDK CLIENTS (Prevents startup crashes when keys are empty)
// =============================================================================

let twilioClient: any = null;
function getTwilio() {
  if (twilioClient) return twilioClient;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token || sid.trim() === '' || token.trim() === '') {
    return null;
  }
  try {
    const twilio = require('twilio');
    twilioClient = twilio(sid, token);
    return twilioClient;
  } catch (e) {
    console.warn('Twilio initialization warning:', e);
    return null;
  }
}

let firebaseAdminApp: any = null;
function getFirebaseAdmin() {
  if (firebaseAdminApp) return firebaseAdminApp;
  try {
    const admin = require('firebase-admin');
    if (admin.apps.length > 0) {
      firebaseAdminApp = admin.apps[0];
      return firebaseAdminApp;
    }

    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const projectId = process.env.FIREBASE_PROJECT_ID;

    if (serviceAccountJson && serviceAccountJson.trim() !== '') {
      const creds = JSON.parse(serviceAccountJson);
      firebaseAdminApp = admin.initializeApp({
        credential: admin.credential.cert(creds)
      });
      return firebaseAdminApp;
    } else if (projectId && projectId.trim() !== '') {
      firebaseAdminApp = admin.initializeApp({
        projectId: projectId
      });
      return firebaseAdminApp;
    }
    return null;
  } catch (e) {
    console.warn('Firebase Admin initialization warning:', e);
    return null;
  }
}

// =============================================================================
// API ROUTES
// =============================================================================

// 1. Health & Configuration Status Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    services: {
      supabase: Boolean(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL),
      twilio: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
      fcm: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.FIREBASE_PROJECT_ID),
      clicknpay: Boolean(process.env.CLICKNPAY_API_KEY)
    },
    timestamp: new Date().toISOString()
  });
});

// 2. Twilio SMS OTP Dispatch
app.post('/api/auth/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  // Generate 6-digit OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[phone] = {
    code,
    expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes validity
  };

  const twilio = getTwilio();
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_MESSAGING_SERVICE_SID;

  if (twilio && twilioFrom) {
    try {
      await twilio.messages.create({
        body: `Your RideZW security verification code is: ${code}. Valid for 5 minutes. Do not share this code.`,
        from: twilioFrom,
        to: phone
      });
      return res.json({ success: true, message: 'SMS verification code dispatched via Twilio', isSimulated: false });
    } catch (err: any) {
      console.warn('Twilio dispatch failed, falling back to simulated OTP:', err.message);
      return res.json({
        success: true,
        message: 'Twilio SMS simulated (Check console / response in sandbox)',
        isSimulated: true,
        debugCode: process.env.NODE_ENV !== 'production' ? code : undefined
      });
    }
  }

  // If Twilio credentials are not configured, simulate OTP safely for development/testing
  console.log(`[SIMULATED SMS OTP] Sent to ${phone}: ${code}`);
  return res.json({
    success: true,
    message: 'SMS verification code generated (Simulation Mode)',
    isSimulated: true,
    debugCode: code
  });
});

// 3. Verify OTP Endpoint
app.post('/api/auth/verify-otp', (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) {
    return res.status(400).json({ error: 'Phone number and code are required' });
  }

  const stored = otpStore[phone];
  // Allow master test code '123456' in non-production environments
  const isMasterCode = process.env.NODE_ENV !== 'production' && code === '123456';

  if (!stored && !isMasterCode) {
    return res.status(400).json({ success: false, error: 'No active OTP request found for this number' });
  }

  if (!isMasterCode) {
    if (Date.now() > stored.expiresAt) {
      delete otpStore[phone];
      return res.status(400).json({ success: false, error: 'OTP has expired. Please request a new code.' });
    }
    if (stored.code !== code.trim()) {
      return res.status(400).json({ success: false, error: 'Invalid verification code. Please try again.' });
    }
  }

  delete otpStore[phone];
  return res.json({
    success: true,
    message: 'Phone number verified successfully',
    verifiedAt: new Date().toISOString()
  });
});

// 4. Firebase Cloud Messaging (FCM) Push Notification Dispatch
app.post('/api/notifications/send-push', async (req, res) => {
  const { token, title, body, data } = req.body;
  if (!token || !title || !body) {
    return res.status(400).json({ error: 'FCM Token, title, and body are required' });
  }

  const admin = getFirebaseAdmin();
  if (admin) {
    try {
      const response = await admin.messaging().send({
        token,
        notification: { title, body },
        data: data || {}
      });
      return res.json({ success: true, messageId: response, isSimulated: false });
    } catch (err: any) {
      console.warn('FCM dispatch failed:', err.message);
      return res.json({ success: false, error: err.message, isSimulated: true });
    }
  }

  // Simulated push for preview/local mode
  console.log(`[SIMULATED PUSH NOTIFICATION] Token: ${token} | ${title}: ${body}`);
  return res.json({
    success: true,
    message: 'Push notification simulated (Firebase Admin not configured)',
    isSimulated: true
  });
});

// 5. ClicknPay / EcoCash Payment Webhook
app.post('/api/webhooks/clicknpay', (req, res) => {
  const payload = req.body;
  console.log('[CLICKNPAY WEBHOOK RECEIVED]:', JSON.stringify(payload));
  // In production, verify HMAC signature with process.env.CLICKNPAY_WEBHOOK_SECRET
  res.json({ received: true, status: 'processed' });
});

// =============================================================================
// VITE MIDDLEWARE & STATIC ASSET SERVING
// =============================================================================

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚡ RideZW Server listening on http://0.0.0.0:${PORT}`);
  });
}

start();
