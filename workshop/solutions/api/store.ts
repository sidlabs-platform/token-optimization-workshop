// workshop reference solution — app/packages/api/src/data/store.ts
// Full replacement for the existing store, adding on-call engineers + ack/assign.
import type { Incident, IncidentFilters, OnCallEngineer, Service } from '@sentinelops/shared';
import {
  acknowledgeIncident,
  assignIncident,
  incidentMatchesFilters,
  summarizeSeedData,
} from '@sentinelops/shared';
import { seedData } from './seed';

// A tiny on-call roster. In a real system this would come from PagerDuty/Opsgenie.
const ENGINEERS: OnCallEngineer[] = [
  { id: 'eng-ada', name: 'Ada Lovelace', rotation: 'platform-primary', active: true },
  { id: 'eng-ben', name: 'Ben Sisko', rotation: 'platform-backup', active: true },
  { id: 'eng-cy', name: 'Cy Young', rotation: 'network-primary', active: false },
];

export class IncidentStore {
  private services: Service[] = [...seedData.services];
  private incidents: Incident[] = [...seedData.incidents];
  private engineers: OnCallEngineer[] = [...ENGINEERS];

  listServices(): Service[] {
    return this.services;
  }
  getService(id: string): Service | undefined {
    return this.services.find((service) => service.id === id);
  }
  listIncidents(filters: IncidentFilters = {}): Incident[] {
    return this.incidents.filter((incident) => incidentMatchesFilters(incident, filters));
  }
  getIncident(id: string): Incident | undefined {
    return this.incidents.find((incident) => incident.id === id);
  }
  upsertIncident(incident: Incident): Incident {
    const index = this.incidents.findIndex((item) => item.id === incident.id);
    if (index >= 0) this.incidents[index] = incident;
    else this.incidents.unshift(incident);
    return incident;
  }
  allIncidents(): Incident[] {
    return this.incidents;
  }

  listEngineers(): OnCallEngineer[] {
    return this.engineers;
  }
  getEngineer(id: string): OnCallEngineer | undefined {
    return this.engineers.find((engineer) => engineer.id === id);
  }

  /** Acknowledge an incident. Returns null if the incident does not exist. */
  acknowledge(
    id: string,
    engineer: OnCallEngineer,
    now: string,
  ): { incident: Incident; changed: boolean; reason?: string } | null {
    const current = this.getIncident(id);
    if (!current) return null;
    const result = acknowledgeIncident(current, engineer, now);
    this.upsertIncident(result.incident);
    return result;
  }

  /** Assign an incident to an engineer. Returns null if the incident does not exist. */
  assign(
    id: string,
    engineer: OnCallEngineer,
    now: string,
  ): { incident: Incident; changed: boolean; reason?: string } | null {
    const current = this.getIncident(id);
    if (!current) return null;
    const result = assignIncident(current, engineer, now);
    this.upsertIncident(result.incident);
    return result;
  }

  stats() {
    return summarizeSeedData(this.services, this.incidents);
  }
}

export function createStore(): IncidentStore {
  return new IncidentStore();
}
