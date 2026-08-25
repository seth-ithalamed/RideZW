import {
  DriverProfile,
  RiderProfile,
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
  LocationPoint,
  AdminUser,
  CoverageCity
} from '../types';

// ============================================================================
// 1. SEED: COVERAGE CITIES & STRATEGIC HUBS (ZIMBABWE METROS & GROWTH POINTS)
// ============================================================================

export const INITIAL_COVERAGE_CITIES: CoverageCity[] = [
  {
    id: 'city-hre',
    name: 'Harare',
    province: 'Harare Metropolitan',
    status: 'active',
    code: 'HRE',
    centerLat: -17.8292,
    centerLng: 31.0522,
    radiusKm: 35,
    baseFareMultiplier: 1.0,
    supportedCategories: ['economy', 'comfort', 'xl', 'motorbike'],
    isPrimaryHub: true
  },
  {
    id: 'city-byo',
    name: 'Bulawayo',
    province: 'Bulawayo Metropolitan',
    status: 'active',
    code: 'BYO',
    centerLat: -20.1569,
    centerLng: 28.5833,
    radiusKm: 30,
    baseFareMultiplier: 1.0,
    supportedCategories: ['economy', 'comfort', 'xl', 'motorbike'],
    isPrimaryHub: true
  },
  {
    id: 'city-vfa',
    name: 'Victoria Falls',
    province: 'Matabeleland North',
    status: 'active',
    code: 'VFA',
    centerLat: -17.9311,
    centerLng: 25.8307,
    radiusKm: 25,
    baseFareMultiplier: 1.15,
    supportedCategories: ['economy', 'comfort', 'xl'],
    isPrimaryHub: false
  },
  {
    id: 'city-uta',
    name: 'Mutare',
    province: 'Manicaland',
    status: 'active',
    code: 'UTA',
    centerLat: -18.9728,
    centerLng: 32.6695,
    radiusKm: 25,
    baseFareMultiplier: 1.0,
    supportedCategories: ['economy', 'comfort', 'xl', 'motorbike'],
    isPrimaryHub: false
  },
  {
    id: 'city-gwe',
    name: 'Gweru',
    province: 'Midlands',
    status: 'active',
    code: 'GWE',
    centerLat: -19.4587,
    centerLng: 29.8153,
    radiusKm: 20,
    baseFareMultiplier: 1.0,
    supportedCategories: ['economy', 'comfort', 'motorbike'],
    isPrimaryHub: false
  },
  {
    id: 'city-mvg',
    name: 'Masvingo',
    province: 'Masvingo',
    status: 'active',
    code: 'MVG',
    centerLat: -20.0744,
    centerLng: 30.8328,
    radiusKm: 20,
    baseFareMultiplier: 1.0,
    supportedCategories: ['economy', 'comfort', 'motorbike'],
    isPrimaryHub: false
  },
  {
    id: 'city-chy',
    name: 'Chinhoyi',
    province: 'Mashonaland West',
    status: 'active',
    code: 'CHY',
    centerLat: -17.3667,
    centerLng: 30.2000,
    radiusKm: 20,
    baseFareMultiplier: 1.0,
    supportedCategories: ['economy', 'comfort', 'motorbike'],
    isPrimaryHub: false
  },
  {
    id: 'city-kwe',
    name: 'Kwekwe',
    province: 'Midlands',
    status: 'active',
    code: 'KWE',
    centerLat: -18.9281,
    centerLng: 29.8149,
    radiusKm: 20,
    baseFareMultiplier: 1.0,
    supportedCategories: ['economy', 'comfort', 'motorbike'],
    isPrimaryHub: false
  },
  {
    id: 'city-mrd',
    name: 'Marondera',
    province: 'Mashonaland East',
    status: 'active',
    code: 'MRD',
    centerLat: -18.1853,
    centerLng: 31.5519,
    radiusKm: 20,
    baseFareMultiplier: 1.0,
    supportedCategories: ['economy', 'comfort', 'motorbike'],
    isPrimaryHub: false
  },
  {
    id: 'city-kdm',
    name: 'Kadoma',
    province: 'Mashonaland West',
    status: 'active',
    code: 'KDM',
    centerLat: -18.3333,
    centerLng: 29.9167,
    radiusKm: 20,
    baseFareMultiplier: 1.0,
    supportedCategories: ['economy', 'comfort'],
    isPrimaryHub: false
  },
  {
    id: 'city-zvs',
    name: 'Zvishavane',
    province: 'Midlands',
    status: 'active',
    code: 'ZVS',
    centerLat: -20.3267,
    centerLng: 30.0665,
    radiusKm: 20,
    baseFareMultiplier: 1.0,
    supportedCategories: ['economy', 'comfort'],
    isPrimaryHub: false
  },
  {
    id: 'city-bbg',
    name: 'Beitbridge',
    province: 'Matabeleland South',
    status: 'active',
    code: 'BBG',
    centerLat: -22.2167,
    centerLng: 30.0000,
    radiusKm: 20,
    baseFareMultiplier: 1.10,
    supportedCategories: ['economy', 'comfort', 'xl'],
    isPrimaryHub: false
  },
  {
    id: 'city-hwg',
    name: 'Hwange',
    province: 'Matabeleland North',
    status: 'active',
    code: 'HWG',
    centerLat: -18.3647,
    centerLng: 25.4981,
    radiusKm: 25,
    baseFareMultiplier: 1.05,
    supportedCategories: ['economy', 'comfort'],
    isPrimaryHub: false
  }
];

