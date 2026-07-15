import type { Incident } from '../types/incident';
import type { ServiceHealthSnapshot } from '../types/service';
import { severityRank } from '../types/severity';
export function calculateHealthScore(
  health: ServiceHealthSnapshot,
  activeIncidents: Incident[] = [],
): number {
  const latencyPenalty = Math.min(30, health.latencyMs / 55);
  const errorPenalty = Math.min(35, health.errorRate * 650);
  const saturationPenalty = Math.min(20, health.saturation * 12);
  const uptimePenalty = Math.min(25, (1 - health.uptimePercent) * 800);
  const incidentPenalty = activeIncidents.reduce(
    (sum, incident) => sum + severityRank[incident.severity] * 3,
    0,
  );
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        100 - latencyPenalty - errorPenalty - saturationPenalty - uptimePenalty - incidentPenalty,
      ),
    ),
  );
}
export function scoreBand(score: number): 'stable' | 'watch' | 'degraded' | 'critical' {
  if (score >= 90) return 'stable';
  if (score >= 75) return 'watch';
  if (score >= 55) return 'degraded';
  return 'critical';
}
