import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app';
describe('services api', () => {
  it('lists dozens of services', async () => {
    const res = await request(createApp()).get('/api/services').expect(200);
    expect(res.body.length).toBeGreaterThanOrEqual(24);
  });
  it('gets a service by id', async () => {
    const res = await request(createApp()).get('/api/services/auth-gateway').expect(200);
    expect(res.body.name).toBe('Auth Gateway');
  });
  it('returns 404 for unknown service', async () => {
    await request(createApp()).get('/api/services/unknown').expect(404);
  });
  it('reports health', async () => {
    const res = await request(createApp()).get('/api/health').expect(200);
    expect(res.body.ok).toBe(true);
  });
});
