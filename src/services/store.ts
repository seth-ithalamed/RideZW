import {
  DriverProfile,
  Vehicle,
  RiderProfile,
  RiderAccountStatus,
  RiderAccountType,
  Trip,
  PricingConfig,
  PlatformSettings,
  PermitTypeConfig,
  GovernmentPermit,
  PermitFeeRecord,
  PermitAppeal,
  EnforcementFine,
  PlatformIntegrator,
  PlatformLookupLog,
  PlatformTripReport,
  LedgerEntry,
  PayoutRequest,
  Dispute,
  SosAlert,
  FareOffer,
  PaymentMethod,
  VehicleCategory,
  LocationPoint,
  AdminUser,
  AdminRole,
  NavigationTab,
  CoverageCity,
  ActiveSession,
  SessionTerminationNotice
} from '../types';
import {
  INITIAL_PRICING_CONFIG,
  INITIAL_SETTINGS,
  INITIAL_PERMIT_TYPES,
  INITIAL_GOVERNMENT_PERMITS,
  INITIAL_DRIVERS,
  INITIAL_RIDER,
  INITIAL_RIDERS,
  INITIAL_PLATFORM_INTEGRATORS,
  INITIAL_LOOKUP_LOGS,
  INITIAL_TRIP_REPORTS,
  INITIAL_FINES,
  INITIAL_APPEALS,
  INITIAL_PERMIT_FEES,
  INITIAL_TRIPS,
  INITIAL_LEDGER,
  INITIAL_PAYOUTS,
  INITIAL_DISPUTES,
  INITIAL_SOS,
  INITIAL_ADMIN_USERS,
  INITIAL_COVERAGE_CITIES
} from '../data/mockData';
import {
  isSupabaseConfigured,
  syncTripToSupabase,
  syncDriverToSupabase,
  syncRiderToSupabase,
  syncSosToSupabase,
  syncLedgerEntryToSupabase,
  subscribeToRealtimeUpdates,
  syncSeedDataToSupabase,
  syncUserSessionToSupabase,
  fetchAllDataFromSupabase
} from './supabaseService';
import {
  persistTripToBackend,
  persistDriverToBackend,
  persistRiderToBackend,
  persistSosAlertToBackend,
  persistLedgerEntryToBackend,
  persistSessionToBackend,
  fetchBackendState
} from './apiService';

export interface AuthenticatedUser {
  role: 'rider' | 'driver' | 'admin';
  id: string;
  name: string;
  emailOrPhone: string;
  sessionId: string;
  deviceId: string;
  loginTime: string;
  details?: string;
}

export interface AppState {
  authenticatedUser: AuthenticatedUser | null;
  activeSessions: Record<string, ActiveSession>; // userId -> ActiveSession
  sessionTerminationNotice: SessionTerminationNotice | null;
  rider: RiderProfile;
  riders: RiderProfile[];
  drivers: DriverProfile[];
  adminUsers: AdminUser[];
  coverageCities: CoverageCity[];
  activeTrip: Trip | null;
  tripHistory: Trip[];
  pricingConfigs: PricingConfig[];
  settings: PlatformSettings;
  ledger: LedgerEntry[];
  payouts: PayoutRequest[];
  disputes: Dispute[];
  sosAlerts: SosAlert[];
  
  // Government Permit Registry State (Independent Entity)
  permitTypes: PermitTypeConfig[];
  governmentPermits: GovernmentPermit[];
  permitFees: PermitFeeRecord[];
  permitAppeals: PermitAppeal[];
  enforcementFines: EnforcementFine[];
  platformIntegrators: PlatformIntegrator[];
  platformLookups: PlatformLookupLog[];
  platformTripReports: PlatformTripReport[];
  
  // Offline Enforcer Sync Queue
  offlineFineQueue: EnforcementFine[];
  
  // Simulation Helpers
  activeDriverId: string; // The driver profile currently viewed in the Driver App
  activeTab: NavigationTab;
  lastDbSeedInfo?: {
    timestamp: string;
    seededCount: number;
    message: string;
  } | null;
}

// Client Device Fingerprint Generator (In-Memory / Session only, strictly no localStorage)
let memoryDeviceId: string | null = null;
function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'server_device';
  if (memoryDeviceId) return memoryDeviceId;
  try {
    let deviceId = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('ridezw_device_fingerprint') : null;
    if (!deviceId) {
      deviceId = 'dev_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('ridezw_device_fingerprint', deviceId);
      }
    }
    memoryDeviceId = deviceId;
    return deviceId;
  } catch {
    memoryDeviceId = 'dev_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    return memoryDeviceId;
  }
}

// Broadcast Channel for Instant Multi-Window / Multi-Tab Synchronization
let authBroadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    authBroadcastChannel = new BroadcastChannel('ridezw_auth_session_channel');
  } catch {
    authBroadcastChannel = null;
  }
}

class Store {
  private state: AppState;
  private listeners: Array<(state: AppState) => void> = [];

  constructor() {
    this.state = this.loadInitialState();
    if (typeof window !== 'undefined') {
      this.initSupabaseSync();
      this.initSingleSessionListeners();
      this.hydrateFromDatabase();
    }
  }

  /**
   * Asynchronously hydrates the in-memory store directly from Supabase PostgreSQL & Backend API.
   * Eliminates localStorage dependency while maintaining instant load times.
   */
  public async hydrateFromDatabase() {
    try {
      // 1. Try fetching directly from Supabase
      if (isSupabaseConfigured()) {
        const supabaseData = await fetchAllDataFromSupabase();
        if (supabaseData) {
          if (supabaseData.trips && supabaseData.trips.length > 0) {
            this.state.tripHistory = supabaseData.trips;
            // Check for currently active/in-progress trip
            const liveActive = supabaseData.trips.find((t) =>
              ['requested', 'accepted', 'in_progress', 'counter_offered'].includes(t.status)
            );
            if (liveActive) {
              this.state.activeTrip = liveActive;
            }
          }
          if (supabaseData.drivers && supabaseData.drivers.length > 0) {
            this.state.drivers = supabaseData.drivers;
          }
          if (supabaseData.riders && supabaseData.riders.length > 0) {
            this.state.riders = supabaseData.riders;
          }
          if (supabaseData.sosAlerts && supabaseData.sosAlerts.length > 0) {
            this.state.sosAlerts = supabaseData.sosAlerts;
          }
          if (supabaseData.ledger && supabaseData.ledger.length > 0) {
            this.state.ledger = supabaseData.ledger;
          }
          if (supabaseData.settings) {
            this.state.settings = { ...this.state.settings, ...supabaseData.settings };
          }
          if (supabaseData.coverageCities && supabaseData.coverageCities.length > 0) {
            this.state.coverageCities = supabaseData.coverageCities;
          }
          if (supabaseData.activeSessions) {
            this.state.activeSessions = supabaseData.activeSessions;
          }
          this.notify();
          return;
        }
      }

      // 2. Fallback to Express backend state API
      const backendRes = await fetchBackendState();
      if (backendRes && backendRes.data) {
        const b = backendRes.data;
        if (b.trips && b.trips.length > 0) {
          this.state.tripHistory = b.trips;
        }
        if (b.drivers && b.drivers.length > 0) {
          this.state.drivers = b.drivers;
        }
        if (b.riders && b.riders.length > 0) {
          this.state.riders = b.riders;
        }
        if (b.sosAlerts && b.sosAlerts.length > 0) {
          this.state.sosAlerts = b.sosAlerts;
        }
        if (b.ledger && b.ledger.length > 0) {
          this.state.ledger = b.ledger;
        }
        if (b.settings) {
          this.state.settings = { ...this.state.settings, ...b.settings };
        }
        if (b.coverageCities && b.coverageCities.length > 0) {
          this.state.coverageCities = b.coverageCities;
        }
        this.notify();
      }
    } catch (err) {
      console.warn('[DB Hydration] Notice: using baseline seed in memory:', err);
    }
  }

  private initSingleSessionListeners() {
    // 1. Listen for BroadcastChannel messages from other tabs/windows
    if (authBroadcastChannel) {
      authBroadcastChannel.onmessage = (event) => {
        if (event.data && event.data.type === 'NEW_SESSION_LOGIN') {
          const { userId, newSessionId, userName } = event.data;
          const currentAuth = this.state.authenticatedUser;
          const localSessionId = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('ridezw_tab_session_id') : null;

          if (currentAuth && currentAuth.id === userId && localSessionId && localSessionId !== newSessionId) {
            // Another device/tab has logged into this credential!
            this.handleSessionRevocation(userId, userName || currentAuth.name, 'Account was logged into on another device or window.');
          }
        }
      };
    }

    // 2. Heartbeat / Window focus session validation
    window.addEventListener('focus', () => {
      this.verifyCurrentSession();
    });
  }

  private verifyCurrentSession(): boolean {
    const currentAuth = this.state.authenticatedUser;
    if (!currentAuth) return true;

    const localSessionId = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('ridezw_tab_session_id') : null;
    const activeSession = this.state.activeSessions?.[currentAuth.id];

    if (localSessionId && activeSession && activeSession.sessionId !== localSessionId) {
      this.handleSessionRevocation(currentAuth.id, currentAuth.name, 'Single instance login violation: account signed in elsewhere.');
      return false;
    }
    return true;
  }

