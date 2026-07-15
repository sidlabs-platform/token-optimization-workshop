// workshop reference solution — app/packages/shared/src/lib/assignment.ts
// Pure incident-assignment logic (ownership hand-off between on-call engineers).
import type { Incident } from '../types/incident';
import type { OnCallEngineer } from '../types/oncall';

/**
 * Assign (or re-assign) an incident to an on-call engineer.
 *
 * Rules:
 *  - The engineer must be active (on shift).
 *  - Resolved incidents cannot be re-assigned.
 *  - Assigning is allowed even before acknowledgement; it does not change status.
 */
export function assignIncident(
  incident: Incident,
  engineer: OnCallEngineer,
  now: string,
): { incident: Incident; changed: boolean; reason?: string } {
  if (!engineer.active) {
    return { incident, changed: false, reason: 'engineer-not-on-shift' };
  }
  if (incident.status === 'resolved') {
    return { incident, changed: false, reason: 'incident-resolved' };
  }
  if (incident.assignee === engineer.id) {
    return { incident, changed: false };
  }
  return {
    incident: { ...incident, assignee: engineer.id, updatedAt: now },
    changed: true,
  };
}
