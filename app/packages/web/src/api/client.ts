import type { DashboardStats, Incident, IncidentFilters, Service } from '@sentinelops/shared';
import { fixtureData, fixtureStats } from '../data/fixtures';
const baseUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:4100';
async function fetchJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${baseUrl}${path}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}
export async function getServices(): Promise<Service[]> {
  return fetchJson('/api/services', fixtureData.services);
}
export async function getStats(): Promise<DashboardStats> {
  return fetchJson('/api/stats', fixtureStats);
}
export async function getIncidents(filters: IncidentFilters): Promise<Incident[]> {
  const params = new URLSearchParams();
  if (filters.severity) params.set('severity', filters.severity);
  if (filters.status) params.set('status', filters.status);
  if (filters.serviceId) params.set('serviceId', filters.serviceId);
  if (filters.search) params.set('search', filters.search);
  const qs = params.toString();
  return fetchJson(`/api/incidents${qs ? `?${qs}` : ''}`, fixtureData.incidents);
}
