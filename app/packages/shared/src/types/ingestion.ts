import type { IncidentStatus } from './incident';
import type { Severity } from './severity';
export interface IncomingIncidentPayload {
  serviceId: string;
  title: string;
  summary?: string;
  severity: Severity | string;
  status?: IncidentStatus | string;
  source?: string;
  tags?: string[];
  observedAt?: string;
}
export interface ValidationIssue {
  field: string;
  message: string;
}