export const CITY_LOCATIONS_MAP: Record<string, LocationPoint[]> = {
  Harare: [
    { address: 'First Mutual Tower, CBD', neighborhood: 'Harare CBD', city: 'Harare', lat: -17.8292, lng: 31.0522 },
    { address: 'Avondale Shopping Centre, King George Rd', neighborhood: 'Avondale', city: 'Harare', lat: -17.7915, lng: 31.0384 },
    { address: 'Sam Levy’s Village, Borrowdale Rd', neighborhood: 'Borrowdale', city: 'Harare', lat: -17.7554, lng: 31.0872 },
    { address: 'Robert Gabriel Mugabe International Airport', neighborhood: 'Airport', city: 'Harare', lat: -17.9318, lng: 31.0928 },
    { address: 'Mbare Musika Bus Terminus', neighborhood: 'Mbare', city: 'Harare', lat: -17.8596, lng: 31.0425 },
    { address: 'Westgate Shopping Mall, Lomagundi Rd', neighborhood: 'Westgate', city: 'Harare', lat: -17.7690, lng: 30.9785 },
    { address: 'Eastgate Mall, Robert Mugabe Way', neighborhood: 'Harare CBD', city: 'Harare', lat: -17.8315, lng: 31.0545 },
    { address: 'Highland Park Mall, Enterprise Rd', neighborhood: 'Highlands', city: 'Harare', lat: -17.7972, lng: 31.1011 },
    { address: 'University of Zimbabwe, Mount Pleasant', neighborhood: 'Mt Pleasant', city: 'Harare', lat: -17.7842, lng: 31.0531 },
    { address: 'Belgravia Sports Club, 2nd St Extension', neighborhood: 'Belgravia', city: 'Harare', lat: -17.8023, lng: 31.0489 },
  ],
  Bulawayo: [
    { address: 'Bulawayo Centre, JMN Nkomo St', neighborhood: 'Bulawayo CBD', city: 'Bulawayo', lat: -20.1569, lng: 28.5833 },
    { address: 'Bradfield Shopping Centre', neighborhood: 'Bradfield', city: 'Bulawayo', lat: -20.1742, lng: 28.5991 },
    { address: 'Hillside Dams Conservancy', neighborhood: 'Hillside', city: 'Bulawayo', lat: -20.1985, lng: 28.6184 },
    { address: 'Joshua Mqabuko Nkomo International Airport', neighborhood: 'Airport', city: 'Bulawayo', lat: -20.0175, lng: 28.6178 },
    { address: 'National University of Science & Technology (NUST)', neighborhood: 'Riverside', city: 'Bulawayo', lat: -20.1788, lng: 28.6433 },
  ],
  'Victoria Falls': [
    { address: 'Victoria Falls Rainforest Gate', neighborhood: 'Rainforest Park', city: 'Victoria Falls', lat: -17.9244, lng: 25.8560 },
    { address: 'Victoria Falls International Airport (VFA)', neighborhood: 'Airport', city: 'Victoria Falls', lat: -18.0959, lng: 25.8390 },
    { address: 'The Kingdom Hotel & Resort, Mallet Dr', neighborhood: 'Hotel Zone', city: 'Victoria Falls', lat: -17.9288, lng: 25.8431 },
    { address: 'Chinotimba Mall & Terminus', neighborhood: 'Chinotimba', city: 'Victoria Falls', lat: -17.9365, lng: 25.8214 },
    { address: 'Elephant Hills Resort & Golf Club', neighborhood: 'Parkway', city: 'Victoria Falls', lat: -17.9042, lng: 25.8385 }
  ],
  Mutare: [
    { address: 'Mutare CBD, Herbert Chitepo St', neighborhood: 'CBD', city: 'Mutare', lat: -18.9728, lng: 32.6695 },
    { address: 'Forbes Border Post Gate', neighborhood: 'Forbes Border', city: 'Mutare', lat: -18.9810, lng: 32.7120 },
    { address: 'Dangamvura Complex Mall', neighborhood: 'Dangamvura', city: 'Mutare', lat: -19.0142, lng: 32.6189 },
    { address: 'Chikanga Shopping Centre', neighborhood: 'Chikanga', city: 'Mutare', lat: -18.9560, lng: 32.6341 },
    { address: 'Murambi Gardens Shopping Node', neighborhood: 'Murambi', city: 'Mutare', lat: -18.9580, lng: 32.6710 }
  ],
  Gweru: [
    { address: 'Gweru CBD, Robert Mugabe Way', neighborhood: 'CBD', city: 'Gweru', lat: -19.4587, lng: 29.8153 },
    { address: 'Midlands State University (MSU) Main Campus', neighborhood: 'Senga MSU', city: 'Gweru', lat: -19.5080, lng: 29.8395 },
    { address: 'Mkoba Shopping Centre, 6 Mkoba', neighborhood: 'Mkoba', city: 'Gweru', lat: -19.4310, lng: 29.7420 },
    { address: 'Daylesford Plaza', neighborhood: 'Daylesford', city: 'Gweru', lat: -19.4890, lng: 29.8250 }
  ],
  Masvingo: [
    { address: 'Masvingo CBD, Josiah Tongogara Ave', neighborhood: 'CBD', city: 'Masvingo', lat: -20.0744, lng: 30.8328 },
    { address: 'Great Zimbabwe National Monument', neighborhood: 'Heritage Park', city: 'Masvingo', lat: -20.2675, lng: 30.9333 },
    { address: 'Mucheke Bus Terminus', neighborhood: 'Mucheke', city: 'Masvingo', lat: -20.0880, lng: 30.8190 },
    { address: 'Great Zimbabwe University (GZU) Mashava', neighborhood: 'GZU Campus', city: 'Masvingo', lat: -20.0450, lng: 30.8520 }
  ],
  Chinhoyi: [
    { address: 'Chinhoyi CBD, Magamba Way', neighborhood: 'CBD', city: 'Chinhoyi', lat: -17.3667, lng: 30.2000 },
    { address: 'Chinhoyi Caves National Park Gate', neighborhood: 'Caves Park', city: 'Chinhoyi', lat: -17.3580, lng: 30.1310 },
    { address: 'Chinhoyi University of Technology (CUT)', neighborhood: 'CUT Campus', city: 'Chinhoyi', lat: -17.3520, lng: 30.1940 }
  ],
  Kwekwe: [
    { address: 'Kwekwe CBD, Nelson Mandela Way', neighborhood: 'CBD', city: 'Kwekwe', lat: -18.9281, lng: 29.8149 },
    { address: 'Mbizo Shopping Mall', neighborhood: 'Mbizo', city: 'Kwekwe', lat: -18.9020, lng: 29.8650 },
    { address: 'Redcliff Plaza', neighborhood: 'Redcliff', city: 'Kwekwe', lat: -19.0180, lng: 29.7740 }
  ],
  Marondera: [
    { address: 'Marondera CBD, The Green', neighborhood: 'CBD', city: 'Marondera', lat: -18.1853, lng: 31.5519 },
    { address: 'Dombotombo Market Centre', neighborhood: 'Dombotombo', city: 'Marondera', lat: -18.2010, lng: 31.5420 },
    { address: 'Nyameni Commercial Complex', neighborhood: 'Nyameni', city: 'Marondera', lat: -18.1750, lng: 31.5680 }
  ]
};

