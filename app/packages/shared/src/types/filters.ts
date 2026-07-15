import type { IncidentStatus } from './incident';
import type { Severity } from './severity';
export interface IncidentFilters {
  severity?: Severity;
  serviceId?: string;
  status?: IncidentStatus;
  search?: string;
}
export function hasActiveIncidentFilters(filters: IncidentFilters): boolean {
  return Boolean(filters.severity || filters.serviceId || filters.status || filters.search?.trim());
}
