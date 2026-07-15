import type { DashboardStats } from '../types/stats';
import type { Service } from '../types/service';
import { calculateHealthScore } from '../lib/healthScore';
import { severityRank } from '../types/severity';
import { buildIncidentSeed } from './incidents';
import { buildServiceCatalog } from './catalog';
export function buildSeedData() {
  const incidents = buildIncidentSeed(360);
  const services = buildServiceCatalog().map((service) => {
    const active = incidents.filter((i) => i.serviceId === service.id && i.status !== 'resolved');
    const highestSeverity = active.sort(
      (a, b) => severityRank[b.severity] - severityRank[a.severity],
    )[0]?.severity;
    return highestSeverity
      ? { ...service, activeIncidentCount: active.length, highestSeverity }
      : { ...service, activeIncidentCount: active.length };
  });
  return { services, incidents };
}
export function summarizeSeedData(
  services: Service[],
  incidents = buildIncidentSeed(),
): DashboardStats {
  const open = incidents.filter((i) => i.status !== 'resolved');
  return {
    serviceCount: services.length,
    openIncidentCount: open.length,
    averageHealthScore: Math.round(
      services.reduce(
        (sum, service) =>
          sum +
          calculateHealthScore(
            service.health,
            open.filter((i) => i.serviceId === service.id),
          ),
        0,
      ) / services.length,
    ),
    incidentsBySeverity: {
      critical: incidents.filter((i) => i.severity === 'critical').length,
      high: incidents.filter((i) => i.severity === 'high').length,
      medium: incidents.filter((i) => i.severity === 'medium').length,
      low: incidents.filter((i) => i.severity === 'low').length,
    },
    incidentsByStatus: {
      open: incidents.filter((i) => i.status === 'open').length,
      investigating: incidents.filter((i) => i.status === 'investigating').length,
      mitigated: incidents.filter((i) => i.status === 'mitigated').length,
      resolved: incidents.filter((i) => i.status === 'resolved').length,
    },
    topImpactedServices: services
      .map((s) => ({
        serviceId: s.id,
        name: s.name,
        incidentCount: incidents.filter((i) => i.serviceId === s.id).length,
      }))
      .sort((a, b) => b.incidentCount - a.incidentCount)
      .slice(0, 5),
  };
}

export { buildIncidentSeed } from './incidents';
export { buildServiceCatalog } from './catalog';