export const HARARE_LOCATIONS: LocationPoint[] = CITY_LOCATIONS_MAP.Harare;
export const BULAWAYO_LOCATIONS: LocationPoint[] = CITY_LOCATIONS_MAP.Bulawayo;

// ============================================================================
// 2. SEED: VEHICLE CATEGORY PRICING & COMMISSION MATRICES
// ============================================================================

export const INITIAL_PRICING_CONFIG: PricingConfig[] = [
  {
    category: 'economy',
    name: 'RideZW Economy',
    baseFareUSD: 2.00,
    perKmUSD: 0.70,
    perMinuteUSD: 0.10,
    minimumFareUSD: 3.00,
    commissionPercentage: 12.0, // 12% standard platform commission
    cashLevyPercentage: 12.0,
    surgeMultiplier: 1.0,
    iconName: 'Car'
  },
  {
    category: 'comfort',
    name: 'RideZW Comfort',
    baseFareUSD: 3.50,
    perKmUSD: 0.95,
    perMinuteUSD: 0.15,
    minimumFareUSD: 5.00,
    commissionPercentage: 12.0,
    cashLevyPercentage: 12.0,
    surgeMultiplier: 1.0,
    iconName: 'Sparkles'
  },
  {
    category: 'xl',
    name: 'RideZW XL (6-Seater)',
    baseFareUSD: 5.00,
    perKmUSD: 1.30,
    perMinuteUSD: 0.20,
    minimumFareUSD: 7.00,
    commissionPercentage: 14.0,
    cashLevyPercentage: 14.0,
    surgeMultiplier: 1.0,
    iconName: 'Users'
  },
  {
    category: 'motorbike',
    name: 'RideZW Boda Express',
    baseFareUSD: 1.20,
    perKmUSD: 0.45,
    perMinuteUSD: 0.05,
    minimumFareUSD: 2.00,
    commissionPercentage: 10.0,
    cashLevyPercentage: 10.0,
    surgeMultiplier: 1.0,
    iconName: 'Bike'
  }
];

