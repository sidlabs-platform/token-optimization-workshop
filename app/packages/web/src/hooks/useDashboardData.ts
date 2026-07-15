import type { DashboardStats, Incident, IncidentFilters, Service } from '@sentinelops/shared';
import { fixtureData, fixtureStats } from '../data/fixtures';
import { useGetIncidentsQuery, useGetServicesQuery, useGetStatsQuery } from '../store/api';

export function useDashboardData(filters: IncidentFilters): {
  services: Service[];
  incidents: Incident[];
  stats: DashboardStats | undefined;
  loading: boolean;
} {
  const {
    data: services = fixtureData.services,
    isLoading: servicesLoading,
  } = useGetServicesQuery();

  const {
    data: incidents = fixtureData.incidents,
    isLoading: incidentsLoading,
  } = useGetIncidentsQuery(filters);

  const {
    data: stats = fixtureStats,
    isLoading: statsLoading,
  } = useGetStatsQuery();

  return {
    services,
    incidents,
    stats,
    loading: servicesLoading || incidentsLoading || statsLoading,
  };
}
