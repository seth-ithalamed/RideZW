import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory OTP cache for verification
const otpStore: Record<string, { code: string; expiresAt: number }> = {};

// In-memory fallback database for server-side persistence when remote DB is offline or during preview
const serverDb = {
  trips: new Map<string, any>(),
  drivers: new Map<string, any>(),
  riders: new Map<string, any>(),
  sosAlerts: new Map<string, any>(),
  ledgerEntries: new Map<string, any>(),
  permits: new Map<string, any>(),
  fines: new Map<string, any>(),
  activeSessions: new Map<string, any>(),
  coverageCities: new Map<string, any>(),
  pricingConfigs: new Map<string, any>(),
  platformSettings: {
    usd_to_zwg_rate: 26.85,
    platform_commission_percent: 12.0,
    driver_debt_ceiling_usd: 15.00,
    sos_police_number: '+263 242 777777',
    sos_security_hotline: '+263 77 000 9999',
    updated_at: new Date().toISOString()
  }
};

// =============================================================================
// LAZY-LOADED THIRD-PARTY SDK CLIENTS
// =============================================================================

let serverSupabaseClient: SupabaseClient | null = null;
function getServerSupabase(): SupabaseClient | null {
  if (serverSupabaseClient) return serverSupabaseClient;

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key || url.trim() === '' || key.trim() === '') {
    return null;
  }

  try {
    serverSupabaseClient = createClient(url, key, {
      auth: { persistSession: false }
    });
    return serverSupabaseClient;
  } catch (err) {
    console.warn('Failed to initialize server Supabase client:', err);
    return null;
  }
}

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
// BACKEND API ROUTES
// =============================================================================

// 1. Health & Configuration Status Endpoint
app.get('/api/health', (req, res) => {
  const sb = getServerSupabase();
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    databaseConnected: Boolean(sb),
    services: {
      supabase: Boolean(sb),
      twilio: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
      fcm: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.FIREBASE_PROJECT_ID),
      clicknpay: Boolean(process.env.CLICKNPAY_API_KEY)
    },
    counts: {
      trips: serverDb.trips.size,
      drivers: serverDb.drivers.size,
      riders: serverDb.riders.size,
      activeSessions: serverDb.activeSessions.size
    },
    timestamp: new Date().toISOString()
  });
});

// 2. Fetch State / Bootstrap Data from Backend & DB
app.get('/api/state', async (req, res) => {
  const sb = getServerSupabase();

  if (sb) {
    try {
      const [tripsRes, driversRes, ridersRes, sosRes, ledgerRes, settingsRes, citiesRes] = await Promise.allSettled([
        sb.from('trips').select('*').order('created_at', { ascending: false }).limit(50),
        sb.from('drivers').select('*'),
        sb.from('riders').select('*'),
        sb.from('sos_alerts').select('*').order('created_at', { ascending: false }).limit(20),
        sb.from('ledger_entries').select('*').order('created_at', { ascending: false }).limit(50),
        sb.from('platform_settings').select('*').limit(1),
        sb.from('coverage_cities').select('*')
      ]);

      return res.json({
        success: true,
        source: 'supabase_db',
        data: {
          trips: tripsRes.status === 'fulfilled' && tripsRes.value.data ? tripsRes.value.data : Array.from(serverDb.trips.values()),
          drivers: driversRes.status === 'fulfilled' && driversRes.value.data ? driversRes.value.data : Array.from(serverDb.drivers.values()),
          riders: ridersRes.status === 'fulfilled' && ridersRes.value.data ? ridersRes.value.data : Array.from(serverDb.riders.values()),
          sosAlerts: sosRes.status === 'fulfilled' && sosRes.value.data ? sosRes.value.data : Array.from(serverDb.sosAlerts.values()),
          ledger: ledgerRes.status === 'fulfilled' && ledgerRes.value.data ? ledgerRes.value.data : Array.from(serverDb.ledgerEntries.values()),
          settings: settingsRes.status === 'fulfilled' && settingsRes.value.data?.[0] ? settingsRes.value.data[0] : serverDb.platformSettings,
          coverageCities: citiesRes.status === 'fulfilled' && citiesRes.value.data ? citiesRes.value.data : Array.from(serverDb.coverageCities.values())
        }
      });
    } catch (e: any) {
      console.warn('Supabase state read warning:', e.message);
    }
  }

  return res.json({
    success: true,
    source: 'server_memory_db',
    data: {
      trips: Array.from(serverDb.trips.values()),
      drivers: Array.from(serverDb.drivers.values()),
      riders: Array.from(serverDb.riders.values()),
      sosAlerts: Array.from(serverDb.sosAlerts.values()),
      ledger: Array.from(serverDb.ledgerEntries.values()),
      settings: serverDb.platformSettings,
      coverageCities: Array.from(serverDb.coverageCities.values())
    }
  });
});

