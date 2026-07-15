import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app';
describe('stats api', () => {
  it('aggregates service and incident totals', async () => {
    const res = await request(createApp()).get('/api/stats').expect(200);
    expect(res.body.serviceCount).toBe(28);
    expect(res.body.openIncidentCount).toBeGreaterThan(200);
  });
  it.each(['critical', 'high', 'medium', 'low'])(
    'includes severity bucket %s',
    async (severity) => {
      const res = await request(createApp()).get('/api/stats').expect(200);
      expect(res.body.incidentsBySeverity[severity]).toBeGreaterThan(0);
    },
  );
  it.each(['open', 'investigating', 'mitigated', 'resolved'])(
    'includes status bucket %s',
    async (status) => {
      const res = await request(createApp()).get('/api/stats').expect(200);
      expect(res.body.incidentsByStatus[status]).toBeGreaterThan(0);
    },
  );
});