  public handleSessionRevocation(userId: string, userName: string, reason: string) {
    this.state.authenticatedUser = null;
    this.state.activeTab = 'landing';
    this.state.sessionTerminationNotice = {
      userId,
      userName,
      terminatedAt: new Date().toISOString(),
      reason: reason || 'Your account was signed in on another device. For security and regulatory compliance, RideZW strictly enforces a single active session per credential.'
    };
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('ridezw_tab_session_id');
        sessionStorage.removeItem('ridezw_tab_user_id');
      } catch {}
    }
    this.saveState();
  }

  public clearSessionNotice() {
    this.state.sessionTerminationNotice = null;
    this.saveState();
  }

  private createAndEnforceSession(
    userId: string,
    role: 'rider' | 'driver' | 'admin',
    name: string,
    emailOrPhone: string,
    details?: string
  ): AuthenticatedUser {
    const sessionId = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 10);
    const deviceId = getOrCreateDeviceId();
    const loginTime = new Date().toISOString();

    const user: AuthenticatedUser = {
      role,
      id: userId,
      name,
      emailOrPhone,
      sessionId,
      deviceId,
      loginTime,
      details
    };

    const sessionObj: ActiveSession = {
      userId,
      role,
      sessionId,
      deviceId,
      loginTime,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Web Browser'
    };

    if (!this.state.activeSessions) {
      this.state.activeSessions = {};
    }
    this.state.activeSessions[userId] = sessionObj;
    this.state.authenticatedUser = user;
    this.state.sessionTerminationNotice = null;

    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('ridezw_tab_session_id', sessionId);
        sessionStorage.setItem('ridezw_tab_user_id', userId);
      } catch {}

      // Broadcast new login to invalidate any older session on other devices/windows
      try {
        authBroadcastChannel?.postMessage({
          type: 'NEW_SESSION_LOGIN',
          userId,
          newSessionId: sessionId,
          deviceId,
          loginTime,
          userName: name
        });
      } catch {}
    }

    // Sync active session to Backend API & Supabase
    persistSessionToBackend(sessionObj).catch(() => {});
    syncUserSessionToSupabase(sessionObj).catch(() => {});

    return user;
  }

  private initSupabaseSync() {
    if (!isSupabaseConfigured()) return;

    try {
      subscribeToRealtimeUpdates({
        onTripChange: (payload) => {
          if (!payload || !payload.new) return;
          const updated = payload.new;
          if (this.state.activeTrip && this.state.activeTrip.id === updated.id) {
            this.state.activeTrip = {
              ...this.state.activeTrip,
              status: updated.status,
              driverId: updated.driver_id || this.state.activeTrip.driverId,
              agreedFareUSD: Number(updated.agreed_fare_usd) || this.state.activeTrip.agreedFareUSD,
              paymentStatus: updated.payment_status || this.state.activeTrip.paymentStatus
            };
            this.saveState();
          }
        },
        onDriverChange: (payload) => {
          if (!payload || !payload.new) return;
          const d = payload.new;
          const idx = this.state.drivers.findIndex((item) => item.id === d.id);
          if (idx >= 0) {
            this.state.drivers[idx] = {
              ...this.state.drivers[idx],
              isOnline: Boolean(d.is_online),
              currentLat: Number(d.current_lat) || this.state.drivers[idx].currentLat,
              currentLng: Number(d.current_lng) || this.state.drivers[idx].currentLng,
              walletBalance: Number(d.wallet_balance_usd) || this.state.drivers[idx].walletBalance
            };
            this.saveState();
          }
        },
        onSessionChange: (payload) => {
          if (!payload || !payload.new) return;
          const updated = payload.new;
          const currentAuth = this.state.authenticatedUser;
          const localSessionId = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('ridezw_tab_session_id') : null;

          if (currentAuth && currentAuth.id === updated.user_id && localSessionId && localSessionId !== updated.session_id) {
            this.handleSessionRevocation(currentAuth.id, currentAuth.name, 'Remote device signed into this account.');
          }
        }
      });
    } catch (err) {
      console.warn('Supabase realtime init warning:', err);
    }
  }

  private loadInitialState(): AppState {
    // Clear any residual localStorage cache from prior iterations
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('ridezw_state_v1');
        localStorage.removeItem('ridezw_device_fingerprint');
      } catch {}
    }

    return {
      authenticatedUser: null,
      activeSessions: {},
      sessionTerminationNotice: null,
      rider: INITIAL_RIDER,
      riders: INITIAL_RIDERS,
      drivers: INITIAL_DRIVERS,
      adminUsers: INITIAL_ADMIN_USERS,
      coverageCities: INITIAL_COVERAGE_CITIES,
      activeTrip: null,
      tripHistory: INITIAL_TRIPS,
      pricingConfigs: INITIAL_PRICING_CONFIG,
      settings: INITIAL_SETTINGS,
      ledger: INITIAL_LEDGER,
      payouts: INITIAL_PAYOUTS,
      disputes: INITIAL_DISPUTES,
      sosAlerts: INITIAL_SOS,
      permitTypes: INITIAL_PERMIT_TYPES,
      governmentPermits: INITIAL_GOVERNMENT_PERMITS,
      permitFees: INITIAL_PERMIT_FEES,
      permitAppeals: INITIAL_APPEALS,
      enforcementFines: INITIAL_FINES,
      platformIntegrators: INITIAL_PLATFORM_INTEGRATORS,
      platformLookups: INITIAL_LOOKUP_LOGS,
      platformTripReports: INITIAL_TRIP_REPORTS,
      offlineFineQueue: [],
      activeDriverId: INITIAL_DRIVERS[0]?.id || '',
      activeTab: 'landing',
      lastDbSeedInfo: null
    };
  }

  private saveState() {
    // Strictly in-memory & remote Supabase / Backend API persistence (no localStorage write)
    if (this.state.activeTrip) {
      persistTripToBackend(this.state.activeTrip).catch(() => {});
      if (isSupabaseConfigured()) {
        syncTripToSupabase(this.state.activeTrip).catch(() => {});
      }
    }
    this.notify();
  }

  private notify() {
    const cloned = { ...this.state };
    this.listeners.forEach((listener) => listener(cloned));
  }

  public subscribe(listener: (state: AppState) => void): () => void {
    this.listeners.push(listener);
    listener({ ...this.state });
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public getState(): AppState {
    return { ...this.state };
  }

  public getAuthenticatedUser(): AuthenticatedUser | null {
    return this.state.authenticatedUser || null;
  }

  public logout() {
    const currentAuth = this.state.authenticatedUser;
    if (currentAuth && this.state.activeSessions) {
      delete this.state.activeSessions[currentAuth.id];
    }
    this.state.authenticatedUser = null;
    this.state.activeTab = 'landing';
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('ridezw_tab_session_id');
        sessionStorage.removeItem('ridezw_tab_user_id');
      } catch {}
    }
    this.saveState();
  }

  public setActiveTab(tab: AppState['activeTab']) {
    this.state.activeTab = tab;
    this.saveState();
  }

  /**
   * Writes initial seed data into the database if the database is missing any seed records.
   * Auto-invoked when the super admin logs in.
   */
  public seedDatabaseIfEmpty(): { seeded: boolean; seededCounts: Record<string, number>; message: string } {
    let wasSeeded = false;
    const counts: Record<string, number> = {
      cities: 0,
      pricing: 0,
      permits: 0,
      settings: 0,
      adminUsers: 0
    };

    // 1. Coverage Cities
    if (!this.state.coverageCities || !Array.isArray(this.state.coverageCities) || this.state.coverageCities.length === 0) {
      this.state.coverageCities = [...INITIAL_COVERAGE_CITIES];
      counts.cities = INITIAL_COVERAGE_CITIES.length;
      wasSeeded = true;
    }

    // 2. Pricing Configs
    if (!this.state.pricingConfigs || !Array.isArray(this.state.pricingConfigs) || this.state.pricingConfigs.length === 0) {
      this.state.pricingConfigs = [...INITIAL_PRICING_CONFIG];
      counts.pricing = INITIAL_PRICING_CONFIG.length;
      wasSeeded = true;
    }

    // 3. Permit Types
    if (!this.state.permitTypes || !Array.isArray(this.state.permitTypes) || this.state.permitTypes.length === 0) {
      this.state.permitTypes = [...INITIAL_PERMIT_TYPES];
      counts.permits = INITIAL_PERMIT_TYPES.length;
      wasSeeded = true;
    }

    // 4. Platform Settings
    if (!this.state.settings || !this.state.settings.exchangeRateUSDToZWG) {
      this.state.settings = { ...INITIAL_SETTINGS };
      counts.settings = 1;
      wasSeeded = true;
    }

    // 5. Admin Users
    if (!this.state.adminUsers || !Array.isArray(this.state.adminUsers) || this.state.adminUsers.length === 0) {
      this.state.adminUsers = [...INITIAL_ADMIN_USERS];
      counts.adminUsers = INITIAL_ADMIN_USERS.length;
      wasSeeded = true;
    }

    // Sync seed data to Backend Server API & Supabase DB
    fetch('/api/seed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coverageCities: this.state.coverageCities,
        pricingConfigs: this.state.pricingConfigs,
        permitTypes: this.state.permitTypes,
        settings: this.state.settings,
        adminUsers: this.state.adminUsers
      })
    }).catch(() => {});

    if (isSupabaseConfigured()) {
      syncSeedDataToSupabase({
        coverageCities: this.state.coverageCities,
        pricingConfigs: this.state.pricingConfigs,
        permitTypes: this.state.permitTypes,
        settings: this.state.settings,
        adminUsers: this.state.adminUsers
      }).then((res) => {
        console.log('⚡ Database Seeding status:', res.message);
      }).catch(() => {});
    }

    if (wasSeeded) {
      this.state.lastDbSeedInfo = {
        timestamp: new Date().toISOString(),
        seededCount: Object.values(counts).reduce((a, b) => a + b, 0),
        message: `Seed records initialized into DB (${counts.cities} cities, ${counts.pricing} fare matrix tiers, ${counts.permits} permit classes, ${counts.settings} settings profile).`
      };
      this.saveState();
    }

    return {
      seeded: wasSeeded,
      seededCounts: counts,
      message: wasSeeded
        ? `Seed data initialized and written to DB (${counts.cities} cities, ${counts.pricing} fare classes).`
        : 'Database already populated with seed records.'
    };
  }

  public loginAsRider(phoneOrEmail: string): RiderProfile {
    let rider = this.state.riders.find((r) => r.phone === phoneOrEmail || r.email === phoneOrEmail);
    if (!rider) {
      // Create active rider profile if not yet in directory
      rider = {
        id: `rdr-${Date.now().toString().slice(-6)}`,
        name: 'Tafadzwa (Rider)',
        phone: phoneOrEmail.startsWith('+') ? phoneOrEmail : `+263 ${phoneOrEmail}`,
        email: `${phoneOrEmail.replace(/\D/g, '')}@rider.ride.co.zw`,
        nationalId: `63-${Math.floor(Math.random() * 899999 + 100000)}-Z-42`,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        rating: 5.0,
        totalTrips: 0,
        emergencyContactName: 'Emergency Hotline',
        emergencyContactPhone: '+263 77 000 9999',
        preferredLanguage: 'en',
        preferredPaymentMethod: 'ecocash',
        referralCode: `RIDE-ZW${Math.floor(Math.random() * 899 + 100)}`,
        walletBalance: 25.00,
        city: 'Harare',
        status: 'active',
        accountType: 'standard',
        registeredAt: new Date().toISOString()
      };
      this.state.riders.unshift(rider);
    }
    this.state.rider = rider;
    
    // Single instance session enforcement
    this.createAndEnforceSession(
      rider.id,
      'rider',
      rider.name,
      rider.phone
    );

    this.state.activeTab = 'rider';
    this.saveState();
    return rider;
  }

  public loginAsDriver(phoneOrPlate: string): DriverProfile {
    const cleanInput = phoneOrPlate.trim().toLowerCase();
    let driver = this.state.drivers.find((d) => {
      const pClean = (d.phone || '').toLowerCase().replace(/\s+/g, '');
      const plateClean = (d.vehicle?.plateNumber || '').toLowerCase().replace(/[\s-]+/g, '');
      const searchClean = cleanInput.replace(/[\s-]+/g, '');
      const searchDirect = cleanInput.replace(/\s+/g, '');
      return (
        d.phone.toLowerCase() === cleanInput ||
        pClean === searchDirect ||
        d.vehicle.plateNumber.toLowerCase() === cleanInput ||
        plateClean === searchClean ||
        d.name.toLowerCase() === cleanInput
      );
    });

    if (!driver) {
      const isPlate = /^[A-Z]{3}-?[0-9]{3,4}$/i.test(cleanInput);
      const newDriverId = `drv-${Date.now().toString().slice(-6)}`;
      const derivedName = isPlate
        ? `Driver (${cleanInput.toUpperCase()})`
        : cleanInput.startsWith('+') || /^\d+$/.test(cleanInput)
        ? `Driver (${phoneOrPlate.trim()})`
        : phoneOrPlate.trim();

      driver = {
        id: newDriverId,
        name: derivedName,
        phone: isPlate ? '+263 77 123 4567' : phoneOrPlate.trim(),
        nationalId: `63-${Math.floor(Math.random() * 899999 + 100000)}-Z-42`,
        email: 'driver@ridezw.co.zw',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        kycStatus: 'pending',
        vehicle: {
          id: `veh-${Date.now().toString().slice(-6)}`,
          driverId: newDriverId,
          make: 'Toyota',
          model: 'Passo',
          year: 2020,
          color: 'Silver',
          plateNumber: isPlate ? phoneOrPlate.trim().toUpperCase() : `AFE-${Math.floor(Math.random() * 8999 + 1000)}`,
          category: 'economy',
          capacity: 4
        },
        rating: 5.0,
        totalTrips: 0,
        isOnline: false,
        currentLat: -17.8292,
        currentLng: 31.0522,
        city: 'Harare',
        subscriptionTier: 'commission',
        walletBalance: 0.00,
        cashDebtCeiling: 15.00,
        isBlockedDueToDebt: false,
        documents: [],
        governmentPermitStatus: 'not_found',
        registeredAt: new Date().toISOString()
      };
      this.state.drivers.unshift(driver);
    }
    this.state.activeDriverId = driver.id;

    // Single instance session enforcement
    this.createAndEnforceSession(
      driver.id,
      'driver',
      driver.name,
      driver.phone,
      driver.vehicle.plateNumber
    );

    this.state.activeTab = 'driver';
    this.saveState();
    return driver;
  }

  public loginAsAdmin(email: string, password?: string): AdminUser {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Password must not be empty
    if (!password || password.trim() === '') {
      throw new Error('Please enter your administrator security password.');
    }

    let admin = this.state.adminUsers.find(
      (a) => a.email.toLowerCase() === cleanEmail
    );
    if (!admin) {
      // If seth.bbd@gmail.com or other founder logs in, ensure root admin
      admin = {
        id: `adm-${Date.now().toString().slice(-6)}`,
        name: cleanEmail.includes('seth') ? 'Seth (Platform Founder)' : 'Platform Administrator',
        email: cleanEmail,
        phone: '+263 77 123 4567',
        role: 'super_admin',
        department: 'Executive Operations & Infrastructure',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        status: 'active',
        permissions: ['all_access', 'manage_pricing', 'manage_staff', 'approve_kyc', 'process_payouts', 'manage_sos', 'view_ledgers', 'export_financial_reports'],
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        isRootSuperAdmin: true
      };
      this.state.adminUsers.unshift(admin);
    }
    admin.lastLoginAt = new Date().toISOString();

    // 2. Check and write seed data to DB if missing
    this.seedDatabaseIfEmpty();

    // 3. Single instance session enforcement
    this.createAndEnforceSession(
      admin.id,
      'admin',
      admin.name,
      admin.email,
      'Root Super-Admin'
    );

    this.state.activeTab = 'admin';
    this.saveState();
    return admin;
  }

  public registerRiderAccount(params: {
    name: string;
    phone: string;
    email?: string;
    city?: string;
  }): RiderProfile {
    const newRider: RiderProfile = {
      id: `rdr-${Date.now().toString().slice(-6)}`,
      name: params.name,
      phone: params.phone,
      email: params.email || `${params.name.toLowerCase().replace(/\s+/g, '.')}@example.co.zw`,
      nationalId: `63-${Math.floor(Math.random() * 899999 + 100000)}-Z-42`,
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      rating: 5.0,
      totalTrips: 0,
      emergencyContactName: 'Next of Kin',
      emergencyContactPhone: '+263 77 000 9999',
      preferredLanguage: 'en',
      preferredPaymentMethod: 'ecocash',
      referralCode: `RIDE-${params.name.slice(0, 3).toUpperCase()}${Math.floor(Math.random() * 89 + 10)}`,
      walletBalance: 0,
      city: params.city || 'Nationwide',
      status: 'active',
      accountType: 'standard',
      registeredAt: new Date().toISOString()
    };

    this.state.riders.unshift(newRider);
    this.state.rider = newRider;
    this.createAndEnforceSession(
      newRider.id,
      'rider',
      newRider.name,
      newRider.phone
    );
    this.state.activeTab = 'rider';
    persistRiderToBackend(newRider).catch(() => {});
    if (isSupabaseConfigured()) {
      syncRiderToSupabase(newRider).catch(() => {});
    }
    this.saveState();
    return newRider;
  }

  public setActiveDriver(driverId: string) {
    this.state.activeDriverId = driverId;
    this.saveState();
  }

  public resetAllData() {
    this.state = this.loadInitialState();
    this.notify();
  }

  // -------------------------------------------------------------
  // RIDE LIFECYCLE & IN-DRIVE FARE NEGOTIATION
  // -------------------------------------------------------------

  public requestRide(params: {
    pickup: LocationPoint;
    destination: LocationPoint;
    category: VehicleCategory;
    proposedFareUSD: number;
    paymentMethod: PaymentMethod;
  }) {
    const pricing = this.state.pricingConfigs.find((p) => p.category === params.category) || this.state.pricingConfigs[0];
    
    // Calculate approximate distance
    const dLat = Math.abs(params.pickup.lat - params.destination.lat) * 111;
    const dLng = Math.abs(params.pickup.lng - params.destination.lng) * 111 * Math.cos((params.pickup.lat * Math.PI) / 180);
    const distanceKm = Number((Math.sqrt(dLat * dLat + dLng * dLng) + 1.2).toFixed(1));
    const estimatedDurationMin = Math.max(8, Math.round(distanceKm * 2.2));
    
    const rawEstimate = pricing.baseFareUSD + distanceKm * pricing.perKmUSD + estimatedDurationMin * pricing.perMinuteUSD;
    // Always round up calculated fees to next whole dollar unit
    const upfrontEstimateUSD = Math.max(Math.ceil(pricing.baseFareUSD), Math.ceil(rawEstimate));

    const newTrip: Trip = {
      id: `trp-${Date.now()}`,
      riderId: this.state.rider.id,
      riderName: this.state.rider.name,
      riderPhone: this.state.rider.phone,
      riderAvatar: this.state.rider.avatarUrl,
      pickup: params.pickup,
      destination: params.destination,
      category: params.category,
      distanceKm,
      estimatedDurationMin,
      upfrontEstimateUSD,
      proposedFareUSD: params.proposedFareUSD,
      agreedFareUSD: params.proposedFareUSD,
      offers: [],
      status: 'negotiating',
      paymentMethod: params.paymentMethod,
      paymentStatus: 'pending',
      commissionOwedUSD: 0,
      cashLevyOwedUSD: 0,
      createdAt: new Date().toISOString(),
      routeProgress: 0
    };

    this.state.activeTrip = newTrip;
    this.saveState();

    // Auto-generate simulated driver offers from other available drivers within 2-4 seconds
    setTimeout(() => {
      this.simulateIncomingDriverOffers();
    }, 1800);
  }

  private simulateIncomingDriverOffers() {
    if (!this.state.activeTrip || this.state.activeTrip.status !== 'negotiating') return;

    const availableDrivers = this.state.drivers.filter(
      (d) => d.isOnline && !d.isBlockedDueToDebt && d.id !== this.state.activeDriverId
    );

    availableDrivers.slice(0, 2).forEach((driver, idx) => {
      const isCounter = idx % 2 === 1;
      const offeredAmount = isCounter
        ? Math.ceil(this.state.activeTrip!.proposedFareUSD + 2.00)
        : this.state.activeTrip!.proposedFareUSD;

      const offer: FareOffer = {
        id: `off-${Date.now()}-${idx}`,
        tripId: this.state.activeTrip!.id,
        driverId: driver.id,
        driverName: driver.name,
        driverAvatar: driver.avatarUrl,
        driverRating: driver.rating,
        driverTotalTrips: driver.totalTrips,
        vehicleModel: `${driver.vehicle.make} ${driver.vehicle.model}`,
        vehiclePlate: driver.vehicle.plateNumber,
        offeredAmount,
        etaMinutes: 3 + idx * 2,
        distanceKm: Number((1.2 + idx * 0.8).toFixed(1)),
        createdAt: new Date().toISOString(),
        status: 'pending'
      };

      if (this.state.activeTrip && !this.state.activeTrip.offers.some((o) => o.driverId === driver.id)) {
        this.state.activeTrip.offers.push(offer);
        this.saveState();
      }
    });
  }

  public driverSubmitOffer(driverId: string, offeredAmount: number) {
    if (!this.state.activeTrip || this.state.activeTrip.status !== 'negotiating') return;

    const driver = this.state.drivers.find((d) => d.id === driverId);
    if (!driver) return;

    // Check if driver is blocked due to unpaid cash debt
    if (driver.isBlockedDueToDebt) {
      throw new Error('Driver is blocked from taking rides due to unsettled cash debt exceeding ceiling.');
    }
    // Note: Drivers are permitted to operate freely without a mandatory permit restriction

    const existingOfferIndex = this.state.activeTrip.offers.findIndex((o) => o.driverId === driverId);
    const offer: FareOffer = {
      id: `off-${Date.now()}`,
      tripId: this.state.activeTrip.id,
      driverId: driver.id,
      driverName: driver.name,
      driverAvatar: driver.avatarUrl,
      driverRating: driver.rating,
      driverTotalTrips: driver.totalTrips,
      vehicleModel: `${driver.vehicle.make} ${driver.vehicle.model}`,
      vehiclePlate: driver.vehicle.plateNumber,
      offeredAmount,
      etaMinutes: 4,
      distanceKm: 1.8,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    if (existingOfferIndex >= 0) {
      this.state.activeTrip.offers[existingOfferIndex] = offer;
    } else {
      this.state.activeTrip.offers.push(offer);
    }

    this.saveState();
  }

  public riderAcceptOffer(offerId: string) {
    if (!this.state.activeTrip) return;

    const offer = this.state.activeTrip.offers.find((o) => o.id === offerId);
    if (!offer) return;

    const driver = this.state.drivers.find((d) => d.id === offer.driverId);
    if (!driver) return;

    offer.status = 'accepted_by_rider';
    this.state.activeTrip.offers.forEach((o) => {
      if (o.id !== offerId) o.status = 'declined';
    });

    this.state.activeTrip.driverId = driver.id;
    this.state.activeTrip.driverName = driver.name;
    this.state.activeTrip.driverPhone = driver.phone;
    this.state.activeTrip.driverAvatar = driver.avatarUrl;
    this.state.activeTrip.driverVehicle = driver.vehicle;
    this.state.activeTrip.agreedFareUSD = offer.offeredAmount;
    this.state.activeTrip.status = 'driver_arriving';
    this.state.activeTrip.routeProgress = 15;

    this.saveState();
  }

  public driverMarkArrived() {
    if (!this.state.activeTrip) return;
    this.state.activeTrip.status = 'arrived';
    this.state.activeTrip.routeProgress = 30;
    this.saveState();
  }

  public startTrip() {
    if (!this.state.activeTrip) return;
    this.state.activeTrip.status = 'in_progress';
    this.state.activeTrip.startedAt = new Date().toISOString();
    this.state.activeTrip.routeProgress = 50;
    this.saveState();
  }

  public updateTripProgress(progress: number) {
    if (!this.state.activeTrip) return;
    this.state.activeTrip.routeProgress = Math.min(100, Math.max(0, progress));
    this.saveState();
  }

  public completeTrip(collectedCashAmount?: number) {
    if (!this.state.activeTrip) return;

    const trip = this.state.activeTrip;
    const driver = this.state.drivers.find((d) => d.id === trip.driverId);
    const pricing = this.state.pricingConfigs.find((p) => p.category === trip.category) || this.state.pricingConfigs[0];

    trip.status = 'completed';
    trip.completedAt = new Date().toISOString();
    trip.paymentStatus = 'paid';
    trip.routeProgress = 100;

    if (driver) {
      driver.totalTrips += 1;
      const isSubscribed = driver.subscriptionTier !== 'commission' && driver.subscriptionExpiry && new Date(driver.subscriptionExpiry) > new Date();

      if (trip.paymentMethod === 'cash') {
        // Cash payment: Rider pays driver directly. Platform accrues cash levy debt on driver's ledger.
        const levyPercent = isSubscribed ? 0 : pricing.cashLevyPercentage / 100;
        const cashLevy = Number((trip.agreedFareUSD * levyPercent).toFixed(2));
        trip.cashLevyOwedUSD = cashLevy;

        if (cashLevy > 0) {
          const newBalance = Number((driver.walletBalance - cashLevy).toFixed(2));
          driver.walletBalance = newBalance;

          // Record append-only ledger entry
          const ledgerEntry: LedgerEntry = {
            id: `led-${Date.now()}`,
            driverId: driver.id,
            tripId: trip.id,
            entryType: 'cash_trip_levy_debit',
            amount: -cashLevy,
            balanceAfter: newBalance,
            currency: 'USD',
            description: `${pricing.cashLevyPercentage}% Cash-Trip Platform Levy for $${trip.agreedFareUSD.toFixed(2)} fare (#${trip.id})`,
            referenceId: `LEVY-${trip.id}`,
            status: 'posted',
            createdAt: new Date().toISOString()
          };
          this.state.ledger.unshift(ledgerEntry);

          // Debt ceiling check: if negative balance exceeds ceiling, block driver
          if (newBalance < -this.state.settings.driverDebtCeilingUSD) {
            driver.isBlockedDueToDebt = true;
            driver.isOnline = false;
          }
        }
      } else {
        // In-app Digital payment (EcoCash, OneMoney, InnBucks, Card):
        // Platform collects money, takes commission, credits driver balance.
        const commissionPercent = isSubscribed ? 0 : pricing.commissionPercentage / 100;
        const commission = Number((trip.agreedFareUSD * commissionPercent).toFixed(2));
        const netEarnings = Number((trip.agreedFareUSD - commission).toFixed(2));
        trip.commissionOwedUSD = commission;

        // Credit full fare
        let currentBal = Number((driver.walletBalance + trip.agreedFareUSD).toFixed(2));
        const fareCredit: LedgerEntry = {
          id: `led-${Date.now()}-1`,
          driverId: driver.id,
          tripId: trip.id,
          entryType: 'trip_fare_credit',
          amount: trip.agreedFareUSD,
          balanceAfter: currentBal,
          currency: 'USD',
          description: `Fare payment for Trip #${trip.id} via ${trip.paymentMethod.toUpperCase()}`,
          referenceId: `PAY-${trip.id}`,
          paymentMethod: trip.paymentMethod,
          status: 'posted',
          createdAt: new Date().toISOString()
        };
        this.state.ledger.unshift(fareCredit);

        // Debit platform commission
        if (commission > 0) {
          currentBal = Number((currentBal - commission).toFixed(2));
          const commDebit: LedgerEntry = {
            id: `led-${Date.now()}-2`,
            driverId: driver.id,
            tripId: trip.id,
            entryType: 'platform_commission_debit',
            amount: -commission,
            balanceAfter: currentBal,
            currency: 'USD',
            description: `${pricing.commissionPercentage}% Platform Commission for Trip #${trip.id}`,
            referenceId: `COM-${trip.id}`,
            status: 'posted',
            createdAt: new Date().toISOString()
          };
          this.state.ledger.unshift(commDebit);
        }

        driver.walletBalance = currentBal;
        // If driver was blocked and has now recovered past negative debt ceiling, unblock them
        if (driver.isBlockedDueToDebt && driver.walletBalance >= -this.state.settings.driverDebtCeilingUSD) {
          driver.isBlockedDueToDebt = false;
        }
      }
    }

    // Move to history
    this.state.tripHistory.unshift({ ...trip });
    this.state.activeTrip = null;
    this.saveState();
  }

  public cancelTrip(reason: string) {
    if (!this.state.activeTrip) return;
    this.state.activeTrip.status = 'cancelled';
    this.state.activeTrip.cancelledAt = new Date().toISOString();
    this.state.activeTrip.cancellationReason = reason;
    this.state.tripHistory.unshift({ ...this.state.activeTrip });
    this.state.activeTrip = null;
    this.saveState();
  }

  public rateTrip(tripId: string, rating: number, comment?: string, role: 'rider' | 'driver' = 'rider') {
    const trip = this.state.tripHistory.find((t) => t.id === tripId);
    if (!trip) return;

    if (role === 'rider') {
      trip.riderRating = rating;
      trip.riderComment = comment;
      // Update driver rating average
      if (trip.driverId) {
        const driver = this.state.drivers.find((d) => d.id === trip.driverId);
        if (driver) {
          driver.rating = Number(((driver.rating * driver.totalTrips + rating) / (driver.totalTrips + 1)).toFixed(2));
        }
      }
    } else {
      trip.driverRating = rating;
      trip.driverComment = comment;
    }

    this.saveState();
  }

  // -------------------------------------------------------------
  // FINANCIAL LEDGER, TOP-UP, SUBSCRIPTIONS & PAYOUTS
  // -------------------------------------------------------------

  public driverSettleDebt(driverId: string, amountUSD: number, method: PaymentMethod) {
    const driver = this.state.drivers.find((d) => d.id === driverId);
    if (!driver) return;

    const newBalance = Number((driver.walletBalance + amountUSD).toFixed(2));
    driver.walletBalance = newBalance;

    if (driver.isBlockedDueToDebt && newBalance >= -this.state.settings.driverDebtCeilingUSD) {
      driver.isBlockedDueToDebt = false;
    }

    const entry: LedgerEntry = {
      id: `led-${Date.now()}`,
      driverId: driver.id,
      entryType: 'driver_topup_credit',
      amount: amountUSD,
      balanceAfter: newBalance,
      currency: 'USD',
      description: `Debt settlement & wallet top-up via ${method.toUpperCase()}`,
      referenceId: `TOPUP-${Date.now()}`,
      paymentMethod: method,
      status: 'posted',
      createdAt: new Date().toISOString()
    };

    this.state.ledger.unshift(entry);
    this.saveState();
  }

  public buySubscription(driverId: string, tier: 'weekly_pass' | 'monthly_pass') {
    const driver = this.state.drivers.find((d) => d.id === driverId);
    if (!driver) return;

    const cost = tier === 'weekly_pass' ? this.state.settings.subscriptionWeeklyUSD : this.state.settings.subscriptionMonthlyUSD;
    const days = tier === 'weekly_pass' ? 7 : 30;
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + days);

    const newBalance = Number((driver.walletBalance - cost).toFixed(2));
    driver.walletBalance = newBalance;
    driver.subscriptionTier = tier;
    driver.subscriptionExpiry = expiry.toISOString().split('T')[0];

    const entry: LedgerEntry = {
      id: `led-${Date.now()}`,
      driverId: driver.id,
      entryType: 'subscription_fee_debit',
      amount: -cost,
      balanceAfter: newBalance,
      currency: 'USD',
      description: `Purchase of ${tier === 'weekly_pass' ? 'Weekly' : 'Monthly'} Unlimited Pass ($${cost.toFixed(2)})`,
      referenceId: `SUB-${Date.now()}`,
      status: 'posted',
      createdAt: new Date().toISOString()
    };

    this.state.ledger.unshift(entry);
    this.saveState();
  }

  public requestPayout(params: {
    driverId: string;
    amountUSD: number;
    method: 'ecocash' | 'onemoney' | 'innbucks' | 'bank_transfer';
    accountNumber: string;
    accountName: string;
  }) {
    const driver = this.state.drivers.find((d) => d.id === params.driverId);
    if (!driver) throw new Error('Driver not found');

    if (params.amountUSD <= 0) {
      throw new Error('Please enter a valid positive withdrawal amount.');
    }
    if (driver.walletBalance <= 0) {
      throw new Error(`Cannot withdraw: Your current wallet balance is $${driver.walletBalance.toFixed(2)}. Minimum positive balance required.`);
    }
    if (params.amountUSD > driver.walletBalance) {
      throw new Error(`Insufficient wallet balance: Requested $${params.amountUSD.toFixed(2)}, but available balance is only $${driver.walletBalance.toFixed(2)}.`);
    }

    const autoApprove = params.amountUSD <= this.state.settings.autoApprovePayoutUnderUSD;
    const payout: PayoutRequest = {
      id: `pay-${Date.now()}`,
      driverId: driver.id,
      driverName: driver.name,
      amountUSD: params.amountUSD,
      method: params.method,
      accountNumber: params.accountNumber,
      accountName: params.accountName,
      status: autoApprove ? 'paid' : 'requested',
      requestedAt: new Date().toISOString(),
      processedAt: autoApprove ? new Date().toISOString() : undefined,
      transactionRef: autoApprove ? `TX-${params.method.toUpperCase()}-${Math.floor(Math.random() * 900000 + 100000)}` : undefined,
      reviewedBy: autoApprove ? 'Auto-Approved (<$20 threshold check)' : undefined
    };

    // Deduct immediately
    const newBalance = Number((driver.walletBalance - params.amountUSD).toFixed(2));
    driver.walletBalance = newBalance;

    const entry: LedgerEntry = {
      id: `led-${Date.now()}`,
      driverId: driver.id,
      entryType: 'payout_withdrawal_debit',
      amount: -params.amountUSD,
      balanceAfter: newBalance,
      currency: 'USD',
      description: `Payout withdrawal request via ${params.method.toUpperCase()} (${params.accountNumber})`,
      referenceId: payout.id,
      status: autoApprove ? 'posted' : 'pending',
      createdAt: new Date().toISOString()
    };

    this.state.payouts.unshift(payout);
    this.state.ledger.unshift(entry);
    this.saveState();
  }

  public approvePayout(payoutId: string, officialName: string) {
    const payout = this.state.payouts.find((p) => p.id === payoutId);
    if (!payout || payout.status === 'paid') return;

    payout.status = 'paid';
    payout.processedAt = new Date().toISOString();
    payout.transactionRef = `TX-MANUAL-${Math.floor(Math.random() * 900000 + 100000)}`;
    payout.reviewedBy = officialName;

    this.saveState();
  }

  // -------------------------------------------------------------
  // DRIVER STATUS & RIDEZW PLATFORM KYC
  // -------------------------------------------------------------

  public setDriverOnline(driverId: string, isOnline: boolean) {
    const driver = this.state.drivers.find((d) => d.id === driverId);
    if (!driver) return;

    if (isOnline) {
      if (driver.isBlockedDueToDebt) {
        throw new Error('Cannot go online: Unpaid cash-trip debt exceeds debt ceiling ($15.00). Settle debt first.');
      }
      if (driver.kycStatus === 'suspended') {
        throw new Error('Cannot go online: Your account is currently suspended. Please contact platform support.');
      }
    }

    driver.isOnline = isOnline;
    this.saveState();
  }

  public updateDriverKycStatus(driverId: string, status: 'approved' | 'rejected' | 'suspended', reason?: string) {
    const driver = this.state.drivers.find((d) => d.id === driverId);
    if (!driver) return;

    driver.kycStatus = status;
    driver.kycRejectionReason = reason;
    if (status !== 'approved') {
      driver.isOnline = false;
    }
    this.saveState();
  }

  public updateDriverProfile(driverId: string, updates: Omit<Partial<DriverProfile>, 'vehicle'> & { vehicle?: Partial<Vehicle> }) {
    const driver = this.state.drivers.find((d) => d.id === driverId);
    if (driver) {
      if (updates.vehicle) {
        driver.vehicle = {
          ...driver.vehicle,
          ...updates.vehicle
        };
        delete updates.vehicle;
      }
      Object.assign(driver, updates);
      persistDriverToBackend(driver).catch(() => {});
      if (isSupabaseConfigured()) {
        syncDriverToSupabase(driver).catch(() => {});
      }
      this.saveState();
    }
  }

  public updateDriverGpsLocation(driverId: string, lat: number, lng: number) {
    const driver = this.state.drivers.find((d) => d.id === driverId);
    if (driver) {
      driver.currentLat = lat;
      driver.currentLng = lng;
      this.saveState();
    }
  }

  public registerDriver(params: {
    name: string;
    phone: string;
    nationalId: string;
    email: string;
    city: string;
    vehicle: {
      make: string;
      model: string;
      year: number;
      color: string;
      plateNumber: string;
      category: VehicleCategory;
      capacity: number;
      fitnessCertNumber: string;
      fitnessExpiry: string;
      insuranceNumber: string;
      insuranceExpiry: string;
    };
  }) {
    const driverId = `drv-${Date.now()}`;
    const newDriver: DriverProfile = {
      id: driverId,
      name: params.name,
      phone: params.phone,
      nationalId: params.nationalId,
      email: params.email,
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      rating: 5.0,
      totalTrips: 0,
      walletBalance: 0,
      cashDebtCeiling: 15.0,
      isBlockedDueToDebt: false,
      subscriptionTier: 'commission',
      kycStatus: 'pending', // Driver must submit KYC verification
      city: params.city || 'Harare',
      documents: [],
      governmentPermitStatus: 'not_found', // Cannot have valid permit upon creation
      registeredAt: new Date().toISOString(),
      vehicle: {
        ...params.vehicle,
        id: `veh-${Date.now()}`,
        driverId
      },
      currentLat: (() => {
        const matchedCity = (this.state.coverageCities || []).find(
          (c) => c.name.toLowerCase() === (params.city || '').toLowerCase()
        );
        return matchedCity?.centerLat || -17.8252;
      })(),
      currentLng: (() => {
        const matchedCity = (this.state.coverageCities || []).find(
          (c) => c.name.toLowerCase() === (params.city || '').toLowerCase()
        );
        return matchedCity?.centerLng || 31.0335;
      })(),
      isOnline: false
    };

    this.state.drivers.unshift(newDriver);
    this.state.activeDriverId = driverId;
    this.createAndEnforceSession(
      driverId,
      'driver',
      newDriver.name,
      newDriver.phone,
      newDriver.vehicle.plateNumber
    );
    this.state.activeTab = 'driver';
    persistDriverToBackend(newDriver).catch(() => {});
    if (isSupabaseConfigured()) {
      syncDriverToSupabase(newDriver).catch(() => {});
    }
    this.saveState();
    return newDriver;
  }

  public getActiveDrivers(cityName?: string): DriverProfile[] {
    return (this.state.drivers || []).filter((d) => {
      const isOnlineAndApproved = d.isOnline === true && (!d.kycStatus || d.kycStatus === 'approved') && !d.isBlockedDueToDebt;
      if (!cityName || cityName.toLowerCase() === 'all') {
        return isOnlineAndApproved;
      }
      const search = cityName.toLowerCase().trim();
      const driverCity = (d.city || '').toLowerCase().trim();
      const matches = driverCity === search || driverCity.includes(search) || search.includes(driverCity);
      return isOnlineAndApproved && matches;
    });
  }

  public getActiveDriversCount(cityName?: string): number {
    return this.getActiveDrivers(cityName).length;
  }

  public getTotalDriversCount(cityName?: string): number {
    if (!cityName || cityName.toLowerCase() === 'all') {
      return (this.state.drivers || []).length;
    }
    const search = cityName.toLowerCase().trim();
    return (this.state.drivers || []).filter((d) => {
      const driverCity = (d.city || '').toLowerCase().trim();
      return driverCity === search || driverCity.includes(search) || search.includes(driverCity);
    }).length;
  }

  public getCityActiveDriversCount(cityName: string): number {
    return this.getActiveDrivers(cityName).length;
  }

  // -------------------------------------------------------------
  // PLATFORM OPERATOR USER & RIDER MANAGEMENT
  // -------------------------------------------------------------

  public updateRiderStatus(riderId: string, status: RiderAccountStatus, reason?: string) {
    const rider = this.state.riders.find((r) => r.id === riderId);
    if (rider) {
      rider.status = status;
      if (reason) {
        rider.notes = `${rider.notes ? rider.notes + ' | ' : ''}Status changed to ${status}: ${reason} (${new Date().toLocaleDateString()})`;
      }
      if (this.state.rider.id === riderId) {
        this.state.rider.status = status;
      }
      this.saveState();
    }
  }

  public updateRiderWallet(riderId: string, deltaUSD: number, reason: string) {
    const rider = this.state.riders.find((r) => r.id === riderId);
    if (rider) {
      rider.walletBalance = Number((rider.walletBalance + deltaUSD).toFixed(2));
      rider.notes = `${rider.notes ? rider.notes + ' | ' : ''}Wallet adjustment of ${deltaUSD >= 0 ? '+' : ''}$${deltaUSD.toFixed(2)} (${reason})`;
      if (this.state.rider.id === riderId) {
        this.state.rider.walletBalance = rider.walletBalance;
      }
      this.saveState();
    }
  }

  public addRider(params: {
    name: string;
    phone: string;
    email?: string;
    nationalId?: string;
    city: 'Harare' | 'Bulawayo';
    accountType: RiderAccountType;
    companyName?: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    initialBalance?: number;
    notes?: string;
  }) {
    const riderId = `rdr-${Date.now().toString().slice(-6)}`;
    const newRider: RiderProfile = {
      id: riderId,
      name: params.name,
      phone: params.phone,
      email: params.email || `${params.name.toLowerCase().replace(/\s+/g, '.')}@example.co.zw`,
      nationalId: params.nationalId || `63-${Math.floor(Math.random() * 899999 + 100000)}-Z-42`,
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      rating: 5.0,
      totalTrips: 0,
      emergencyContactName: params.emergencyContactName,
      emergencyContactPhone: params.emergencyContactPhone,
      preferredLanguage: 'en',
      preferredPaymentMethod: 'ecocash',
      referralCode: `RIDE-${params.name.slice(0, 4).toUpperCase()}${Math.floor(Math.random() * 89 + 10)}`,
      walletBalance: params.initialBalance || 0,
      city: params.city,
      status: 'active',
      accountType: params.accountType,
      companyName: params.companyName,
      registeredAt: new Date().toISOString(),
      notes: params.notes || 'Registered by Platform Operator'
    };

    this.state.riders.unshift(newRider);
    this.saveState();
    return newRider;
  }

  public updateRiderProfile(riderId: string, updates: Partial<RiderProfile>) {
    const rider = this.state.riders.find((r) => r.id === riderId);
    if (rider) {
      Object.assign(rider, updates);
      if (this.state.rider.id === riderId) {
        Object.assign(this.state.rider, updates);
      }
      this.saveState();
    }
  }

  public deleteRider(riderId: string) {
    this.state.riders = this.state.riders.filter((r) => r.id !== riderId);
    this.saveState();
  }

  // -------------------------------------------------------------
  // GOVERNMENT PERMIT REGISTRY SERVICE (EXCLUSIVE REGULATOR ACCESS)
  // -------------------------------------------------------------

  public applyForGovernmentPermit(params: {
    nationalId: string;
    driverFullName: string;
    phone: string;
    email: string;
    permitTypeId: string;
    vehicleRegistration: string;
    vehicleMakeModel: string;
    vehicleYear: number;
    vehicleCategory: VehicleCategory;
    paymentMethod: 'ecocash' | 'onemoney' | 'innbucks' | 'card';
  }) {
    const permitType = this.state.permitTypes.find((pt) => pt.id === params.permitTypeId) || this.state.permitTypes[0];
    const permitNumber = `ZW-MOT-2026-${Math.floor(Math.random() * 9000 + 1000)}`;

    const newPermit: GovernmentPermit = {
      id: `gov-pmt-${Date.now()}`,
      permitNumber,
      nationalId: params.nationalId,
      driverFullName: params.driverFullName,
      phone: params.phone,
      email: params.email,
      permitTypeId: permitType.id,
      permitTypeName: permitType.name,
      status: 'under_review',
      vehicleRegistration: params.vehicleRegistration,
      vehicleMakeModel: params.vehicleMakeModel,
      vehicleYear: params.vehicleYear,
      vehicleCategory: params.vehicleCategory,
      issuingAuthority: 'Ministry of Transport & Infrastructural Development — Republic of Zimbabwe',
      qrCodeSignature: `${permitNumber}:${params.nationalId}:${params.vehicleRegistration}:PENDING:SIG_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      zone: permitType.zoneScope,
      photoLivenessVerified: true,
      documents: permitType.requiredDocumentTypes.map((rd) => ({
        docTypeId: rd.id,
        docName: rd.name,
        fileUrl: `/mock/gov-doc-${rd.id}.pdf`,
        verified: true,
        expiryDate: rd.validityCycleMonths ? '2027-08-16' : undefined,
        status: 'valid'
      })),
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      historyAudit: [
        {
          id: `aud-${Date.now()}`,
          permitId: `gov-pmt-${Date.now()}`,
          permitNumber,
          eventType: 'submitted',
          actor: `Applicant: ${params.driverFullName}`,
          actorRole: 'Driver Applicant',
          timestamp: new Date().toISOString(),
          notes: `Applied for ${permitType.name}. Paid $${permitType.applicationFeeUSD.toFixed(2)} via ${params.paymentMethod.toUpperCase()}.`
        }
      ]
    };

    // Record fee record
    const feeRecord: PermitFeeRecord = {
      id: `fee-${Date.now()}`,
      permitId: newPermit.id,
      permitNumber: newPermit.permitNumber,
      applicantName: params.driverFullName,
      feeType: 'application',
      amountUSD: permitType.applicationFeeUSD,
      paymentMethod: params.paymentMethod,
      paymentRef: `GOV-${params.paymentMethod.toUpperCase()}-${Math.floor(Math.random() * 900000 + 100000)}`,
      paymentStatus: 'paid',
      paidAt: new Date().toISOString()
    };

    this.state.governmentPermits.unshift(newPermit);
    this.state.permitFees.unshift(feeRecord);

    // If matching driver exists in RideZW, link reference
    const matchedDriver = this.state.drivers.find((d) => d.nationalId === params.nationalId);
    if (matchedDriver) {
      matchedDriver.governmentPermitNumber = newPermit.permitNumber;
      matchedDriver.governmentPermitStatus = 'not_found'; // Under review
      matchedDriver.governmentPermitType = permitType.code;
    }

    this.saveState();
    return newPermit;
  }

  public regulatorDecidePermit(params: {
    permitId: string;
    decision: 'approve' | 'reject' | 'suspend' | 'revoke' | 'reinstate';
    reason?: string;
    officialName: string;
  }) {
    const permit = this.state.governmentPermits.find((p) => p.id === params.permitId);
    if (!permit) return;

    const prevStatus = permit.status;
    let nextStatus: GovernmentPermit['status'] = permit.status;

    if (params.decision === 'approve' || params.decision === 'reinstate') {
      nextStatus = 'active';
      permit.issueDate = new Date().toISOString().split('T')[0];
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);
      permit.expiryDate = expiry.toISOString().split('T')[0];
      permit.statusReason = undefined;
      permit.qrCodeSignature = `${permit.permitNumber}:${permit.nationalId}:${permit.vehicleRegistration}:VALID:EXP${permit.expiryDate}:SIG_OK`;
    } else if (params.decision === 'suspend') {
      nextStatus = 'suspended';
      permit.statusReason = params.reason || 'Suspended by Regulatory Authority';
      permit.qrCodeSignature = `${permit.permitNumber}:${permit.nationalId}:${permit.vehicleRegistration}:SUSPENDED:SIG_BAD`;
    } else if (params.decision === 'revoke') {
      nextStatus = 'revoked';
      permit.statusReason = params.reason || 'Revoked permanently due to compliance violation';
      permit.qrCodeSignature = `${permit.permitNumber}:${permit.nationalId}:${permit.vehicleRegistration}:REVOKED:SIG_REV`;
    } else if (params.decision === 'reject') {
      nextStatus = 'rejected';
      permit.statusReason = params.reason || 'Application rejected';
    }

    permit.status = nextStatus;
    permit.lastUpdated = new Date().toISOString();

    // Append to immutable audit trail
    permit.historyAudit.push({
      id: `aud-${Date.now()}`,
      permitId: permit.id,
      permitNumber: permit.permitNumber,
      eventType: params.decision as any,
      actor: params.officialName,
      actorRole: 'Senior Licensing Official',
      timestamp: new Date().toISOString(),
      notes: `Decision: ${params.decision.toUpperCase()}. Reason: ${params.reason || 'Routine compliance action'}.`
    });

    // WEBHOOK DISPATCH SIMULATION:
    // Synchronize linked drivers on RideZW and any other platforms that looked up this driver!
    const matchedDriver = this.state.drivers.find((d) => d.nationalId === permit.nationalId);
    if (matchedDriver) {
      let driverPermitStatus: 'valid' | 'suspended' | 'expired' | 'not_found' | 'revoked' = 'not_found';
      if (nextStatus === 'active') {
        driverPermitStatus = 'valid';
      } else if (nextStatus === 'suspended') {
        driverPermitStatus = 'suspended';
      } else if (nextStatus === 'expired') {
        driverPermitStatus = 'expired';
      } else if (nextStatus === 'revoked' || nextStatus === 'rejected') {
        driverPermitStatus = 'revoked';
      }
      matchedDriver.governmentPermitStatus = driverPermitStatus;
      matchedDriver.governmentPermitNumber = permit.permitNumber;
      matchedDriver.governmentPermitExpiry = permit.expiryDate;
      if (nextStatus !== 'active') {
        matchedDriver.isOnline = false; // Immediately take offline
      }
    }

    this.saveState();
  }

  public submitAppeal(params: {
    permitId: string;
    reason: string;
    supportingEvidenceUrl?: string;
  }) {
    const permit = this.state.governmentPermits.find((p) => p.id === params.permitId);
    if (!permit) return;

    permit.status = 'appealed';
    const appeal: PermitAppeal = {
      id: `app-${Date.now()}`,
      permitId: permit.id,
      permitNumber: permit.permitNumber,
      driverName: permit.driverFullName,
      nationalId: permit.nationalId,
      reasonForAppeal: params.reason,
      supportingEvidenceUrl: params.supportingEvidenceUrl || '/mock/appeal-evidence.pdf',
      status: 'submitted',
      submittedAt: new Date().toISOString()
    };

    this.state.permitAppeals.unshift(appeal);
    this.saveState();
  }

  public adjudicateAppeal(appealId: string, decision: 'upheld_reinstated' | 'rejected', notes: string, officialName: string) {
    const appeal = this.state.permitAppeals.find((a) => a.id === appealId);
    if (!appeal) return;

    appeal.status = decision;
    appeal.decidedAt = new Date().toISOString();
    appeal.decisionNotes = notes;
    appeal.reviewerOfficialId = officialName;

    if (decision === 'upheld_reinstated') {
      this.regulatorDecidePermit({
        permitId: appeal.permitId,
        decision: 'reinstate',
        reason: `Tribunal Appeal Approved: ${notes}`,
        officialName
      });
    } else {
      this.regulatorDecidePermit({
        permitId: appeal.permitId,
        decision: 'reject',
        reason: `Appeal Rejected: ${notes}`,
        officialName
      });
    }

    this.saveState();
  }

  public configurePermitType(permitType: PermitTypeConfig) {
    const idx = this.state.permitTypes.findIndex((pt) => pt.id === permitType.id);
    if (idx >= 0) {
      this.state.permitTypes[idx] = permitType;
    } else {
      this.state.permitTypes.push(permitType);
    }
    this.saveState();
  }

  // -------------------------------------------------------------
  // ENFORCER ROADSIDE TOOL & QR VERIFICATION
  // -------------------------------------------------------------

  public enforcerLookup(query: string): {
    found: boolean;
    permit?: GovernmentPermit;
    status: 'valid' | 'expired' | 'suspended' | 'revoked' | 'not_found';
    driverName?: string;
    vehiclePlate?: string;
    message: string;
  } {
    const clean = query.trim().toUpperCase();
    const permit = this.state.governmentPermits.find(
      (p) =>
        p.permitNumber.toUpperCase() === clean ||
        p.nationalId.toUpperCase() === clean ||
        p.vehicleRegistration.toUpperCase().replace('-', '') === clean.replace('-', '') ||
        p.qrCodeSignature.toUpperCase().includes(clean)
    );

    if (!permit) {
      return {
        found: false,
        status: 'not_found',
        message: 'No authoritative government e-hailing permit found in national registry.'
      };
    }

    // Audit log this lookup
    const lookupLog: PlatformLookupLog = {
      id: `log-${Date.now()}`,
      platformId: 'enforcer-roadside',
      platformName: 'ZRP Traffic Enforcement Terminal',
      driverNationalId: permit.nationalId,
      returnedStatus: `${permit.status} (Permit #${permit.permitNumber})`,
      queriedAt: new Date().toISOString(),
      ipAddress: '197.221.14.99'
    };
    this.state.platformLookups.unshift(lookupLog);
    this.saveState();

    const normalizedStatus = permit.status === 'active' ? 'valid' : permit.status === 'suspended' ? 'suspended' : permit.status === 'expired' ? 'expired' : permit.status === 'revoked' ? 'revoked' : 'not_found';

    return {
      found: true,
      permit,
      status: normalizedStatus as any,
      driverName: permit.driverFullName,
      vehiclePlate: permit.vehicleRegistration,
      message: `Verified: ${permit.permitTypeName} — Status: ${permit.status.toUpperCase()}`
    };
  }

  public issueEnforcementFine(fine: Omit<EnforcementFine, 'id' | 'ticketNumber' | 'issuedAt' | 'isSynced'>, isOnlineMode: boolean = true) {
    const newFine: EnforcementFine = {
      ...fine,
      id: `fine-${Date.now()}`,
      ticketNumber: `TF-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
      issuedAt: new Date().toISOString(),
      isSynced: isOnlineMode
    };

    if (isOnlineMode) {
      this.state.enforcementFines.unshift(newFine);
      // If fine warrants suspension (e.g. no insurance), auto flag in audit
      if (fine.permitNumber) {
        const permit = this.state.governmentPermits.find((p) => p.permitNumber === fine.permitNumber);
        if (permit) {
          permit.historyAudit.push({
            id: `aud-${Date.now()}`,
            permitId: permit.id,
            permitNumber: permit.permitNumber,
            eventType: 'fine_issued',
            actor: `${fine.enforcerName} (${fine.enforcerBadge})`,
            actorRole: 'Traffic Enforcer',
            timestamp: new Date().toISOString(),
            notes: `Roadside ticket issued for ${fine.violationReason}. Fine amount: $${fine.fineAmountUSD}.`
          });
        }
      }
    } else {
      this.state.offlineFineQueue.push(newFine);
    }

    this.saveState();
    return newFine;
  }

  public syncOfflineFines() {
    const queue = [...this.state.offlineFineQueue];
    queue.forEach((fine) => {
      fine.isSynced = true;
      this.state.enforcementFines.unshift(fine);
    });
    this.state.offlineFineQueue = [];
    this.saveState();
    return queue.length;
  }

  // -------------------------------------------------------------
  // SAFETY & SOS ALERTS
  // -------------------------------------------------------------

  public triggerSos(params: {
    tripId: string;
    triggeredBy: 'rider' | 'driver';
    lat: number;
    lng: number;
    address: string;
  }) {
    const isRider = params.triggeredBy === 'rider';
    const user = isRider ? this.state.rider : this.state.drivers.find((d) => d.id === this.state.activeDriverId)!;

    const alert: SosAlert = {
      id: `sos-${Date.now()}`,
      tripId: params.tripId,
      triggeredBy: params.triggeredBy,
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      lat: params.lat,
      lng: params.lng,
      address: params.address,
      timestamp: new Date().toISOString(),
      status: 'active',
      emergencyContactsNotified: [
        isRider ? `${(user as RiderProfile).emergencyContactName} (${(user as RiderProfile).emergencyContactPhone})` : 'RideZW 24/7 Security Hotline (+263 77 000 9999)',
        'ZRP Central Emergency Dispatch (999 / +263 242 777777)'
      ]
    };

    if (this.state.activeTrip && this.state.activeTrip.id === params.tripId) {
      this.state.activeTrip.sosTriggered = true;
    }

    this.state.sosAlerts.unshift(alert);
    persistSosAlertToBackend(alert).catch(() => {});
    if (isSupabaseConfigured()) {
      syncSosToSupabase(alert).catch(() => {});
    }
    this.saveState();
    return alert;
  }

  public resolveSos(alertId: string, status: 'resolved' | 'police_dispatched' | 'false_alarm') {
    const alert = this.state.sosAlerts.find((s) => s.id === alertId);
    if (!alert) return;
    alert.status = status;
    persistSosAlertToBackend(alert).catch(() => {});
    if (isSupabaseConfigured()) {
      syncSosToSupabase(alert).catch(() => {});
    }
    this.saveState();
  }

  public resolveAppeal(appealId: string, decision: 'approved' | 'rejected', notes?: string) {
    const appeal = this.state.permitAppeals.find((a) => a.id === appealId);
    if (!appeal) return;
    appeal.status = decision === 'approved' ? 'upheld_reinstated' : 'rejected';
    appeal.decidedAt = new Date().toISOString();
    appeal.decisionNotes = notes;

    if (decision === 'approved') {
      const permit = this.state.governmentPermits.find((p) => p.permitNumber === appeal.permitNumber || p.id === appeal.permitId);
      if (permit) {
        permit.status = 'active';
        permit.statusReason = undefined;
      }
    }
    this.saveState();
  }

  // -------------------------------------------------------------
  // SETTINGS & PRICING CONFIG
  // -------------------------------------------------------------

  public updatePricingConfig(configs: PricingConfig[]) {
    this.state.pricingConfigs = configs;
    fetch('/api/pricing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pricingConfigs: configs })
    }).catch(() => {});
    if (isSupabaseConfigured()) {
      syncSeedDataToSupabase({
        coverageCities: this.state.coverageCities,
        pricingConfigs: configs,
        permitTypes: this.state.permitTypes,
        settings: this.state.settings,
        adminUsers: this.state.adminUsers
      }).catch(() => {});
    }
    this.saveState();
  }

  public updateCategoryPricing(category: VehicleCategory, updates: Partial<PricingConfig>) {
    const config = this.state.pricingConfigs.find((c) => c.category === category);
    if (config) {
      Object.assign(config, updates);
      fetch('/api/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pricingConfigs: this.state.pricingConfigs })
      }).catch(() => {});
      this.saveState();
    }
  }

  public setGlobalCommissionPercentage(percentage: number) {
    this.state.pricingConfigs.forEach((c) => {
      c.commissionPercentage = percentage;
      c.cashLevyPercentage = percentage;
    });
    fetch('/api/pricing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pricingConfigs: this.state.pricingConfigs })
    }).catch(() => {});
    this.saveState();
  }

  public updatePlatformSettings(settings: Partial<PlatformSettings>) {
    this.state.settings = { ...this.state.settings, ...settings };
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: this.state.settings })
    }).catch(() => {});
    if (isSupabaseConfigured()) {
      syncSeedDataToSupabase({
        coverageCities: this.state.coverageCities,
        pricingConfigs: this.state.pricingConfigs,
        permitTypes: this.state.permitTypes,
        settings: this.state.settings,
        adminUsers: this.state.adminUsers
      }).catch(() => {});
    }
    this.saveState();
  }

  // -------------------------------------------------------------
  // COVERAGE CITIES & OPERATIONAL HUBS MANAGEMENT
  // -------------------------------------------------------------

  public addCoverageCity(cityData: Omit<CoverageCity, 'id'>): CoverageCity {
    const newCity: CoverageCity = {
      ...cityData,
      id: `city-${cityData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now().toString().slice(-4)}`
    };
    if (!this.state.coverageCities) {
      this.state.coverageCities = [];
    }
    this.state.coverageCities.push(newCity);
    this.saveState();
    return newCity;
  }

  public updateCoverageCity(id: string, updates: Partial<CoverageCity>) {
    if (!this.state.coverageCities) return;
    const city = this.state.coverageCities.find((c) => c.id === id);
    if (city) {
      Object.assign(city, updates);
      this.saveState();
    }
  }

  public toggleCoverageCityStatus(id: string) {
    if (!this.state.coverageCities) return;
    const city = this.state.coverageCities.find((c) => c.id === id);
    if (city) {
      city.status = city.status === 'active' ? 'inactive' : 'active';
      this.saveState();
    }
  }

  public deleteCoverageCity(id: string) {
    if (!this.state.coverageCities) return;
    const target = this.state.coverageCities.find((c) => c.id === id);
    if (target?.isPrimaryHub) {
      alert('Primary national operational hubs (Harare/Bulawayo) cannot be removed.');
      return;
    }
    this.state.coverageCities = this.state.coverageCities.filter((c) => c.id !== id);
    this.saveState();
  }

  // -------------------------------------------------------------
  // STAFF & PLATFORM OPERATOR ADMINISTRATORS
  // -------------------------------------------------------------

  public addAdminUser(user: Omit<AdminUser, 'id' | 'createdAt'>): AdminUser {
    const newAdmin: AdminUser = {
      ...user,
      id: `adm-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString()
    };
    if (!this.state.adminUsers) {
      this.state.adminUsers = [];
    }
    this.state.adminUsers.unshift(newAdmin);
    this.saveState();
    return newAdmin;
  }

  public updateAdminUser(id: string, updates: Partial<AdminUser>) {
    if (!this.state.adminUsers) return;
    const admin = this.state.adminUsers.find((u) => u.id === id);
    if (admin) {
      Object.assign(admin, updates);
      this.saveState();
    }
  }

  public deleteAdminUser(id: string) {
    if (!this.state.adminUsers) return;
    // Protect root super admin
    const target = this.state.adminUsers.find((u) => u.id === id);
    if (target?.isRootSuperAdmin) {
      alert('Root Genesis Super Administrator account cannot be deleted.');
      return;
    }
    this.state.adminUsers = this.state.adminUsers.filter((u) => u.id !== id);
    this.saveState();
  }

  public bootstrapRootSuperAdmin(data: { name: string; email: string; phone: string; department?: string }): AdminUser {
    if (!this.state.adminUsers) {
      this.state.adminUsers = [];
    }
    const rootAdmin: AdminUser = {
      id: 'adm-root-001',
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: 'super_admin',
      department: data.department || 'Executive Operations & Core Infrastructure',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      status: 'active',
      permissions: ['all_access', 'manage_pricing', 'manage_staff', 'approve_kyc', 'process_payouts', 'manage_sos', 'view_ledgers'],
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isRootSuperAdmin: true
    };
    this.state.adminUsers = [rootAdmin, ...this.state.adminUsers.filter(u => !u.isRootSuperAdmin)];
    this.saveState();
    return rootAdmin;
  }
}

export const store = new Store();