// ============================================================================
// 3. SEED: DYNAMIC PLATFORM COMMISSION & REVENUE ENGINE SETTINGS
// ============================================================================

export const INITIAL_SETTINGS: PlatformSettings = {
  primaryCurrency: 'USD',
  displayCurrency: 'USD',
  exchangeRateUSDToZWG: 26.85, // Official RBZ Reserve Bank of Zimbabwe rate (1 USD = 26.85 ZiG)
  driverDebtCeilingUSD: 15.00, // Cash trip debt cutoff limit ($15.00)
  subscriptionWeeklyUSD: 7.00, // Flat $7 / week 0% commission pass
  subscriptionMonthlyUSD: 25.00, // Flat $25 / month 0% commission pass
  enforceGovernmentPermitGating: false, // Permit gating configuration
  serviceRadiusKm: 12.0,
  autoApprovePayoutUnderUSD: 20.00
};

// ============================================================================
// 4. SEED: GOVERNMENT STATUTORY PERMIT TYPES & POLICIES
// ============================================================================

export const INITIAL_PERMIT_TYPES: PermitTypeConfig[] = [
  {
    id: 'pt-phc-urban',
    code: 'PHC-URBAN',
    name: 'Private Hire Vehicle (Urban E-Hailing)',
    description: 'Authoritative national e-hailing permit for standard passenger vehicles operating within metropolitan zones.',
    validityMonths: 12,
    applicationFeeUSD: 35.00,
    renewalFeeUSD: 25.00,
    lateRenewalPenaltyUSD: 10.00,
    reinstatementFeeUSD: 20.00,
    zoneScope: 'Harare_Metro',
    isActive: true,
    requiredDocumentTypes: [
      { id: 'nid', name: 'National Identity Document', mandatory: true },
      { id: 'lic', name: 'Class 4 Driver’s License (min 2 yrs)', mandatory: true },
      { id: 'vid', name: 'VID Certificate of Fitness (Roadworthiness)', validityCycleMonths: 12, mandatory: true },
      { id: 'ins', name: 'Public Passenger Liability Insurance (PSV)', validityCycleMonths: 12, mandatory: true },
      { id: 'pcr', name: 'ZRP CID Police Clearance Certificate', validityCycleMonths: 12, mandatory: true },
      { id: 'reg', name: 'Vehicle Registration Certificate (Blue Book)', mandatory: true }
    ]
  },
  {
    id: 'pt-boda-moto',
    code: 'MOTO-BODA',
    name: 'Motorcycle E-Courier & Passenger Permit',
    description: 'Commercial permit for two-wheeler transport and rapid e-courier operations in urban centers.',
    validityMonths: 12,
    applicationFeeUSD: 20.00,
    renewalFeeUSD: 15.00,
    lateRenewalPenaltyUSD: 8.00,
    reinstatementFeeUSD: 15.00,
    zoneScope: 'National',
    isActive: true,
    requiredDocumentTypes: [
      { id: 'nid', name: 'National Identity Document', mandatory: true },
      { id: 'lic_c3', name: 'Class 3 Driver’s License', mandatory: true },
      { id: 'vid', name: 'VID Certificate of Fitness', validityCycleMonths: 12, mandatory: true },
      { id: 'ins', name: 'Commercial Motorcycle Third-Party & Rider Insurance', validityCycleMonths: 12, mandatory: true },
      { id: 'pcr', name: 'ZRP Police Clearance', validityCycleMonths: 12, mandatory: true }
    ]
  },
  {
    id: 'pt-xl-van',
    code: 'XL-VAN',
    name: 'Multi-Passenger Commuter & XL Permit',
    description: 'Permit for high-capacity 6-8 passenger vehicles and urban shuttle operations.',
    validityMonths: 12,
    applicationFeeUSD: 45.00,
    renewalFeeUSD: 35.00,
    lateRenewalPenaltyUSD: 15.00,
    reinstatementFeeUSD: 30.00,
    zoneScope: 'National',
    isActive: true,
    requiredDocumentTypes: [
      { id: 'nid', name: 'National Identity Document', mandatory: true },
      { id: 'lic_c2', name: 'Class 2 / Class 4 Driver’s License with Defensive Driving', mandatory: true },
      { id: 'vid', name: 'VID Heavy Commercial Roadworthiness', validityCycleMonths: 6, mandatory: true },
      { id: 'ins', name: 'Full Comprehensive PSV Multi-Passenger Insurance', validityCycleMonths: 12, mandatory: true },
      { id: 'pcr', name: 'ZRP CID Police Clearance', validityCycleMonths: 12, mandatory: true }
    ]
  },
  {
    id: 'pt-intercity',
    code: 'INTER-CITY',
    name: 'Long-Distance Inter-City Route Permit',
    description: 'Cross-provincial e-hailing & express passenger shuttle permit between Harare, Bulawayo, Mutare, Gweru.',
    validityMonths: 6,
    applicationFeeUSD: 60.00,
    renewalFeeUSD: 45.00,
    lateRenewalPenaltyUSD: 20.00,
    reinstatementFeeUSD: 40.00,
    zoneScope: 'National',
    isActive: true,
    requiredDocumentTypes: [
      { id: 'nid', name: 'National Identity Document', mandatory: true },
      { id: 'lic_psv', name: 'PSV Medical Fitness & Defensive Driving Cert', validityCycleMonths: 12, mandatory: true },
      { id: 'vid', name: 'VID Semi-Annual Certificate of Fitness', validityCycleMonths: 6, mandatory: true },
      { id: 'ins', name: 'Inter-City Full Passenger Liability Insurance', validityCycleMonths: 12, mandatory: true },
      { id: 'pcr', name: 'ZRP CID Police Clearance', validityCycleMonths: 12, mandatory: true }
    ]
  }
];

