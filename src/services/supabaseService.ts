import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import {
  Trip,
  DriverProfile,
  RiderProfile,
  LedgerEntry,
  SosAlert,
  CoverageCity,
  PricingConfig,
  PermitTypeConfig,
  PlatformSettings,
  AdminUser,
  ActiveSession
} from '../types';

let supabaseClient: SupabaseClient | null = null;
let realtimeChannel: RealtimeChannel | null = null;

/**
 * Lazy initialization of the Supabase Client.
 * Protects application from crashing if environment keys are unset in preview.
 */
export function getSupabase(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const url = (import.meta as any).env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey || url.trim() === '' || anonKey.trim() === '') {
    return null;
  }

  try {
    supabaseClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
    return supabaseClient;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
}

/**
 * Checks if Supabase connection is currently active with valid keys
 */
export function isSupabaseConfigured(): boolean {
  return getSupabase() !== null;
}

/**
 * Upserts a trip to Supabase
 */
export async function syncTripToSupabase(trip: Trip): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { error } = await client
      .from('trips')
      .upsert({
        id: trip.id,
        rider_id: trip.riderId,
        driver_id: trip.driverId || null,
        category: trip.category,
        status: trip.status,
        pickup_address: trip.pickup.address,
        pickup_lat: trip.pickup.lat,
        pickup_lng: trip.pickup.lng,
        dest_address: trip.destination.address,
        dest_lat: trip.destination.lat,
        dest_lng: trip.destination.lng,
        agreed_fare_usd: trip.agreedFareUSD,
        payment_method: trip.paymentMethod,
        payment_status: trip.paymentStatus,
        created_at: trip.createdAt,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.warn('Supabase syncTrip error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase sync exception:', err);
    return false;
  }
}

/**
 * Sync driver partner location and status to Supabase
 */
export async function syncDriverToSupabase(driver: DriverProfile): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { error } = await client
      .from('drivers')
      .upsert({
        id: driver.id,
        name: driver.name,
        phone: driver.phone,
        email: driver.email,
        national_id: driver.nationalId,
        city: driver.city,
        current_lat: driver.currentLat,
        current_lng: driver.currentLng,
        is_online: driver.isOnline,
        rating: driver.rating,
        total_trips: driver.totalTrips,
        wallet_balance_usd: driver.walletBalance,
        unremitted_levy_debt_usd: driver.cashDebtCeiling,
        is_blocked_due_to_debt: driver.isBlockedDueToDebt,
        vehicle_make: driver.vehicle.make,
        vehicle_model: driver.vehicle.model,
        vehicle_plate: driver.vehicle.plateNumber,
        vehicle_category: driver.vehicle.category
      });

    if (error) {
      console.warn('Supabase syncDriver error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase syncDriver exception:', err);
    return false;
  }
}

/**
 * Sync rider profile to Supabase
 */
export async function syncRiderToSupabase(rider: RiderProfile): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { error } = await client
      .from('riders')
      .upsert({
        id: rider.id,
        name: rider.name,
        phone: rider.phone,
        email: rider.email || null,
        city: rider.city,
        account_type: rider.accountType,
        account_status: rider.status,
        rating: rider.rating,
        total_trips: rider.totalTrips
      });

    if (error) {
      console.warn('Supabase syncRider error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase syncRider exception:', err);
    return false;
  }
}

/**
 * Sync SOS emergency alert to Supabase
 */
export async function syncSosToSupabase(sos: SosAlert): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { error } = await client
      .from('sos_alerts')
      .upsert({
        id: sos.id,
        trip_id: sos.tripId || null,
        triggered_by: sos.triggeredBy,
        lat: sos.lat,
        lng: sos.lng,
        address: sos.address,
        status: sos.status,
        created_at: sos.timestamp
      });

    if (error) {
      console.warn('Supabase syncSos error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase syncSos exception:', err);
    return false;
  }
}

/**
 * Sync financial ledger transaction to Supabase
 */
