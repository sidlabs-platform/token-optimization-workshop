// workshop reference solution — app/packages/shared/src/lib/acknowledge.ts
// Pure incident-acknowledgement logic. No I/O — trivial to unit test.
import type { Incident } from '../types/incident';
import type { OnCallEngineer } from '../types/oncall';

/** An incident is acknowledgeable while it is still active (not resolved). */
export function isAcknowledgeable(incident: Incident): boolean {
  return incident.status !== 'resolved';
}

/** True once someone has acknowledged the incident. */
export function isAcknowledged(incident: Incident): boolean {
  return Boolean(incident.acknowledgedBy);
}

/**
 * Acknowledge an incident on behalf of an on-call engineer.
 *
 * Rules:
 *  - The engineer must be active (on shift).
 *  - Resolved incidents cannot be acknowledged.
 *  - Re-acknowledging keeps the ORIGINAL acknowledgedAt/By (idempotent owner),
 *    but still bumps updatedAt so downstream caches invalidate.
 *  - An open incident transitions to `investigating` on first acknowledgement.
 */
export function acknowledgeIncident(
  incident: Incident,
  engineer: OnCallEngineer,
  now: string,
): { incident: Incident; changed: boolean; reason?: string } {
  if (!engineer.active) {
    return { incident, changed: false, reason: 'engineer-not-on-shift' };
  }
  if (!isAcknowledgeable(incident)) {
    return { incident, changed: false, reason: 'incident-resolved' };
  }
  if (isAcknowledged(incident)) {
    // Idempotent: preserve first acknowledger, refresh the timestamp only.
    return { incident: { ...incident, updatedAt: now }, changed: false };
  }
  const next: Incident = {
    ...incident,
    acknowledgedBy: engineer.id,
    acknowledgedAt: now,
    status: incident.status === 'open' ? 'investigating' : incident.status,
    updatedAt: now,
  };
  return { incident: next, changed: true };
}
