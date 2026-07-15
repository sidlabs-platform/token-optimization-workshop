// workshop reference solution — app/packages/shared/src/lib/assignment.test.ts
import { describe, expect, it } from 'vitest';
import type { Incident } from '../types/incident';
import type { OnCallEngineer } from '../types/oncall';
import { assignIncident } from './assignment';

const NOW = '2026-07-13T10:00:00.000Z';

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

describe('assignIncident', () => {
  it('assigns an unowned incident to an on-shift engineer', () => {
    const { incident, changed, reason } = assignIncident(makeIncident(), onShift, NOW);
    expect(changed).toBe(true);
    expect(reason).toBeUndefined();
    expect(incident.assignee).toBe('eng-1');
    expect(incident.updatedAt).toBe(NOW);
  });

  it('does not change status when assigning', () => {
    const { incident } = assignIncident(makeIncident({ status: 'open' }), onShift, NOW);
    expect(incident.status).toBe('open');
  });

  it('rejects assignment to an off-shift engineer', () => {
    const original = makeIncident();
    const { incident, changed, reason } = assignIncident(original, offShift, NOW);
    expect(changed).toBe(false);
    expect(reason).toBe('engineer-not-on-shift');
    expect(incident).toBe(original);
  });

  it('rejects assignment of a resolved incident', () => {
    const { changed, reason } = assignIncident(makeIncident({ status: 'resolved' }), onShift, NOW);
    expect(changed).toBe(false);
    expect(reason).toBe('incident-resolved');
  });

  it('is a no-op when assigning to the current assignee', () => {
    const original = makeIncident({ assignee: 'eng-1' });
    const { incident, changed } = assignIncident(original, onShift, NOW);
    expect(changed).toBe(false);
    expect(incident).toBe(original);
  });

  it('re-assigns to a different engineer', () => {
    const original = makeIncident({ assignee: 'eng-0' });
    const { incident, changed } = assignIncident(original, onShift, NOW);
    expect(changed).toBe(true);
    expect(incident.assignee).toBe('eng-1');
  });

  it('does not mutate the input incident', () => {
    const original = makeIncident();
    const snapshot = JSON.stringify(original);
    assignIncident(original, onShift, NOW);
    expect(JSON.stringify(original)).toBe(snapshot);
  });
});
