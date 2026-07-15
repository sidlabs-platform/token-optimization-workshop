// workshop reference solution — app/packages/shared/src/lib/acknowledge.test.ts
import { describe, expect, it } from 'vitest';
import type { Incident } from '../types/incident';
import type { OnCallEngineer } from '../types/oncall';
import { acknowledgeIncident, isAcknowledged, isAcknowledgeable } from './acknowledge';

const NOW = '2026-07-13T10:00:00.000Z';
const LATER = '2026-07-13T11:30:00.000Z';

function makeIncident(overrides: Partial<Incident> = {}): Incident {
  return {
    id: 'inc-1',
    serviceId: 'auth-gateway',
    title: 'Elevated 5xx',
    summary: 'Error rate spike on login',
    severity: 'high',
    status: 'open',
    source: 'prometheus',
    tags: ['errors'],
    createdAt: '2026-07-13T09:00:00.000Z',
    updatedAt: '2026-07-13T09:00:00.000Z',
    fingerprint: 'fp-1',
    duplicateCount: 1,
    ...overrides,
  };
}

const onShift: OnCallEngineer = { id: 'eng-1', name: 'Ada', rotation: 'platform-primary', active: true };
const offShift: OnCallEngineer = { id: 'eng-2', name: 'Ben', rotation: 'platform-backup', active: false };

describe('isAcknowledgeable', () => {
  it.each(['open', 'investigating', 'mitigated'] as const)('is true for %s', (status) => {
    expect(isAcknowledgeable(makeIncident({ status }))).toBe(true);
  });
  it('is false for resolved', () => {
    expect(isAcknowledgeable(makeIncident({ status: 'resolved' }))).toBe(false);
  });
});

describe('isAcknowledged', () => {
  it('is false when no acknowledger', () => {
    expect(isAcknowledged(makeIncident())).toBe(false);
  });
  it('is true when acknowledgedBy is set', () => {
    expect(isAcknowledged(makeIncident({ acknowledgedBy: 'eng-1' }))).toBe(true);
  });
});

describe('acknowledgeIncident', () => {
  it('acknowledges an open incident and moves it to investigating', () => {
    const { incident, changed, reason } = acknowledgeIncident(makeIncident(), onShift, NOW);
    expect(changed).toBe(true);
    expect(reason).toBeUndefined();
    expect(incident.acknowledgedBy).toBe('eng-1');
    expect(incident.acknowledgedAt).toBe(NOW);
    expect(incident.status).toBe('investigating');
    expect(incident.updatedAt).toBe(NOW);
  });

  it('preserves a non-open status when acknowledging', () => {
    const { incident, changed } = acknowledgeIncident(makeIncident({ status: 'mitigated' }), onShift, NOW);
    expect(changed).toBe(true);
    expect(incident.status).toBe('mitigated');
    expect(incident.acknowledgedBy).toBe('eng-1');
  });

  it('rejects acknowledgement from an off-shift engineer', () => {
    const original = makeIncident();
    const { incident, changed, reason } = acknowledgeIncident(original, offShift, NOW);
    expect(changed).toBe(false);
    expect(reason).toBe('engineer-not-on-shift');
    expect(incident).toBe(original);
  });

  it('rejects acknowledgement of a resolved incident', () => {
    const original = makeIncident({ status: 'resolved' });
    const { changed, reason } = acknowledgeIncident(original, onShift, NOW);
    expect(changed).toBe(false);
    expect(reason).toBe('incident-resolved');
  });

  it('is idempotent: re-ack keeps original acknowledger but refreshes updatedAt', () => {
    const first = acknowledgeIncident(makeIncident(), onShift, NOW).incident;
    const secondEngineer: OnCallEngineer = { id: 'eng-9', name: 'Cy', rotation: 'r', active: true };
    const { incident, changed } = acknowledgeIncident(first, secondEngineer, LATER);
    expect(changed).toBe(false);
    expect(incident.acknowledgedBy).toBe('eng-1');
    expect(incident.acknowledgedAt).toBe(NOW);
    expect(incident.updatedAt).toBe(LATER);
  });

  it('does not mutate the input incident', () => {
    const original = makeIncident();
    const snapshot = JSON.stringify(original);
    acknowledgeIncident(original, onShift, NOW);
    expect(JSON.stringify(original)).toBe(snapshot);
  });
});
