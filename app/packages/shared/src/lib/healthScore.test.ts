import { describe, expect, it } from 'vitest';
import { calculateHealthScore, scoreBand } from './healthScore';
const base = { latencyMs: 80, errorRate: 0.001, saturation: 0.4, uptimePercent: 0.999 };
describe('health score', () => {
  it.each([
    [100, 'stable'],
    [95, 'stable'],
    [90, 'stable'],
    [89, 'watch'],
    [80, 'watch'],
    [75, 'watch'],
    [74, 'degraded'],
    [60, 'degraded'],
    [55, 'degraded'],
    [54, 'critical'],
    [10, 'critical'],
  ])('classifies score %i as %s', (score, band) => expect(scoreBand(score as number)).toBe(band));
  it('penalizes noisy service health metrics', () =>
    expect(
      calculateHealthScore({
        latencyMs: 900,
        errorRate: 0.05,
        saturation: 0.95,
        uptimePercent: 0.95,
      }),
    ).toBeLessThan(35));
  it('keeps healthy service near green', () =>
    expect(calculateHealthScore(base)).toBeGreaterThan(90));
  it.each(['critical', 'high', 'medium', 'low'] as const)(
    'applies incident penalty for %s alerts',
    (severity) => {
      const score = calculateHealthScore(base, [
        {
          id: 'a',
          serviceId: 's',
          title: 't',
          summary: 's',
          severity,
          status: 'open',
          source: 'manual',
          tags: [],
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          fingerprint: severity,
          duplicateCount: 1,
        },
      ]);
      expect(score).toBeLessThan(95);
    },
  );
});
