import type { Severity } from './severity';
export type IncidentStatus = 'open' | 'investigating' | 'mitigated' | 'resolved';
export interface Incident {
  id: string;
  serviceId: string;
  title: string;
  summary: string;
  severity: Severity;
  status: IncidentStatus;
  source: 'synthetic' | 'prometheus' | 'datadog' | 'pagerduty' | 'manual';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  fingerprint: string;
  duplicateCount: number;
}
