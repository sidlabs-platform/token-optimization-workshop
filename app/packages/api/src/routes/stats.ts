import { Router } from 'express';
import type { IncidentStore } from '../data/store';
export function statsRouter(store: IncidentStore): Router {
  const router = Router();
  router.get('/', (_req, res) => res.json(store.stats()));
  return router;
}