export async function syncLedgerEntryToSupabase(entry: LedgerEntry): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { error } = await client
      .from('ledger_entries')
      .insert({
        id: entry.id,
        trip_id: entry.tripId || null,
        driver_id: entry.driverId || null,
        type: entry.entryType,
        amount_usd: entry.amount,
        description: entry.description,
        created_at: entry.createdAt
      });

    if (error) {
      console.warn('Supabase syncLedger error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase syncLedger exception:', err);
    return false;
  }
}

/**
 * Sync foundational seed data to Supabase PostgreSQL database
 * Invoked automatically when the admin logs in if seed data is uninitialized in DB.
 */
export async function syncSeedDataToSupabase(data: {
  coverageCities?: CoverageCity[];
  pricingConfigs?: PricingConfig[];
  permitTypes?: PermitTypeConfig[];
  settings?: PlatformSettings;
  adminUsers?: AdminUser[];
}): Promise<{ success: boolean; message: string; seededCount: number }> {
  const client = getSupabase();
  if (!client) {
    return { success: false, message: 'Supabase client not connected (using high-speed local persistence)', seededCount: 0 };
  }

  let totalSeeded = 0;

  try {
    // 1. Seed Platform Settings
    if (data.settings) {
      await client.from('platform_settings').upsert({
        id: 'default_settings',
        usd_to_zwg_rate: data.settings.exchangeRateUSDToZWG || 26.85,
        platform_commission_percent: 12.0,
        driver_debt_ceiling_usd: data.settings.driverDebtCeilingUSD || 15.00,
        sos_police_number: '+263 242 777777',
        sos_security_hotline: '+263 77 000 9999',
        updated_at: new Date().toISOString()
      });
      totalSeeded++;
    }

    // 2. Seed Admin Users (Root Super Admin Seth)
    if (data.adminUsers && data.adminUsers.length > 0) {
      for (const admin of data.adminUsers) {
        await client.from('admin_users').upsert({
          id: admin.id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          role: admin.role,
          department: admin.department,
          avatar_url: admin.avatarUrl,
          status: admin.status,
          permissions: admin.permissions,
          is_root_super_admin: admin.isRootSuperAdmin || false,
          created_at: admin.createdAt,
          last_login_at: admin.lastLoginAt || new Date().toISOString()
        });
        totalSeeded++;
      }
    }

    // 3. Seed Coverage Cities
    if (data.coverageCities && data.coverageCities.length > 0) {
      for (const city of data.coverageCities) {
        try {
          await client.from('coverage_cities').upsert({
            id: city.id,
            name: city.name,
            province: city.province,
            status: city.status,
            code: city.code,
            center_lat: city.centerLat,
            center_lng: city.centerLng,
            radius_km: city.radiusKm,
            base_fare_multiplier: city.baseFareMultiplier,
            supported_categories: city.supportedCategories,
            is_primary_hub: city.isPrimaryHub || false
          });
          totalSeeded++;
        } catch {
          // Table may not yet be provisioned
        }
      }
    }

    return {
      success: true,
      message: `Database successfully seeded with ${totalSeeded} records across hubs and configurations.`,
      seededCount: totalSeeded
    };
  } catch (err: any) {
    console.warn('Supabase seed error:', err);
    return {
      success: false,
      message: err.message || 'Seeding encountered an error',
      seededCount: totalSeeded
    };
  }
}

/**
 * Sync active single session to Supabase for multi-device enforcement
 */
export async function syncUserSessionToSupabase(session: ActiveSession): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    // Upsert into active_sessions table or update user's last session
    await client.from('active_sessions').upsert({
      user_id: session.userId,
      role: session.role,
      session_id: session.sessionId,
      device_id: session.deviceId,
      login_time: session.loginTime,
      updated_at: new Date().toISOString()
    });

    return true;
  } catch {
    return false;
  }
}

/**
 * Fetch all foundational and operational data from Supabase tables
 */
