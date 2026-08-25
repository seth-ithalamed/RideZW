import * as SecureStore from 'expo-secure-store';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');
const ACCESS = 'ridezw_access_token';
const REFRESH = 'ridezw_refresh_token';

export interface MobileTrip {
  id: string;
  riderId: string;
  driverId?: string;
  category: string;
  status: 'requested' | 'negotiating' | 'driver_accepted' | 'rider_confirmed' | 'driver_arriving' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
  pickup: string;
  destination: string;
  pickupLat?: number;
  pickupLng?: number;
  destLat?: number;
  destLng?: number;
  proposedFareUSD?: number;
  agreedFareUSD?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  driverName?: string;
  driverPhone?: string;
  driverRating?: number;
  driverVehicle?: {
    make: string;
    model: string;
    plateNumber: string;
    color?: string;
  };
  offers?: Array<{
    id: string;
    tripId: string;
    driverId: string;
    offeredAmount: number;
    status: string;
    driverName?: string;
    driverRating?: number;
    vehicleModel?: string;
    etaMinutes?: number;
  }>;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface PaymentOrderResponse {
  success: boolean;
  clientReference: string;
  paymeURL?: string;
  status: string;
  error?: string;
}

export interface PaymentStatusResponse {
  clientReference: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  isPaid: boolean;
  error?: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = API_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  if (!baseUrl) {
    throw new Error('API URL is not configured. Set EXPO_PUBLIC_API_URL.');
  }

  let token = await SecureStore.getItemAsync(ACCESS).catch(() => null);
  
  let response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  // Auto-attempt token refresh if 401 Unauthorized
  if (response.status === 401 && token) {
    const refreshToken = await SecureStore.getItemAsync(REFRESH).catch(() => null);
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${baseUrl}/api/mobile/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });
        const refreshData = await refreshRes.json();
        if (refreshRes.ok && refreshData.session?.access_token) {
          await SecureStore.setItemAsync(ACCESS, refreshData.session.access_token);
          if (refreshData.session.refresh_token) {
            await SecureStore.setItemAsync(REFRESH, refreshData.session.refresh_token);
          }
          token = refreshData.session.access_token;
          // Retry request with new token
          response = await fetch(`${baseUrl}${path}`, {
            ...options,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
              ...(options.headers || {})
            }
          });
        }
      } catch {
        // Refresh failed, proceed to handle original response
      }
    }
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.error?.message || body?.error || body?.message || 'RideZW API request failed');
  }
  return body as T;
}

export const ridezwApi = {
  health: () => request<{ status: string; databaseConnected?: boolean; services?: Record<string, boolean> }>('/api/health'),
  state: () => request<Record<string, unknown>>('/api/state'),
  
  // Mobile Authentication
  signIn: async (email: string, password: string) => {
    const r = await request<any>('/api/mobile/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (r.session?.access_token) {
      await SecureStore.setItemAsync(ACCESS, r.session.access_token);
      await SecureStore.setItemAsync(REFRESH, r.session.refresh_token || '');
    }
    return r.user;
  },

  signUp: async (email: string, password: string, role: 'rider' | 'driver', name: string, phone?: string) => {
    const r = await request<any>('/api/mobile/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, role, name, phone })
    });
    if (r.session?.access_token) {
      await SecureStore.setItemAsync(ACCESS, r.session.access_token);
      await SecureStore.setItemAsync(REFRESH, r.session.refresh_token || '');
    }
    return r.user;
  },

  me: () => request<{ user: any }>('/api/mobile/auth/me').then(r => r.user),
  
  signOut: async () => {
    await SecureStore.deleteItemAsync(ACCESS).catch(() => {});
    await SecureStore.deleteItemAsync(REFRESH).catch(() => {});
  },

  // Trips & Ride Lifecycle
  createTrip: (trip: Record<string, unknown>) => 
    request<{ success: boolean; trip: MobileTrip }>('/api/mobile/trips', {
      method: 'POST',
      body: JSON.stringify(trip)
    }),

  getTrip: (tripId: string) =>
    request<{ success: boolean; trip: MobileTrip }>(`/api/mobile/trips/${tripId}`),

  activeTrips: () => 
    request<{ trips: MobileTrip[] }>('/api/mobile/trips/active'),

  setDriverAvailability: (isOnline: boolean, latitude?: number, longitude?: number) =>
    request<{ success: boolean; driver: any }>('/api/mobile/driver/availability', {
      method: 'POST',
      body: JSON.stringify({ isOnline, latitude, longitude })
    }),

  submitOffer: (tripId: string, offeredAmount: number) =>
    request<{ offer: any }>(`/api/mobile/trips/${tripId}/offers`, {
      method: 'POST',
      body: JSON.stringify({ offeredAmount })
    }),

  updateTripStatus: (tripId: string, status: string, reason?: string) =>
    request<{ success: boolean; trip: MobileTrip }>(`/api/mobile/trips/${tripId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason })
    }),

  // OpenAPI Africa / ClicknPay Payments
  createPaymentOrder: (params: {
    amount: number;
    currency?: 'USD' | 'ZWG';
    customerPhone: string;
    customerEmail?: string;
    description: string;
    productName?: string;
    purpose?: string;
    relatedId?: string;
    orderReference?: string;
    returnUrl?: string;
  }) =>
    request<PaymentOrderResponse>('/api/payments/orders', {
      method: 'POST',
      body: JSON.stringify(params)
    }),

  getPaymentStatus: (clientReference: string) =>
    request<PaymentStatusResponse>(`/api/payments/orders/${encodeURIComponent(clientReference)}/status`),

  // Emergency SOS
  triggerEmergencySos: (params: { tripId?: string; lat: number; lng: number; address: string }) =>
    request<{ success: boolean; alertId: string }>('/api/sos', {
      method: 'POST',
      body: JSON.stringify(params)
    })
};
