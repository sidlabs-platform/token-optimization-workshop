// workshop reference solution — app/packages/api/src/routes/incidents.ack.test.ts
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app';

async function firstOpenIncidentId(): Promise<string> {
  const res = await request(createApp()).get('/api/incidents?status=open').expect(200);
  return res.body[0].id;
}

describe('incident acknowledgement api', () => {
  it('acknowledges an open incident and moves it to investigating', async () => {
    const app = createApp();
    const id = (await request(app).get('/api/incidents?status=open')).body[0].id;
    const res = await request(app)
      .post(`/api/incidents/${id}/ack`)
      .send({ engineerId: 'eng-ada' })
      .expect(200);
    expect(res.body.accepted).toBe(true);
    expect(res.body.incident.acknowledgedBy).toBe('eng-ada');
    expect(res.body.incident.acknowledgedAt).toBeTruthy();
    expect(res.body.incident.status).toBe('investigating');
  });

  it('rejects ack with missing engineerId (400)', async () => {
    const app = createApp();
    const id = await firstOpenIncidentId();
    const res = await request(app).post(`/api/incidents/${id}/ack`).send({}).expect(400);
    expect(res.body.reason).toBe('engineerId-required');
  });

  it('rejects ack from an unknown engineer (404)', async () => {
    const app = createApp();
    const id = await firstOpenIncidentId();
    const res = await request(app)
      .post(`/api/incidents/${id}/ack`)
      .send({ engineerId: 'nobody' })
      .expect(404);
    expect(res.body.reason).toBe('engineer-not-found');
  });

  it('rejects ack from an off-shift engineer (409)', async () => {
    const app = createApp();
    const id = await firstOpenIncidentId();
    const res = await request(app)
      .post(`/api/incidents/${id}/ack`)
      .send({ engineerId: 'eng-cy' })
      .expect(409);
    expect(res.body.reason).toBe('engineer-not-on-shift');
  });

  it('returns 404 for acknowledging a missing incident', async () => {
    await request(createApp())
      .post('/api/incidents/not-real/ack')
      .send({ engineerId: 'eng-ada' })
      .expect(404);
  });

  it('assigns an incident to an engineer', async () => {
    const app = createApp();
    const id = await firstOpenIncidentId();
    const res = await request(app)
      .post(`/api/incidents/${id}/assign`)
      .send({ engineerId: 'eng-ben' })
      .expect(200);
    expect(res.body.accepted).toBe(true);
    expect(res.body.incident.assignee).toBe('eng-ben');
  });

  it('filters incidents by acknowledged=false', async () => {
    const res = await request(createApp()).get('/api/incidents?acknowledged=false').expect(200);
    expect(res.body.every((i: any) => !i.acknowledgedBy)).toBe(true);
  });

  it('reflects an acknowledgement in the acknowledged=true filter', async () => {
    const app = createApp();
    const id = await firstOpenIncidentId();
    await request(app).post(`/api/incidents/${id}/ack`).send({ engineerId: 'eng-ada' }).expect(200);
    const res = await request(app).get('/api/incidents?acknowledged=true').expect(200);
    expect(res.body.some((i: any) => i.id === id)).toBe(true);
    expect(res.body.every((i: any) => Boolean(i.acknowledgedBy))).toBe(true);
  });
});
