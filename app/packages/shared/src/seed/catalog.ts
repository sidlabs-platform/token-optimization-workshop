import type { Region, Service, ServiceTier } from '../types/service';
import { slugify } from '../utils/id';
const names = [
  'Auth Gateway',
  'Billing Ledger',
  'Checkout Stream',
  'Customer Graph',
  'Deploy Orchestrator',
  'Edge Cache',
  'Email Relay',
  'Feature Flags',
  'Fraud Lens',
  'Inventory Core',
  'Kafka Bridge',
  'License Vault',
  'Metrics Intake',
  'Notification Hub',
  'Orders API',
  'Payment Router',
  'Policy Engine',
  'Pricing Matrix',
  'Recommendations',
  'Search Mesh',
  'Session Store',
  'Shipping Planner',
  'Telemetry Lake',
  'Tenant Registry',
  'Usage Meter',
  'Workflow Runner',
  'Audit Archive',
  'Mobile Sync',
];
const tiers: ServiceTier[] = ['edge', 'core', 'data', 'worker'];
const regions: Region[] = ['us-east', 'us-west', 'eu-central', 'ap-south'];
export function buildServiceCatalog(): Service[] {
  return names.map((name, index) => ({
    id: slugify(name),
    name,
    owner: `team-${['atlas', 'nova', 'pulse', 'forge'][index % 4]}`,
    tier: tiers[index % tiers.length] as ServiceTier,
    region: regions[index % regions.length] as Region,
    description: `${name} powers SentinelOps production workflows for region ${regions[index % regions.length]}.`,
    dependencies:
      index < 3
        ? []
        : [
            slugify(names[(index - 1) % names.length] as string),
            slugify(names[(index - 3) % names.length] as string),
          ],
    health: {
      latencyMs: 65 + (index % 9) * 27,
      errorRate: ((index % 7) + 1) / 1000,
      saturation: 0.35 + (index % 11) / 20,
      uptimePercent: 0.998 - (index % 5) / 1000,
    },
    activeIncidentCount: 0,
    updatedAt: '2026-01-15T12:00:00.000Z',
  }));
}
