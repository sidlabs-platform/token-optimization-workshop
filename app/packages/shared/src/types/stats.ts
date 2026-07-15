import type { IncidentStatus } from './incident';
import type { Severity } from './severity';
export interface DashboardStats {
  serviceCount: number;
  openIncidentCount: number;
  averageHealthScore: number;
  incidentsBySeverity: Record<Severity, number>;
  incidentsByStatus: Record<IncidentStatus, number>;
  topImpactedServices: Array<{ serviceId: string; name: string; incidentCount: number }>;
}
