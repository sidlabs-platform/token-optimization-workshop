import type { Incident } from '../types/incident';
import type { IncomingIncidentPayload } from '../types/ingestion';
import { fingerprint } from '../utils/id';
export function createAlertFingerprint(
  payload: Pick<IncomingIncidentPayload, 'serviceId' | 'title' | 'severity'>,
): string {
  return fingerprint([payload.serviceId, payload.title, payload.severity]);
}
export function findDuplicateIncident(incidents: Incident[], fp: string): Incident | undefined {
  return incidents.find(
    (incident) => incident.fingerprint === fp && incident.status !== 'resolved',
  );
}
export function mergeDuplicateIncident(existing: Incident, observedAt: string): Incident {
  return { ...existing, duplicateCount: existing.duplicateCount + 1, updatedAt: observedAt };
}
