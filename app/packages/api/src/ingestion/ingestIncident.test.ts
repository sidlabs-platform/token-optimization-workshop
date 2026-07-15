import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app';
describe('incident ingestion', () => {
  it('accepts a valid incident payload', async () => {
    const res = await request(createApp())
      .post('/api/incidents/ingest')
      .send({
        serviceId: 'auth-gateway',
        title: 'Auth Gateway synthetic outage',
        severity: 'critical',
        tags: ['synthetic'],
      })
      .expect(201);
    expect(res.body.accepted).toBe(true);
    expect(res.body.incident.status).toBe('open');
  });
  it('deduplicates repeated active payloads', async () => {
    const app = createApp();
    const body = {
      serviceId: 'billing-ledger',
      title: 'Billing duplicate spike',
      severity: 'high',
    };
    await request(app).post('/api/incidents/ingest').send(body).expect(201);
    const res = await request(app).post('/api/incidents/ingest').send(body).expect(200);
    expect(res.body.duplicate).toBe(true);
    expect(res.body.incident.duplicateCount).toBe(2);
  });
  it.each([
    { serviceId: '', title: 'x', severity: 'high' },
    { serviceId: 'svc', title: '', severity: 'high' },
    { serviceId: 'svc', title: 'x', severity: 'urgent' },
    { serviceId: 'svc', title: 'x', severity: 'low', observedAt: 'not-a-date' },
  ])('rejects invalid payload %o', async (body) => {
    const res = await request(createApp()).post('/api/incidents/ingest').send(body).expect(400);
    expect(res.body.accepted).toBe(false);
    expect(res.body.issues.length).toBeGreaterThan(0);
  });
});
