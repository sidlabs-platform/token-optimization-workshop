import type { Severity } from './severity';
export type ServiceTier = 'edge' | 'core' | 'data' | 'worker';
export type Region = 'us-east' | 'us-west' | 'eu-central' | 'ap-south';
export interface ServiceHealthSnapshot {
  latencyMs: number;
  errorRate: number;
  saturation: number;
  uptimePercent: number;
}
export interface Service {
  id: string;
  name: string;
  owner: string;
  tier: ServiceTier;
  region: Region;
  description: string;
  dependencies: string[];
  health: ServiceHealthSnapshot;
  activeIncidentCount: number;
  highestSeverity?: Severity;
  updatedAt: string;
}
