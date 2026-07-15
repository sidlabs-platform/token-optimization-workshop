import { Router } from 'express';
export function healthRouter(): Router {
  const router = Router();
  router.get('/', (_req, res) =>
    res.json({ ok: true, service: 'sentinelops-api', time: '2026-01-15T12:00:00.000Z' }),
  );
  return router;
}