// ============================================================================
// 5. SEED: INITIAL ROOT SUPER ADMIN ACCOUNT (SETH)
// ============================================================================

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'adm-root-001',
    name: 'Seth (Platform Founder)',
    email: 'seth.bbd@gmail.com',
    phone: '+263 77 123 4567',
    role: 'super_admin',
    department: 'Executive Operations & Core Infrastructure',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    permissions: [
      'all_access',
      'manage_pricing',
      'manage_staff',
      'approve_kyc',
      'process_payouts',
      'manage_sos',
      'view_ledgers',
      'export_financial_reports'
    ],
    lastLoginAt: '2026-08-20T08:00:00Z',
    createdAt: '2026-01-01T08:00:00Z',
    isRootSuperAdmin: true
  }
];

// ============================================================================
// 6. DEFAULT USER PROFILES (CLEAN REAL-TIME STATE)
// ============================================================================

export const INITIAL_RIDER: RiderProfile = {
  id: 'rdr-primary-001',
  name: 'Seth (Rider)',
  phone: '+263 77 123 4567',
  email: 'seth.bbd@gmail.com',
  nationalId: '63-289410-Q-42',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  rating: 5.0,
  totalTrips: 0,
  emergencyContactName: 'Emergency Hotline',
  emergencyContactPhone: '+263 77 999 0000',
  preferredLanguage: 'en',
  preferredPaymentMethod: 'ecocash',
  referralCode: 'RIDE-SETH01',
  walletBalance: 0.00,
  city: 'Harare',
  status: 'active',
  accountType: 'standard',
  registeredAt: new Date().toISOString()
};

