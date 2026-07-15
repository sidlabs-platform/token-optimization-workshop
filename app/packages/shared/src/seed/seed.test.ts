import { describe, expect, it } from 'vitest';
import { buildSeedData, buildIncidentSeed, summarizeSeedData } from './index';
describe('seed data', () => {
  it('generates at least two dozen services and hundreds of incidents', () => {
    const data = buildSeedData();
    expect(data.services.length).toBeGreaterThanOrEqual(24);
    expect(data.incidents.length).toBeGreaterThanOrEqual(300);
  });
  it('is deterministic across runs', () =>
    expect(buildIncidentSeed(12)).toEqual(buildIncidentSeed(12)));
  it.each([1, 7, 28, 60, 120])('generates requested incident count %i', (count) =>
    expect(buildIncidentSeed(count)).toHaveLength(count),
  );
  it('summarizes stable dashboard stats', () => {
    const data = buildSeedData();
    const stats = summarizeSeedData(data.services, data.incidents);
    expect(stats.serviceCount).toBe(28);
    expect(stats.openIncidentCount).toBeGreaterThan(200);
    expect(stats.topImpactedServices).toHaveLength(5);
  });
});
