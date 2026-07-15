import { describe, expect, it } from 'vitest';
import {
  createAlertFingerprint,
  findDuplicateIncident,
  mergeDuplicateIncident,
} from './alertDedup';
const incident = {
  id: 'i1',
  serviceId: 'svc',
  title: 'API latency',
  summary: 'slow',
  severity: 'high' as const,
  status: 'open' as const,
  source: 'manual' as const,
  tags: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  fingerprint: createAlertFingerprint({ serviceId: 'svc', title: 'API latency', severity: 'high' }),
  duplicateCount: 1,
};
describe('alert dedup', () => {
  it('creates stable fingerprints for equal payloads', () =>
    expect(
      createAlertFingerprint({ serviceId: 'svc', title: 'API latency', severity: 'high' }),
    ).toBe(incident.fingerprint));
  it('does not deduplicate resolved incidents', () =>
    expect(
      findDuplicateIncident([{ ...incident, status: 'resolved' }], incident.fingerprint),
    ).toBeUndefined());
  it('finds active duplicates by fingerprint', () =>
    expect(findDuplicateIncident([incident], incident.fingerprint)?.id).toBe('i1'));
  it('increments duplicate count while preserving id', () =>
    expect(mergeDuplicateIncident(incident, '2026-01-02T00:00:00.000Z')).toMatchObject({
      id: 'i1',
      duplicateCount: 2,
      updatedAt: '2026-01-02T00:00:00.000Z',
    }));
});
