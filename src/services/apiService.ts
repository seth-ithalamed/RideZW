/**
 * Backend API Client Service
 * Dispatches all core domain events (trips, drivers, riders, ledger, SOS, sessions)
 * to the Express server API routes and database layer.
 */

import { Trip, DriverProfile, RiderProfile, LedgerEntry, SosAlert, ActiveSession } from '../types';

async function safePost(endpoint: string, payload: any): Promise<any> {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn(`[API] ${endpoint} returned status ${res.status}:`, err);
      return { success: false, status: res.status };
    }
    return await res.json();
  } catch (err) {
    console.warn(`[API] Network call to ${endpoint} failed:`, err);
    return { success: false, error: err };
  }
}

export async function persistTripToBackend(trip: Trip): Promise<boolean> {
  const result = await safePost('/api/trips', trip);
  return Boolean(result.success);
}

export async function persistDriverToBackend(driver: DriverProfile): Promise<boolean> {
  const result = await safePost('/api/drivers', driver);
  return Boolean(result.success);
}

export async function persistRiderToBackend(rider: RiderProfile): Promise<boolean> {
  const result = await safePost('/api/riders', rider);
  return Boolean(result.success);
}

export async function persistSosAlertToBackend(sos: SosAlert): Promise<boolean> {
  const result = await safePost('/api/sos', sos);
  return Boolean(result.success);
}

export async function persistLedgerEntryToBackend(entry: LedgerEntry): Promise<boolean> {
  const result = await safePost('/api/ledger', entry);
  return Boolean(result.success);
}

export async function persistSessionToBackend(session: ActiveSession): Promise<boolean> {
  const result = await safePost('/api/sessions/register', session);
  return Boolean(result.success);
}

export async function validateSessionWithBackend(userId: string, sessionId: string): Promise<{ valid: boolean; reason?: string }> {
  try {
    const res = await fetch('/api/sessions/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, sessionId })
    });
    if (!res.ok) return { valid: true };
    return await res.json();
  } catch {
    return { valid: true };
  }
}

export async function fetchBackendState(): Promise<any> {
  try {
    const res = await fetch('/api/state');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function checkBackendHealth(): Promise<{
  status: string;
  databaseConnected: boolean;
  services: Record<string, boolean>;
} | null> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
