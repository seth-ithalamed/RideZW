export type UserRole = 'rider' | 'driver' | 'admin' | 'regulator' | 'enforcer';

export type Language = 'en' | 'sn' | 'nd'; // English, Shona, Ndebele

export type Currency = 'USD' | 'ZWG'; // USD and Zimbabwe Gold (ZiG)

export type VehicleCategory = 'economy' | 'comfort' | 'xl' | 'motorbike';

export interface Vehicle {
  id: string;
  driverId: string;
  make: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  category: VehicleCategory;
  capacity: number;
  fitnessCertNumber?: string;
  fitnessExpiry?: string;
  insuranceNumber?: string;
  insuranceExpiry?: string;
}

export type PlatformKYCStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface CoverageCity {
  id: string;
  name: string;
  province: string;
  status: 'active' | 'coming_soon' | 'inactive';
  code: string;
  activeDriversCount?: number;
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  baseFareMultiplier: number;
  supportedCategories: VehicleCategory[];
  isPrimaryHub?: boolean;
}

export interface KycDocument {
  id: string;
  driverId: string;
  docType: 'national_id' | 'driver_license' | 'vehicle_registration' | 'police_clearance' | 'fitness_certificate' | 'public_insurance' | 'vehicle_photo';
  title: string;
  fileUrl: string;
  status: 'verified' | 'pending' | 'rejected' | 'expired';
  expiryDate?: string;
  uploadedAt: string;
  notes?: string;
}

export interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  nationalId: string;
  email: string;
  avatarUrl: string;
  kycStatus: PlatformKYCStatus;
  kycRejectionReason?: string;
  vehicle: Vehicle;
  rating: number;
  totalTrips: number;
  isOnline: boolean;
  currentLat: number;
  currentLng: number;
  city: string;
  // Financials
  subscriptionTier: 'commission' | 'weekly_pass' | 'monthly_pass';
  subscriptionExpiry?: string;
  walletBalance: number; // computed from ledger (can be negative if cash-trip debt exceeds earnings)
  cashDebtCeiling: number; // e.g. $15.00 limit before being blocked
  isBlockedDueToDebt: boolean;
  // Documents
  documents: KycDocument[];
  // Linked Government Permit info (fetched via read-only Compliance API)
  governmentPermitStatus?: 'valid' | 'expired' | 'suspended' | 'revoked' | 'not_found';
  governmentPermitNumber?: string;
  governmentPermitExpiry?: string;
  governmentPermitType?: string;
  registeredAt: string;
}

export type RiderAccountStatus = 'active' | 'suspended' | 'banned' | 'unverified';
export type RiderAccountType = 'standard' | 'corporate' | 'vip';

export interface RiderProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  nationalId?: string;
  avatarUrl: string;
  rating: number;
  totalTrips: number;
  emergencyContactName: string;
  emergencyContactPhone: string;
  preferredLanguage: Language;
  preferredPaymentMethod: PaymentMethod;
  referralCode: string;
  walletBalance: number;
  city: string;
  status: RiderAccountStatus;
  accountType: RiderAccountType;
  registeredAt: string;
  notes?: string;
  companyName?: string;
}

export type TripStatus =
  | 'requested'
  | 'negotiating'
  | 'driver_accepted'
  | 'rider_confirmed'
  | 'driver_arriving'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type PaymentMethod = 'cash' | 'clicknpay' | 'ecocash' | 'onemoney' | 'innbucks' | 'telecash' | 'zipit_bank' | 'card';

export interface LocationPoint {
  address: string;
  neighborhood: string;
  city: string;
  lat: number;
  lng: number;
}

export interface FareOffer {
  id: string;
  tripId: string;
  driverId: string;
  driverName: string;
  driverAvatar: string;
  driverRating: number;
  driverTotalTrips: number;
  vehicleModel: string;
  vehiclePlate: string;
  offeredAmount: number; // USD
  etaMinutes: number;
  distanceKm: number;
  createdAt: string;
  status: 'pending' | 'accepted_by_rider' | 'declined' | 'expired';
}

export interface Trip {
  id: string;
  riderId: string;
  riderName: string;
  riderPhone: string;
  riderAvatar: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverAvatar?: string;
  driverVehicle?: Vehicle;
  pickup: LocationPoint;
  destination: LocationPoint;
  category: VehicleCategory;
  distanceKm: number;
  estimatedDurationMin: number;
  upfrontEstimateUSD: number;
  proposedFareUSD: number; // Rider's initial proposed price
  agreedFareUSD: number; // Final negotiated price
  offers: FareOffer[];
  status: TripStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentProviderRef?: string;
  commissionOwedUSD: number;
  cashLevyOwedUSD: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  riderRating?: number;
  riderComment?: string;
  driverRating?: number;
  driverComment?: string;
  sosTriggered?: boolean;
  disputeId?: string;
  routeProgress?: number; // 0 to 100 for live animation
}

