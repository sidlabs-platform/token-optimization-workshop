import { describe, expect, it } from 'vitest';
import { hasActiveIncidentFilters, incidentMatchesFilters } from '../index';
const incident = {
  id: 'i1',
  serviceId: 'auth',
  title: 'Auth latency spike',
  summary: 'Token calls slow',
  severity: 'critical' as const,
  status: 'open' as const,
  source: 'manual' as const,
  tags: ['auth', 'latency'],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  fingerprint: 'fp',
  duplicateCount: 1,
};
describe('incident filtering', () => {
  it.each([
    { severity: 'critical' as const },
    { serviceId: 'auth' },
    { status: 'open' as const },
    { search: 'token' },
    { search: 'latency' },
  ])('matches filter %o', (filter) => expect(incidentMatchesFilters(incident, filter)).toBe(true));
  it.each([
    { severity: 'low' as const },
    { serviceId: 'billing' },
    { status: 'resolved' as const },
    { search: 'database' },
  ])('rejects filter %o', (filter) => expect(incidentMatchesFilters(incident, filter)).toBe(false));
  it.each([
    [{}, false],
    [{ search: '   ' }, false],
    [{ severity: 'high' }, true],
    [{ serviceId: 'auth' }, true],
    [{ status: 'open' }, true],
    [{ search: 'api' }, true],
  ])('detects active filters', (filter, expected) =>
    expect(hasActiveIncidentFilters(filter as any)).toBe(expected),
  );
});
