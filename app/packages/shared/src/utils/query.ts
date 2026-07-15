import type { Incident } from '../types/incident';
import type { IncidentFilters } from '../types/filters';
export function incidentMatchesFilters(incident: Incident, filters: IncidentFilters): boolean {
  if (filters.severity && incident.severity !== filters.severity) return false;
  if (filters.serviceId && incident.serviceId !== filters.serviceId) return false;
  if (filters.status && incident.status !== filters.status) return false;
  if (filters.search?.trim()) {
    const needle = filters.search.trim().toLowerCase();
    const haystack =
      `${incident.title} ${incident.summary} ${incident.tags.join(' ')}`.toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  return true;
}
