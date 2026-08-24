import { Trip, DriverProfile, RiderProfile, LedgerEntry, SosAlert, ActiveSession } from '../types';

// Compatibility adapter: the web client never connects to Supabase directly.
// All persistence and reads are handled by the RideZW backend.
async function backend(path: string, options: RequestInit = {}): Promise<any> {
  const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error || body?.message || 'Backend persistence request failed');
  return body;
}

export function getSupabase(): null { return null; }
export function isSupabaseConfigured(): boolean { return typeof window !== 'undefined'; }
export async function syncTripToSupabase(trip: Trip): Promise<boolean> { await backend('/api/trips', { method: 'POST', body: JSON.stringify(trip) }); return true; }
export async function syncDriverToSupabase(driver: DriverProfile): Promise<boolean> { await backend('/api/drivers', { method: 'POST', body: JSON.stringify(driver) }); return true; }
export async function syncRiderToSupabase(rider: RiderProfile): Promise<boolean> { await backend('/api/riders', { method: 'POST', body: JSON.stringify(rider) }); return true; }
export async function syncSosToSupabase(sos: SosAlert): Promise<boolean> { await backend('/api/sos', { method: 'POST', body: JSON.stringify(sos) }); return true; }
export async function syncLedgerEntryToSupabase(entry: LedgerEntry): Promise<boolean> { await backend('/api/ledger', { method: 'POST', body: JSON.stringify(entry) }); return true; }
export async function syncUserSessionToSupabase(session: ActiveSession): Promise<boolean> { await backend('/api/sessions/register', { method: 'POST', body: JSON.stringify(session) }); return true; }
export async function syncSeedDataToSupabase(data: Record<string, unknown>): Promise<boolean> { await backend('/api/seed', { method: 'POST', body: JSON.stringify(data) }); return true; }
export async function fetchAllDataFromSupabase(): Promise<any> { const result = await backend('/api/state'); return result?.data || null; }
export function subscribeToRealtimeUpdates(_callbacks: Record<string, unknown>): () => void { return () => {}; }
export const SUPABASE_SQL_SCHEMA = '';