export async function fetchAllDataFromSupabase(): Promise<{
  trips?: Trip[];
  drivers?: DriverProfile[];
  riders?: RiderProfile[];
  sosAlerts?: SosAlert[];
  ledger?: LedgerEntry[];
  settings?: Partial<PlatformSettings>;
  coverageCities?: CoverageCity[];
  activeSessions?: Record<string, ActiveSession>;
} | null> {
  const client = getSupabase();
  if (!client) return null;

  try {
    const [tripsRes, driversRes, ridersRes, sosRes, ledgerRes, settingsRes, citiesRes, sessionsRes] = await Promise.allSettled([
      client.from('trips').select('*').order('created_at', { ascending: false }).limit(100),
      client.from('drivers').select('*'),
      client.from('riders').select('*'),
      client.from('sos_alerts').select('*').order('created_at', { ascending: false }).limit(50),
      client.from('ledger_entries').select('*').order('created_at', { ascending: false }).limit(100),
      client.from('platform_settings').select('*').limit(1),
      client.from('coverage_cities').select('*'),
      client.from('active_sessions').select('*')
    ]);

    const result: any = {};

    if (tripsRes.status === 'fulfilled' && tripsRes.value.data && tripsRes.value.data.length > 0) {
      result.trips = tripsRes.value.data.map((t: any) => ({
        id: t.id,
        riderId: t.rider_id,
        driverId: t.driver_id,
        category: t.category,
        status: t.status,
        pickup: {
          address: t.pickup_address,
          lat: Number(t.pickup_lat),
          lng: Number(t.pickup_lng)
        },
        destination: {
          address: t.dest_address,
          lat: Number(t.dest_lat),
          lng: Number(t.dest_lng)
        },
        agreedFareUSD: Number(t.agreed_fare_usd),
        paymentMethod: t.payment_method,
        paymentStatus: t.payment_status,
        createdAt: t.created_at
      }));
    }

    if (driversRes.status === 'fulfilled' && driversRes.value.data && driversRes.value.data.length > 0) {
      result.drivers = driversRes.value.data.map((d: any) => ({
        id: d.id,
        name: d.name,
        phone: d.phone,
        email: d.email,
        nationalId: d.national_id,
        city: d.city,
        currentLat: Number(d.current_lat),
        currentLng: Number(d.current_lng),
        isOnline: Boolean(d.is_online),
        rating: Number(d.rating),
        totalTrips: Number(d.total_trips),
        walletBalance: Number(d.wallet_balance_usd),
        cashDebtCeiling: Number(d.unremitted_levy_debt_usd),
        isBlockedDueToDebt: Boolean(d.is_blocked_due_to_debt),
        vehicle: {
          make: d.vehicle_make,
          model: d.vehicle_model,
          plateNumber: d.vehicle_plate,
          category: d.vehicle_category
        }
      }));
    }

    if (ridersRes.status === 'fulfilled' && ridersRes.value.data && ridersRes.value.data.length > 0) {
      result.riders = ridersRes.value.data.map((r: any) => ({
        id: r.id,
        name: r.name,
        phone: r.phone,
        email: r.email,
        city: r.city,
        accountType: r.account_type,
        status: r.account_status,
        rating: Number(r.rating),
        totalTrips: Number(r.total_trips)
      }));
    }

    if (sosRes.status === 'fulfilled' && sosRes.value.data && sosRes.value.data.length > 0) {
      result.sosAlerts = sosRes.value.data.map((s: any) => ({
        id: s.id,
        tripId: s.trip_id,
        triggeredBy: s.triggered_by,
        lat: Number(s.lat),
        lng: Number(s.lng),
        address: s.address,
        status: s.status,
        timestamp: s.created_at
      }));
    }

    if (ledgerRes.status === 'fulfilled' && ledgerRes.value.data && ledgerRes.value.data.length > 0) {
      result.ledger = ledgerRes.value.data.map((l: any) => ({
        id: l.id,
        tripId: l.trip_id,
        driverId: l.driver_id,
        entryType: l.type,
        amount: Number(l.amount_usd),
        description: l.description,
        createdAt: l.created_at
      }));
    }

    if (citiesRes.status === 'fulfilled' && citiesRes.value.data && citiesRes.value.data.length > 0) {
      result.coverageCities = citiesRes.value.data.map((c: any) => ({
        id: c.id,
        name: c.name,
        province: c.province,
        status: c.status || 'active',
        code: c.code,
        centerLat: Number(c.center_lat),
        centerLng: Number(c.center_lng),
        radiusKm: Number(c.radius_km),
        baseFareMultiplier: Number(c.base_fare_multiplier || 1.0),
        supportedCategories: Array.isArray(c.supported_categories) ? c.supported_categories : ['economy', 'comfort'],
        isPrimaryHub: Boolean(c.is_primary_hub)
      }));
    }

    if (settingsRes.status === 'fulfilled' && settingsRes.value.data && settingsRes.value.data.length > 0) {
      const s = settingsRes.value.data[0];
      result.settings = {
        exchangeRateUSDToZWG: Number(s.usd_to_zwg_rate),
        platformCommissionPercent: Number(s.platform_commission_percent),
        driverDebtCeilingUSD: Number(s.driver_debt_ceiling_usd)
      };
    }

    if (sessionsRes.status === 'fulfilled' && sessionsRes.value.data && sessionsRes.value.data.length > 0) {
      const sessionsMap: Record<string, ActiveSession> = {};
      sessionsRes.value.data.forEach((s: any) => {
        sessionsMap[s.user_id] = {
          userId: s.user_id,
          role: s.role,
          sessionId: s.session_id,
          deviceId: s.device_id,
          loginTime: s.login_time,
          userAgent: 'Supabase Device'
        };
      });
      result.activeSessions = sessionsMap;
    }

    return result;
  } catch (err) {
    console.warn('fetchAllDataFromSupabase warning:', err);
    return null;
  }
}