// Clean non-mock starting collections (populated through live organic usage)
export const INITIAL_DRIVERS: DriverProfile[] = [];
export const INITIAL_RIDERS: RiderProfile[] = [];
export const INITIAL_TRIPS: Trip[] = [];
export const INITIAL_LEDGER: LedgerEntry[] = [];
export const INITIAL_GOVERNMENT_PERMITS: GovernmentPermit[] = [];
export const INITIAL_FINES: EnforcementFine[] = [];
export const INITIAL_APPEALS: PermitAppeal[] = [];
export const INITIAL_PERMIT_FEES: PermitFeeRecord[] = [];
export const INITIAL_PAYOUTS: PayoutRequest[] = [];
export const INITIAL_DISPUTES: Dispute[] = [];
export const INITIAL_SOS: SosAlert[] = [];
export const INITIAL_PLATFORM_INTEGRATORS: PlatformIntegrator[] = [];
export const INITIAL_LOOKUP_LOGS: PlatformLookupLog[] = [];
export const INITIAL_TRIP_REPORTS: PlatformTripReport[] = [];

// ============================================================================
// 7. MULTILINGUAL LOCALIZATION STRINGS (EN, SHONA, NDEBELE)
// ============================================================================

export const LOCALIZED_TEXTS = {
  en: {
    appTitle: 'RideZW',
    tagline: 'Your Ride, Anytime in Zimbabwe',
    proposePrice: 'Offer Your Fare',
    suggestedPrice: 'Benchmark Rate',
    nearbyDrivers: 'Available Drivers',
    findingDrivers: 'Broadcasting fare offer to nearby drivers...',
    makeOffer: 'Request Ride',
    counterOffer: 'Driver Counter-Offer',
    acceptOffer: 'Accept Driver',
    acceptRide: 'Accept Fare',
    rejectRide: 'Decline',
    counterTo: 'Counter-Propose',
    arrivedPickup: 'Driver Arrived',
    startTrip: 'Start Journey',
    completeTrip: 'Complete & Collect',
    payWith: 'Payment Method',
    cashToDriver: 'Cash in Hand (USD / ZiG)',
    ecocash: 'EcoCash Mobile Money',
    onemoney: 'OneMoney',
    innbucks: 'InnBucks USD',
    card: 'Bank Card / Zimswitch',
    emergencySOS: 'Emergency SOS Rapid Dispatch',
    sosSub: 'Broadcasts live GPS coordinates to Emergency Response Team and Security Desk',
    managePermit: 'Statutory Ministry Transport Permit',
    permitStatus: 'Permit Validity Status',
    walletLedger: 'Earnings & Cash Debt Ledger',
    debtWarning: 'Warning: Cash Debt has reached $15.00 limit. Settle balance to resume dispatch.',
    regulatorTitle: 'Republic of Zimbabwe — Ministry of Transport & Infrastructural Development',
    enforcerTitle: 'ZRP Traffic Law Enforcement Terminal'
  },
  sn: {
    appTitle: 'RideZW',
    tagline: 'Rwendo Rwako, Nguva Yese muZimbabwe',
    proposePrice: 'Taura Mutengo Wako',
    suggestedPrice: 'Mutengo Wakatarwa',
    nearbyDrivers: 'Vatyairi Vave Pedyo',
    findingDrivers: 'Tiri kutsvaga vatyairi...',
    makeOffer: 'Kumbira Rwendo',
    counterOffer: 'Mutengo Mutsha Wemutyairi',
    acceptOffer: 'Bvuma Mutyairi Uyu',
    acceptRide: 'Bvuma Rwendo',
    rejectRide: 'Ramba',
    counterTo: 'Kumbira Mutengo we',
    arrivedPickup: 'Mutyairi Asvika',
    startTrip: 'Tanga Rwendo',
    completeTrip: 'Pedza Rwendo',
    payWith: 'Nzira Yekubhadhara',
    cashToDriver: 'Mari Muruoko kumutyairi',
    ecocash: 'EcoCash Mobile Money',
    onemoney: 'OneMoney',
    innbucks: 'InnBucks USD',
    card: 'Kadhi (Visa/Mastercard)',
    emergencySOS: 'Rubatsiro Rwechimbichimbi SOS',
    sosSub: 'Inotumira GPS kuvanhu vepedyo neboka rezvekuchengetedzwa',
    managePermit: 'Bepa reHurumende Rokutakura Vanhu',
    permitStatus: 'Mamiriro ePfemiti',
    walletLedger: 'Chikwama Chemarisirwo neZvikwereti zveCash',
    debtWarning: 'Yambiro: Chikwereti cheCash chapfuura $15.00. Bhadhara kuti ubate basa.',
    regulatorTitle: 'Hurumende yeZimbabwe — Bazi Rezvekutakurwa Kwevanhu',
    enforcerTitle: 'Mudziyo Wemapurisa eTraffic Okutarisa Pfemiti'
  },
  nd: {
    appTitle: 'RideZW',
    tagline: 'Inani Lakho, Uhambo Lwakho eZimbabwe',
    proposePrice: 'Nika Inani Lakho',
    suggestedPrice: 'Inani Elilinganisiweyo',
    nearbyDrivers: 'Abatshayeli Abaseduze',
    findingDrivers: 'Kudingwa abatshayeli abaseduze...',
    makeOffer: 'Cela Uhambo',
    counterOffer: 'Inani Elitsha Lomtshayeli',
    acceptOffer: 'Vuma Umtshayeli Lo',
    acceptRide: 'Vuma Uhambo',
    rejectRide: 'Yala',
    counterTo: 'Cela Inani le',
    arrivedPickup: 'Umtshayeli Ufikile',
    startTrip: 'Qalisa Uhambo',
    completeTrip: 'Qeda Uhambo',
    payWith: 'Indlela Yokubhadala',
    cashToDriver: 'Imali Esandleni kumtshayeli',
    ecocash: 'EcoCash Mobile Money',
    onemoney: 'OneMoney',
    innbucks: 'InnBucks USD',
    card: 'Ikhadi (Visa/Mastercard)',
    emergencySOS: 'Usizo Olukhawulezileyo SOS',
    sosSub: 'Ithumela i-GPS emulini leqenjini lezimo eziphuthumayo',
    managePermit: 'Imvume kaHulumende Yokuthwala Abantu',
    permitStatus: 'Isimo Semvume',
    walletLedger: 'Isikhwama Senzuzo Lezikwelede ze-Cash',
    debtWarning: 'Isixwayiso: Isikwelede se-Cash sedlule $15.00. Bhadala ukuze uqalise umsebenzi.',
    regulatorTitle: 'Uhulumende weZimbabwe — Umnyango Wezokuthutha',
    enforcerTitle: 'Ithuluzi Lamapholisa e-Traffic Lokuhlola Imvume'
  }
};

export const TRANSLATIONS = LOCALIZED_TEXTS;

