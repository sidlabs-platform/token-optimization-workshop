import { Router } from 'express';
import type { IncidentStore } from '../data/store';
import { notFound } from '../utils/http';
export function servicesRouter(store: IncidentStore): Router {
  const router = Router();
  router.get('/', (_req, res) => res.json(store.listServices()));
  router.get('/:id', (req, res) => {
    const service = store.getService(req.params.id);
    if (!service) return notFound(res, 'service', req.params.id);
    return res.json(service);
  });
  return router;
}
