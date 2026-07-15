import type { Incident, IncidentFilters, Service } from '@sentinelops/shared';
import { incidentMatchesFilters, summarizeSeedData } from '@sentinelops/shared';
import { seedData } from './seed';
export class IncidentStore {
  private services: Service[] = [...seedData.services];
  private incidents: Incident[] = [...seedData.incidents];
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
  stats() {
    return summarizeSeedData(this.services, this.incidents);
  }
}
export function createStore(): IncidentStore {
  return new IncidentStore();
}
