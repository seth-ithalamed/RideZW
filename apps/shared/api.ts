const API_URL = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!API_URL) throw new Error('Set EXPO_PUBLIC_API_URL to the RideZW backend URL.');
  const response = await fetch(API_URL + path, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error?.message || body?.message || 'RideZW API request failed');
  return body;
}
export const ridezwApi = {
  health: () => request<{ status: string; databaseConnected?: boolean }>('/api/health'),
  state: () => request<Record<string, unknown>>('/api/state'),
  createTrip: (trip: Record<string, unknown>) => request('/api/trips', { method: 'POST', body: JSON.stringify(trip) }),
  updateDriver: (driver: Record<string, unknown>) => request('/api/drivers', { method: 'POST', body: JSON.stringify(driver) }),
};
