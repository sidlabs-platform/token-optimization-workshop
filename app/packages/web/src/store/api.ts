import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { DashboardStats, Incident, IncidentFilters, Service } from '@sentinelops/shared';
import { fixtureData, fixtureStats } from '../data/fixtures';

const BASE_URL = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_API_URL ?? 'http://127.0.0.1:4100') : 'http://127.0.0.1:4100';

function filtersToParams(filters: IncidentFilters): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.severity) params['severity'] = filters.severity;
  if (filters.status) params['status'] = filters.status;
  if (filters.serviceId) params['serviceId'] = filters.serviceId;
  if (filters.search) params['search'] = filters.search;
  return params;
}

export const sentinelApi = createApi({
  reducerPath: 'sentinelApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ['Service', 'Incident', 'Stats'],
  endpoints: (builder) => ({
    getServices: builder.query<Service[], void>({
      query: () => '/api/services',
      transformErrorResponse: () => fixtureData.services,
    }),
    getIncidents: builder.query<Incident[], IncidentFilters>({
      query: (filters) => ({
        url: '/api/incidents',
        params: filtersToParams(filters),
      }),
      transformErrorResponse: () => fixtureData.incidents,
    }),
    getStats: builder.query<DashboardStats, void>({
      query: () => '/api/stats',
      transformErrorResponse: () => fixtureStats,
    }),
  }),
});

export const { useGetServicesQuery, useGetIncidentsQuery, useGetStatsQuery } = sentinelApi;
