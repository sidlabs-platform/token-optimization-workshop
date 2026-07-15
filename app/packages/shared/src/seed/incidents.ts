import type { Incident, IncidentStatus } from '../types/incident';
import { severityLevels, type Severity } from '../types/severity';
import { addMinutes } from '../utils/date';
import { fingerprint, stableId } from '../utils/id';
import { DeterministicSequence } from './prng';
import { buildServiceCatalog } from './catalog';
const statuses: IncidentStatus[] = ['open', 'investigating', 'mitigated', 'resolved'];
const sources = ['prometheus', 'datadog', 'pagerduty', 'manual'] as const;
const symptoms = [
  'latency spike',
  'error budget burn',
  'queue depth growth',
  'dependency timeout',
  'cache churn',
  'regional brownout',
  'deploy regression',
  'saturation alert',
];
export function buildIncidentSeed(count = 360): Incident[] {
  const rng = new DeterministicSequence(42);
  const services = buildServiceCatalog();
  const base = '2026-01-15T12:00:00.000Z';
  return Array.from({ length: count }, (_, index) => {
    const service = services[index % services.length] as { id: string; name: string };
    const severity = severityLevels[(index + rng.int(0, 3)) % severityLevels.length] as Severity;
    const status = statuses[(index + rng.int(0, 3)) % statuses.length] as IncidentStatus;
    const symptom = rng.pick(symptoms);
    const createdAt = addMinutes(base, -index * 17 - rng.int(0, 9));
    const title = `${service.name} ${symptom}`;
    return {
      id: stableId('inc', [index + 1, service.id, symptom]),
      serviceId: service.id,
      title,
      summary: `${severity} ${symptom} detected on ${service.name}; runbook automation attached deterministic trace ${index}.`,
      severity,
      status,
      source: rng.pick(sources),
      tags: [service.id, symptom.replace(/\s+/g, '-'), severity],
      createdAt,
      updatedAt: addMinutes(createdAt, rng.int(3, 55)),
      fingerprint: fingerprint([service.id, title, severity]),
      duplicateCount: index % 19 === 0 ? 2 : 1,
    };
  });
}
