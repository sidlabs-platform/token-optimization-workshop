import type { IncomingIncidentPayload, ValidationIssue } from './types/ingestion';
import { isSeverity } from './types/severity';
const statuses = ['open', 'investigating', 'mitigated', 'resolved'];
export function validateIncomingIncident(payload: IncomingIncidentPayload): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!payload.serviceId?.trim())
    issues.push({ field: 'serviceId', message: 'serviceId is required' });
  if (!payload.title?.trim()) issues.push({ field: 'title', message: 'title is required' });
  if (!isSeverity(payload.severity))
    issues.push({ field: 'severity', message: 'severity must be critical, high, medium, or low' });
  if (payload.status && !statuses.includes(payload.status))
    issues.push({ field: 'status', message: 'status is invalid' });
  if (payload.observedAt && Number.isNaN(Date.parse(payload.observedAt)))
    issues.push({ field: 'observedAt', message: 'observedAt must be an ISO date' });
  return issues;
}
