import { Router } from 'express';
import { isSeverity, type IncidentFilters, type IncidentStatus } from '@sentinelops/shared';
import type { IncidentStore } from '../data/store';
import { ingestIncident } from '../ingestion/ingestIncident';
import { notFound } from '../utils/http';
export function incidentsRouter(store: IncidentStore): Router {
  const router = Router();
  router.get('/', (req, res) => {
    const filters: IncidentFilters = {};
    if (typeof req.query.severity === 'string' && isSeverity(req.query.severity))
      filters.severity = req.query.severity;
    if (typeof req.query.serviceId === 'string') filters.serviceId = req.query.serviceId;
    if (typeof req.query.status === 'string') filters.status = req.query.status as IncidentStatus;
    if (typeof req.query.search === 'string') filters.search = req.query.search;
    res.json(store.listIncidents(filters));
  });
  router.get('/:id', (req, res) => {
    const incident = store.getIncident(req.params.id);
    if (!incident) return notFound(res, 'incident', req.params.id);
    return res.json(incident);
  });
  router.post('/ingest', (req, res) => {
    const result = ingestIncident(req.body, store);
    res.status(result.accepted ? (result.duplicate ? 200 : 201) : 400).json(result);
  });
  return router;
}
