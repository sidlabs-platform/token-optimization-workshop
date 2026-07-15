import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app';
describe('incidents api', () => {
  it('lists seeded incidents', async () => {
    const res = await request(createApp()).get('/api/incidents').expect(200);
    expect(res.body.length).toBeGreaterThanOrEqual(300);
  });
  it.each(['critical', 'high', 'medium', 'low'])(
    'filters incidents by severity %s',
    async (severity) => {
      const res = await request(createApp()).get(`/api/incidents?severity=${severity}`).expect(200);
      expect(res.body.length).toBeGreaterThan(10);
      expect(res.body.every((i: any) => i.severity === severity)).toBe(true);
    },
  );
  it.each(['open', 'investigating', 'mitigated', 'resolved'])(
    'filters incidents by status %s',
    async (status) => {
      const res = await request(createApp()).get(`/api/incidents?status=${status}`).expect(200);
      expect(res.body.every((i: any) => i.status === status)).toBe(true);
    },
  );
  it('filters incidents by service id', async () => {
    const res = await request(createApp()).get('/api/incidents?serviceId=auth-gateway').expect(200);
    expect(res.body.every((i: any) => i.serviceId === 'auth-gateway')).toBe(true);
  });
  it('filters incidents by search text', async () => {
    const res = await request(createApp()).get('/api/incidents?search=latency').expect(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(
      res.body.every((i: any) =>
        `${i.title} ${i.summary} ${i.tags.join(' ')}`.toLowerCase().includes('latency'),
      ),
    ).toBe(true);
  });
  it('gets an incident by id', async () => {
    const list = await request(createApp()).get('/api/incidents').expect(200);
    const res = await request(createApp()).get(`/api/incidents/${list.body[0].id}`).expect(200);
    expect(res.body.id).toBe(list.body[0].id);
  });
  it('returns 404 for missing incident', async () => {
    await request(createApp()).get('/api/incidents/not-real').expect(404);
  });
});
