// workshop reference solution — app/packages/api/src/routes/incidents.ts
// Full replacement adding POST /:id/ack and POST /:id/assign to the incidents router.
import { Router } from 'express';
import {
  isSeverity,
  type AcknowledgeRequest,
  type AssignRequest,
  type IncidentFilters,
  type IncidentStatus,
} from '@sentinelops/shared';
import type { IncidentStore } from '../data/store';
import { ingestIncident } from '../ingestion/ingestIncident';
import { notFound } from '../utils/http';

const REASON_STATUS: Record<string, number> = {
  'engineer-not-on-shift': 409,
  'incident-resolved': 409,
};

export function incidentsRouter(store: IncidentStore): Router {
  const router = Router();

  router.get('/', (req, res) => {
    const filters: IncidentFilters = {};
    if (typeof req.query.severity === 'string' && isSeverity(req.query.severity))
      filters.severity = req.query.severity;
    if (typeof req.query.serviceId === 'string') filters.serviceId = req.query.serviceId;
    if (typeof req.query.status === 'string') filters.status = req.query.status as IncidentStatus;
    if (typeof req.query.search === 'string') filters.search = req.query.search;
    if (req.query.acknowledged === 'true') filters.acknowledged = true;
    if (req.query.acknowledged === 'false') filters.acknowledged = false;
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

  router.post('/:id/ack', (req, res) => {
    const body = req.body as AcknowledgeRequest;
    if (!body || typeof body.engineerId !== 'string')
      return res.status(400).json({ accepted: false, reason: 'engineerId-required' });
    const engineer = store.getEngineer(body.engineerId);
    if (!engineer)
      return res.status(404).json({ accepted: false, reason: 'engineer-not-found' });
    const result = store.acknowledge(req.params.id, engineer, new Date().toISOString());
    if (!result) return notFound(res, 'incident', req.params.id);
    if (result.reason)
      return res.status(REASON_STATUS[result.reason] ?? 409).json({ accepted: false, reason: result.reason });
    return res.status(200).json({ accepted: true, incident: result.incident });
  });

  router.post('/:id/assign', (req, res) => {
    const body = req.body as AssignRequest;
    if (!body || typeof body.engineerId !== 'string')
      return res.status(400).json({ accepted: false, reason: 'engineerId-required' });
    const engineer = store.getEngineer(body.engineerId);
    if (!engineer)
      return res.status(404).json({ accepted: false, reason: 'engineer-not-found' });
    const result = store.assign(req.params.id, engineer, new Date().toISOString());
    if (!result) return notFound(res, 'incident', req.params.id);
    if (result.reason)
      return res.status(REASON_STATUS[result.reason] ?? 409).json({ accepted: false, reason: result.reason });
    return res.status(200).json({ accepted: true, incident: result.incident });
  });

  return router;
}