// Financial Ledger Entry (Append-Only source of truth)
export type LedgerEntryType =
  | 'trip_fare_credit'
  | 'platform_commission_debit'
  | 'cash_trip_levy_debit'
  | 'subscription_fee_debit'
  | 'driver_topup_credit'
  | 'payout_withdrawal_debit'
  | 'payout_refund_credit'
  | 'dispute_adjustment_credit'
  | 'dispute_adjustment_debit';

export interface LedgerEntry {
  id: string;
  driverId: string;
  tripId?: string;
  entryType: LedgerEntryType;
  amount: number; // Positive = credit (earning/top-up), Negative = debit (commission/levy/payout)
  balanceAfter: number;
  currency: 'USD';
  description: string;
  referenceId: string;
  paymentMethod?: PaymentMethod;
  status: 'posted' | 'pending' | 'reversed';
  createdAt: string;
}

export interface PayoutRequest {
  id: string;
  driverId: string;
  driverName: string;
  amountUSD: number;
  method: 'ecocash' | 'onemoney' | 'innbucks' | 'telecash' | 'bank_transfer' | 'cash_office';
  accountNumber: string;
  accountName: string;
  status: 'requested' | 'processing' | 'paid' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  transactionRef?: string;
  reviewedBy?: string;
  notes?: string;
}

