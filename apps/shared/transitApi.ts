import * as SecureStore from 'expo-secure-store';

const base = ((typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) || 'https://ridezw-platform.onrender.com').replace(/\/$/, '');
const ACCESS = 'ridezw_access_token';
async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await SecureStore.getItemAsync(ACCESS).catch(() => null);
  const response = await fetch(base + path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}), ...(options.headers || {}) }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || body.message || 'Transit request failed');
  return body as T;
}
export const transitApi = {
  departures: (serviceType: string) => api<{ departures: any[] }>('/api/mobility/departures?serviceType=' + encodeURIComponent(serviceType)),
  book: (data: any) => api<any>('/api/mobility/bookings', { method: 'POST', body: JSON.stringify(data) }),
  provider: () => api<{ departures: any[] }>('/api/provider/departures'),
  status: (id: string, status: string) => api<any>('/api/provider/bookings/' + id + '/status', { method: 'PATCH', body: JSON.stringify({ status }) })
};