/**
 * Subscribe to real-time events across trips, drivers, and SOS alerts.
 * Architecture A: Broadcast changes instantly over WebSockets.
 */
export function subscribeToRealtimeUpdates(callbacks: {
  onTripChange?: (payload: any) => void;
  onDriverChange?: (payload: any) => void;
  onSosAlert?: (payload: any) => void;
  onSessionChange?: (payload: any) => void;
}): () => void {
  const client = getSupabase();
  if (!client) {
    return () => {};
  }

  if (realtimeChannel) {
    realtimeChannel.unsubscribe();
  }

  realtimeChannel = client
    .channel('ridezw-realtime-room')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'trips' },
      (payload) => {
        if (callbacks.onTripChange) callbacks.onTripChange(payload);
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'drivers' },
      (payload) => {
        if (callbacks.onDriverChange) callbacks.onDriverChange(payload);
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'sos_alerts' },
      (payload) => {
        if (callbacks.onSosAlert) callbacks.onSosAlert(payload);
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'active_sessions' },
      (payload) => {
        if (callbacks.onSessionChange) callbacks.onSessionChange(payload);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('⚡ RideZW Realtime Channel Subscribed successfully via Supabase!');
      }
    });

  return () => {
    if (realtimeChannel) {
      realtimeChannel.unsubscribe();
      realtimeChannel = null;
    }
  };
}

/**
 * Supabase SQL Migration script for initial database setup
 */