// 3. Sync Trips Endpoint
app.post('/api/trips', async (req, res) => {
  const trip = req.body;
  if (!trip || !trip.id) {
    return res.status(400).json({ error: 'Trip payload with id is required' });
  }

  // Store in server DB
  serverDb.trips.set(trip.id, { ...trip, updated_at: new Date().toISOString() });

  // Sync to Supabase PostgreSQL if available
  const sb = getServerSupabase();
  if (sb) {
    try {
      await sb.from('trips').upsert({
        id: trip.id,
        rider_id: trip.riderId || trip.rider_id,
        driver_id: trip.driverId || trip.driver_id || null,
        category: trip.category,
        status: trip.status,
        pickup_address: trip.pickup?.address || trip.pickup_address,
        pickup_lat: trip.pickup?.lat || trip.pickup_lat,
        pickup_lng: trip.pickup?.lng || trip.pickup_lng,
        dest_address: trip.destination?.address || trip.dest_address,
        dest_lat: trip.destination?.lat || trip.dest_lat,
        dest_lng: trip.destination?.lng || trip.dest_lng,
        agreed_fare_usd: trip.agreedFareUSD || trip.agreed_fare_usd,
        payment_method: trip.paymentMethod || trip.payment_method,
        payment_status: trip.paymentStatus || trip.payment_status,
        created_at: trip.createdAt || trip.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } catch (e: any) {
      console.warn('Trip sync to Supabase skipped:', e.message);
    }
  }

  return res.json({ success: true, tripId: trip.id, persisted: true });
});

// 4. Sync Drivers Endpoint
app.post('/api/drivers', async (req, res) => {
  const driver = req.body;
  if (!driver || !driver.id) {
    return res.status(400).json({ error: 'Driver payload with id is required' });
  }

  serverDb.drivers.set(driver.id, { ...driver, updated_at: new Date().toISOString() });

  const sb = getServerSupabase();
  if (sb) {
    try {
      await sb.from('drivers').upsert({
        id: driver.id,
        name: driver.name,
        phone: driver.phone,
        email: driver.email,
        national_id: driver.nationalId || driver.national_id,
        city: driver.city,
        current_lat: driver.currentLat || driver.current_lat,
        current_lng: driver.currentLng || driver.current_lng,
        is_online: driver.isOnline !== undefined ? driver.isOnline : driver.is_online,
        rating: driver.rating,
        total_trips: driver.totalTrips || driver.total_trips,
        wallet_balance_usd: driver.walletBalance || driver.wallet_balance_usd || 0,
        unremitted_levy_debt_usd: driver.cashDebtCeiling || driver.unremitted_levy_debt_usd || 0,
        is_blocked_due_to_debt: driver.isBlockedDueToDebt || driver.is_blocked_due_to_debt || false,
        vehicle_make: driver.vehicle?.make || driver.vehicle_make,
        vehicle_model: driver.vehicle?.model || driver.vehicle_model,
        vehicle_plate: driver.vehicle?.plateNumber || driver.vehicle_plate,
        vehicle_category: driver.vehicle?.category || driver.vehicle_category
      });
    } catch (e: any) {
      console.warn('Driver sync to Supabase skipped:', e.message);
    }
  }

  return res.json({ success: true, driverId: driver.id, persisted: true });
});

// 5. Sync Riders Endpoint
app.post('/api/riders', async (req, res) => {
  const rider = req.body;
  if (!rider || !rider.id) {
    return res.status(400).json({ error: 'Rider payload with id is required' });
  }

  serverDb.riders.set(rider.id, { ...rider, updated_at: new Date().toISOString() });

  const sb = getServerSupabase();
  if (sb) {
    try {
      await sb.from('riders').upsert({
        id: rider.id,
        name: rider.name,
        phone: rider.phone,
        email: rider.email || null,
        city: rider.city,
        account_type: rider.accountType || rider.account_type || 'individual',
        account_status: rider.status || rider.account_status || 'active',
        rating: rider.rating || 5.0,
        total_trips: rider.totalTrips || rider.total_trips || 0
      });
    } catch (e: any) {
      console.warn('Rider sync to Supabase skipped:', e.message);
    }
  }

  return res.json({ success: true, riderId: rider.id, persisted: true });
});

// 6. SOS Alert Endpoint
app.post('/api/sos', async (req, res) => {
  const sos = req.body;
  if (!sos || !sos.id) {
    return res.status(400).json({ error: 'SOS payload with id is required' });
  }

  serverDb.sosAlerts.set(sos.id, { ...sos, created_at: new Date().toISOString() });

  const sb = getServerSupabase();
  if (sb) {
    try {
      await sb.from('sos_alerts').upsert({
        id: sos.id,
        trip_id: sos.tripId || sos.trip_id || null,
        triggered_by: sos.triggeredBy || sos.triggered_by,
        lat: sos.lat,
        lng: sos.lng,
        address: sos.address,
        status: sos.status || 'active',
        created_at: sos.timestamp || sos.created_at || new Date().toISOString()
      });
    } catch (e: any) {
      console.warn('SOS sync to Supabase skipped:', e.message);
    }
  }

  return res.json({ success: true, alertId: sos.id, status: 'dispatched' });
});

// 7. Ledger & Financial Transaction Endpoint
app.post('/api/ledger', async (req, res) => {
  const entry = req.body;
  if (!entry || !entry.id) {
    return res.status(400).json({ error: 'Ledger payload with id is required' });
  }

  serverDb.ledgerEntries.set(entry.id, { ...entry, created_at: new Date().toISOString() });

  const sb = getServerSupabase();
  if (sb) {
    try {
      await sb.from('ledger_entries').insert({
        id: entry.id,
        trip_id: entry.tripId || entry.trip_id || null,
        driver_id: entry.driverId || entry.driver_id || null,
        type: entry.entryType || entry.type,
        amount_usd: entry.amount || entry.amount_usd,
        description: entry.description,
        created_at: entry.createdAt || entry.created_at || new Date().toISOString()
      });
    } catch (e: any) {
      console.warn('Ledger sync to Supabase skipped:', e.message);
    }
  }

  return res.json({ success: true, ledgerId: entry.id, persisted: true });
});

// 8. Single-Instance Active Session Enforcement
app.post('/api/sessions/register', async (req, res) => {
  const session = req.body;
  if (!session || !session.userId || !session.sessionId) {
    return res.status(400).json({ error: 'userId and sessionId are required' });
  }

  // Record active session on server
  serverDb.activeSessions.set(session.userId, {
    ...session,
    updated_at: new Date().toISOString()
  });

  const sb = getServerSupabase();
  if (sb) {
    try {
      await sb.from('active_sessions').upsert({
        user_id: session.userId,
        role: session.role || 'user',
        session_id: session.sessionId,
        device_id: session.deviceId || 'web_client',
        login_time: session.loginTime || new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } catch (e: any) {
      console.warn('Active session sync skipped:', e.message);
    }
  }

  return res.json({ success: true, sessionId: session.sessionId, status: 'enforced' });
});

// 9. Validate Single-Instance Session
app.post('/api/sessions/validate', (req, res) => {
  const { userId, sessionId } = req.body;
  if (!userId || !sessionId) {
    return res.status(400).json({ valid: false, error: 'userId and sessionId required' });
  }

  const active = serverDb.activeSessions.get(userId);
  if (active && active.sessionId !== sessionId) {
    return res.json({
      valid: false,
      reason: 'Logged in on another device or window',
      currentSessionId: active.sessionId
    });
  }

  return res.json({ valid: true });
});

// 10. Database Seeding Endpoint
app.post('/api/seed', async (req, res) => {
  const data = req.body || {};
  let totalSeeded = 0;

  if (data.coverageCities && Array.isArray(data.coverageCities)) {
    data.coverageCities.forEach((c: any) => serverDb.coverageCities.set(c.id, c));
    totalSeeded += data.coverageCities.length;
  }

  if (data.settings) {
    serverDb.platformSettings = { ...serverDb.platformSettings, ...data.settings };
    totalSeeded += 1;
  }

  const sb = getServerSupabase();
  if (sb) {
    try {
      if (data.settings) {
        await sb.from('platform_settings').upsert({
          id: 'default_settings',
          usd_to_zwg_rate: data.settings.exchangeRateUSDToZWG || 26.85,
          platform_commission_percent: 12.0,
          driver_debt_ceiling_usd: data.settings.driverDebtCeilingUSD || 15.00,
          sos_police_number: '+263 242 777777',
          sos_security_hotline: '+263 77 000 9999',
          updated_at: new Date().toISOString()
        });
      }
    } catch (e: any) {
      console.warn('Seed sync error:', e.message);
    }
  }

  return res.json({
    success: true,
    message: `Backend database successfully initialized and seeded with ${totalSeeded} items`,
    seededCount: totalSeeded
  });
});

// 11. Twilio SMS OTP Dispatch
app.post('/api/auth/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

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

  console.log(`[SIMULATED SMS OTP] Sent to ${phone}: ${code}`);
  return res.json({
    success: true,
    message: 'SMS verification code generated (Simulation Mode)',
    isSimulated: true,
    debugCode: code
  });
});

// 12. Verify OTP Endpoint
app.post('/api/auth/verify-otp', (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) {
    return res.status(400).json({ error: 'Phone number and code are required' });
  }

  const stored = otpStore[phone];
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

// 13. Firebase Cloud Messaging (FCM) Push Notification Dispatch
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

  console.log(`[SIMULATED PUSH NOTIFICATION] Token: ${token} | ${title}: ${body}`);
  return res.json({
    success: true,
    message: 'Push notification simulated (Firebase Admin not configured)',
    isSimulated: true
  });
});

// 14. ClicknPay / EcoCash Payment Webhook
app.post('/api/webhooks/clicknpay', (req, res) => {
  const payload = req.body;
  console.log('[CLICKNPAY WEBHOOK RECEIVED]:', JSON.stringify(payload));
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