export interface Dispute {
  id: string;
  tripId: string;
  reporterRole: 'rider' | 'driver';
  reporterId: string;
  reporterName: string;
  reason: 'incorrect_fare_reported' | 'driver_demanded_extra' | 'route_deviation' | 'safety_concern' | 'cash_payment_discrepancy';
  description: string;
  reportedAmountUSD?: number;
  actualAgreedAmountUSD?: number;
  status: 'open' | 'under_review' | 'resolved_refund' | 'resolved_dismissed';
  resolutionNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface SosAlert {
  id: string;
  tripId: string;
  triggeredBy: 'rider' | 'driver';
  userId: string;
  userName: string;
  userPhone: string;
  lat: number;
  lng: number;
  address: string;
  timestamp: string;
  status: 'active' | 'police_dispatched' | 'resolved' | 'false_alarm';
  emergencyContactsNotified: string[];
}

export interface PricingConfig {
  category: VehicleCategory;
  name: string;
  baseFareUSD: number;
  perKmUSD: number;
  perMinuteUSD: number;
  minimumFareUSD: number;
  commissionPercentage: number; // e.g. 12%
  cashLevyPercentage: number; // e.g. 12%
  surgeMultiplier: number;
  iconName: string;
}

export interface PlatformSettings {
  primaryCurrency: 'USD';
  displayCurrency: 'USD' | 'ZWG';
  exchangeRateUSDToZWG: number; // e.g. 26.5 ZiG per USD
  driverDebtCeilingUSD: number; // e.g. $15.00
  subscriptionWeeklyUSD: number; // e.g. $7.00
  subscriptionMonthlyUSD: number; // e.g. $25.00
  enforceGovernmentPermitGating: boolean; // Toggle: block drivers with no valid permit from going online
  serviceRadiusKm: number;
  autoApprovePayoutUnderUSD: number; // e.g. $20.00
}

// -------------------------------------------------------------
// GOVERNMENT OPERATIONS PERMIT & COMPLIANCE REGISTRY TYPES
// (Independently owned & governed by Transport Regulatory Authority)
// -------------------------------------------------------------

export type PermitStatus = 'submitted' | 'under_review' | 'info_requested' | 'approved' | 'active' | 'expired' | 'suspended' | 'revoked' | 'rejected' | 'appealed';

export interface PermitTypeConfig {
  id: string;
  code: string; // 'PHC-URBAN', 'MOTO-BODA', 'XL-VAN', 'INTER-CITY'
  name: string;
  description: string;
  validityMonths: number;
  applicationFeeUSD: number;
  renewalFeeUSD: number;
  lateRenewalPenaltyUSD: number;
  reinstatementFeeUSD: number;
  zoneScope: 'Harare_Metro' | 'Bulawayo_Metro' | 'National';
  requiredDocumentTypes: Array<{
    id: string;
    name: string;
    validityCycleMonths?: number;
    mandatory: boolean;
  }>;
  isActive: boolean;
}

export interface GovernmentPermit {
  id: string;
  permitNumber: string; // e.g. "ZW-MOT-2026-0841"
  nationalId: string;
  driverFullName: string;
  phone: string;
  email: string;
  permitTypeId: string;
  permitTypeName: string;
  status: PermitStatus;
  statusReason?: string;
  vehicleRegistration: string;
  vehicleMakeModel: string;
  vehicleYear: number;
  vehicleCategory: VehicleCategory;
  issueDate?: string;
  expiryDate?: string;
  issuingAuthority: string; // "Ministry of Transport and Infrastructural Development - Republic of Zimbabwe"
  qrCodeSignature: string; // cryptographic hash/ref for roadside scanning
  zone: string;
  photoLivenessVerified: boolean;
  documents: Array<{
    docTypeId: string;
    docName: string;
    fileUrl: string;
    verified: boolean;
    expiryDate?: string;
    status: 'valid' | 'expired' | 'rejected' | 'pending';
  }>;
  createdAt: string;
  lastUpdated: string;
  reviewedByOfficialId?: string;
  historyAudit: ComplianceEvent[];
}

export interface PermitFeeRecord {
  id: string;
  permitId: string;
  permitNumber: string;
  applicantName: string;
  feeType: 'application' | 'renewal' | 'late_penalty' | 'reinstatement';
  amountUSD: number;
  paymentMethod: 'ecocash' | 'onemoney' | 'innbucks' | 'card';
  paymentRef: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  paidAt: string;
}

export interface PermitAppeal {
  id: string;
  permitId: string;
  permitNumber: string;
  driverName: string;
  nationalId: string;
  reasonForAppeal: string;
  supportingEvidenceUrl?: string;
  status: 'submitted' | 'under_tribunal_review' | 'upheld_reinstated' | 'rejected';
  reviewerOfficialId?: string;
  decisionNotes?: string;
  submittedAt: string;
  decidedAt?: string;
}

export interface ComplianceEvent {
  id: string;
  permitId: string;
  permitNumber: string;
  eventType: 'submitted' | 'document_verified' | 'fee_paid' | 'approved' | 'issued' | 'rejected' | 'suspended' | 'revoked' | 'reinstated' | 'renewed' | 'appealed' | 'fine_issued' | 'inspected';
  actor: string; // "Official: T. Moyo (Senior Approver)" or "System" or "Enforcer: Officer Mutasa"
  actorRole: string;
  timestamp: string;
  notes: string;
}

export interface EnforcementFine {
  id: string;
  ticketNumber: string; // e.g. "TF-2026-0924"
  permitNumber?: string;
  nationalId: string;
  driverName: string;
  vehiclePlate: string;
  enforcerId: string;
  enforcerName: string;
  enforcerBadge: string;
  violationReason:
    | 'operating_without_permit'
    | 'expired_permit'
    | 'suspended_permit_operation'
    | 'unregistered_e_hailing_vehicle'
    | 'expired_fitness_certificate'
    | 'no_public_liability_insurance';
  fineAmountUSD: number;
  locationName: string;
  lat: number;
  lng: number;
  notes: string;
  evidencePhotoUrl?: string;
  isSynced: boolean; // For offline PWA sync
  issuedAt: string;
  paymentStatus: 'unpaid' | 'paid_on_spot' | 'court_summons';
}

export interface PlatformIntegrator {
  id: string;
  platformName: string; // e.g. "RideZW Core Platform", "RideZW Corporate & Fleet Gateway"
  apiKey: string;
  status: 'active' | 'rate_limited' | 'suspended';
  rateLimitTier: 'standard' | 'enterprise';
  lookupsCount: number;
  onboardedAt: string;
  lastActiveAt: string;
  webhookUrl?: string;
}

export interface PlatformLookupLog {
  id: string;
  platformId: string;
  platformName: string;
  driverNationalId: string;
  returnedStatus: string;
  queriedAt: string;
  ipAddress: string;
}

export interface PlatformTripReport {
  id: string;
  platformId: string;
  platformName: string;
  driverNationalId: string;
  periodMonth: string; // "2026-08"
  tripCount: number;
  totalDistanceKm: number;
  totalActiveHours: number;
  reportedAt: string;
}

export type AdminRole = 
  | 'super_admin'
  | 'operations_manager'
  | 'dispatch_officer'
  | 'financial_auditor'
  | 'kyc_compliance_lead'
  | 'customer_support_agent';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AdminRole;
  department: string;
  avatarUrl: string;
  status: 'active' | 'suspended' | 'invited';
  permissions: string[];
  lastLoginAt?: string;
  createdAt: string;
  isRootSuperAdmin?: boolean;
}

export type NavigationTab = 'landing' | 'rider' | 'driver' | 'admin';

export interface ActiveSession {
  userId: string;
  role: 'rider' | 'driver' | 'admin';
  sessionId: string;
  deviceId: string;
  loginTime: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface SessionTerminationNotice {
  userId: string;
  userName: string;
  terminatedAt: string;
  reason: string;
}
