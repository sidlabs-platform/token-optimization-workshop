import type { Incident, IncomingIncidentPayload } from '@sentinelops/shared';
import {
  createAlertFingerprint,
  findDuplicateIncident,
  mergeDuplicateIncident,
  stableId,
  validateIncomingIncident,
} from '@sentinelops/shared';
import type { IncidentStore } from '../data/store';
export interface IngestionResult {
  accepted: boolean;
  incident?: Incident;
  duplicate: boolean;
  issues: Array<{ field: string; message: string }>;
}
export function ingestIncident(
  payload: IncomingIncidentPayload,
  store: IncidentStore,
): IngestionResult {
  const issues = validateIncomingIncident(payload);
  if (issues.length > 0) return { accepted: false, duplicate: false, issues };
  const observedAt = payload.observedAt ?? new Date('2026-01-15T12:00:00.000Z').toISOString();
  const fp = createAlertFingerprint({
    serviceId: payload.serviceId,
    title: payload.title,
    severity: payload.severity,
  });
  const duplicate = findDuplicateIncident(store.allIncidents(), fp);
  if (duplicate)
    return {
      accepted: true,
      duplicate: true,
      incident: store.upsertIncident(mergeDuplicateIncident(duplicate, observedAt)),
      issues: [],
    };
  const incident: Incident = {
    id: stableId('ing', [payload.serviceId, payload.title, observedAt]),
    serviceId: payload.serviceId,
    title: payload.title.trim(),
    summary: payload.summary?.trim() || payload.title.trim(),
    severity: payload.severity as Incident['severity'],
    status: (payload.status as Incident['status']) ?? 'open',
    source: (payload.source as Incident['source']) ?? 'manual',
    tags: payload.tags ?? [],
    createdAt: observedAt,
    updatedAt: observedAt,
    fingerprint: fp,
    duplicateCount: 1,
  };
  return { accepted: true, duplicate: false, incident: store.upsertIncident(incident), issues: [] };
}