export const SUPABASE_SQL_SCHEMA = `
-- =============================================================================
-- RIDEZW SUPABASE POSTGRESQL SCHEMA INITIALIZATION
-- Run this in your Supabase SQL Editor (supabase.com/dashboard/project/.../sql)
-- =============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. RIDERS TABLE
create table if not exists public.riders (
  id text primary key,
  name text not null,
  phone text not null unique,
  email text,
  city text default 'Harare',
  account_type text default 'standard',
  account_status text default 'active',
  rating numeric(3,2) default 5.0,
  total_trips integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. DRIVERS TABLE
create table if not exists public.drivers (
  id text primary key,
  name text not null,
  phone text not null unique,
  email text,
  national_id text,
  city text default 'Harare',
  current_lat numeric(10,6),
  current_lng numeric(10,6),
  is_online boolean default false,
  rating numeric(3,2) default 5.0,
  total_trips integer default 0,
  wallet_balance_usd numeric(10,2) default 0.00,
  unremitted_levy_debt_usd numeric(10,2) default 0.00,
  is_blocked_due_to_debt boolean default false,
  vehicle_make text,
  vehicle_model text,
  vehicle_plate text,
  vehicle_category text default 'economy',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. TRIPS TABLE
create table if not exists public.trips (
  id text primary key,
  rider_id text references public.riders(id) on delete set null,
  driver_id text references public.drivers(id) on delete set null,
  category text default 'economy',
  status text not null,
  pickup_address text not null,
  pickup_lat numeric(10,6) not null,
  pickup_lng numeric(10,6) not null,
  dest_address text not null,
  dest_lat numeric(10,6) not null,
  dest_lng numeric(10,6) not null,
  agreed_fare_usd numeric(10,2) not null,
  payment_method text default 'ecocash',
  payment_status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. FINANCIAL LEDGER ENTRIES
create table if not exists public.ledger_entries (
  id text primary key,
  trip_id text references public.trips(id) on delete cascade,
  driver_id text references public.drivers(id) on delete set null,
  type text not null,
  amount_usd numeric(10,2) not null,
  amount_zwg numeric(12,2) not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. SOS EMERGENCY ALERTS
create table if not exists public.sos_alerts (
  id text primary key,
  trip_id text,
  triggered_by text not null,
  lat numeric(10,6) not null,
  lng numeric(10,6) not null,
  address text,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. ADMIN USERS TABLE (Super Admins, Operations, Dispatchers)
create table if not exists public.admin_users (
  id text primary key,
  name text not null,
  email text not null unique,
  phone text not null,
  role text default 'super_admin',
  department text default 'Executive Operations & Core Infrastructure',
  avatar_url text,
  status text default 'active',
  permissions text[] default array['all_access', 'manage_pricing', 'manage_staff', 'approve_kyc', 'process_payouts', 'manage_sos', 'view_ledgers'],
  is_root_super_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_login_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. PLATFORM SETTINGS & PRICING
create table if not exists public.platform_settings (
  id text primary key default 'default_settings',
  usd_to_zwg_rate numeric(10,4) default 26.50,
  platform_commission_percent numeric(5,2) default 12.0,
  driver_debt_ceiling_usd numeric(10,2) default 15.0,
  sos_police_number text default '+263 242 777777',
  sos_security_hotline text default '+263 77 000 9999',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.riders enable row level security;
alter table public.drivers enable row level security;
alter table public.trips enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.sos_alerts enable row level security;
alter table public.admin_users enable row level security;
alter table public.platform_settings enable row level security;

-- Open Access Policies
create policy "Allow public trips" on public.trips for all using (true);
create policy "Allow public drivers" on public.drivers for all using (true);
create policy "Allow public riders" on public.riders for all using (true);
create policy "Allow public ledger" on public.ledger_entries for all using (true);
create policy "Allow public sos" on public.sos_alerts for all using (true);
create policy "Allow public admin_users" on public.admin_users for all using (true);
create policy "Allow public platform_settings" on public.platform_settings for all using (true);

-- Enable Realtime for Live Driver Radar & Trip Matching
alter publication supabase_realtime add table public.trips;
alter publication supabase_realtime add table public.drivers;
alter publication supabase_realtime add table public.sos_alerts;
alter publication supabase_realtime add table public.admin_users;

-- =============================================================================
-- SEED INITIAL DATA (ROOT SUPER ADMIN & ESSENTIAL SETTINGS)
-- =============================================================================

-- Seed Root Super Admin (seth.bbd@gmail.com)
insert into public.admin_users (
  id, name, email, phone, role, department, avatar_url, status, permissions, is_root_super_admin
) values (
  'adm-root-001',
  'Seth (Platform Founder)',
  'seth.bbd@gmail.com',
  '+263 77 123 4567',
  'super_admin',
  'Executive Operations & Platform Leadership',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'active',
  array['all_access', 'manage_pricing', 'manage_staff', 'approve_kyc', 'process_payouts', 'manage_sos', 'view_ledgers', 'export_financial_reports'],
  true
) on conflict (email) do update set
  role = 'super_admin',
  is_root_super_admin = true,
  permissions = array['all_access', 'manage_pricing', 'manage_staff', 'approve_kyc', 'process_payouts', 'manage_sos', 'view_ledgers', 'export_financial_reports'];

-- Seed Default Platform Settings
insert into public.platform_settings (
  id, usd_to_zwg_rate, platform_commission_percent, driver_debt_ceiling_usd, sos_police_number, sos_security_hotline
) values (
  'default_settings', 26.50, 12.0, 15.00, '+263 242 777777', '+263 77 000 9999'
) on conflict (id) do nothing;

`;
