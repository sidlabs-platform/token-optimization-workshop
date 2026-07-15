import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { IncidentFilters, Severity } from '@sentinelops/shared';

export interface FiltersState {
  severity: Severity | undefined;
  search: string;
}

const initialState: FiltersState = {
  severity: undefined,
  search: '',
};

export const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSeverity(state, action: PayloadAction<Severity | undefined>) {
      state.severity = action.payload;
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    resetFilters(state) {
      state.severity = undefined;
      state.search = '';
    },
  },
});

export const { setSeverity, setSearch, resetFilters } = filtersSlice.actions;

export function selectFilters(state: { filters: FiltersState }): IncidentFilters {
  const filters: IncidentFilters = {};
  if (state.filters.severity) filters.severity = state.filters.severity;
  const trimmed = state.filters.search.trim();
  if (trimmed) filters.search = trimmed;
  return filters;
}

export function selectSeverity(state: { filters: FiltersState }): Severity | undefined {
  return state.filters.severity;
}

export function selectSearch(state: { filters: FiltersState }): string {
  return state.filters.search;
}
