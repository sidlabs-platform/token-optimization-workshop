import { configureStore } from '@reduxjs/toolkit';
import { describe, expect, it } from 'vitest';
import { sentinelApi } from '../api';
import { filtersSlice, resetFilters, selectFilters, setSeverity, setSearch } from '../filtersSlice';

function makeTestStore() {
  return configureStore({
    reducer: {
      [sentinelApi.reducerPath]: sentinelApi.reducer,
      filters: filtersSlice.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sentinelApi.middleware),
  });
}

describe('Redux store', () => {
  it('initialises with correct default state', () => {
    const store = makeTestStore();
    const state = store.getState();
    expect(state.filters.severity).toBeUndefined();
    expect(state.filters.search).toBe('');
  });

  it('dispatches setSeverity and reflects in state', () => {
    const store = makeTestStore();
    store.dispatch(setSeverity('critical'));
    expect(store.getState().filters.severity).toBe('critical');
  });

  it('dispatches setSearch and reflects in state', () => {
    const store = makeTestStore();
    store.dispatch(setSearch('database'));
    expect(store.getState().filters.search).toBe('database');
  });

  it('dispatches resetFilters and clears state', () => {
    const store = makeTestStore();
    store.dispatch(setSeverity('high'));
    store.dispatch(setSearch('timeout'));
    store.dispatch(resetFilters());
    const { severity, search } = store.getState().filters;
    expect(severity).toBeUndefined();
    expect(search).toBe('');
  });

  it('selectFilters selector works against live store state', () => {
    const store = makeTestStore();
    store.dispatch(setSeverity('medium'));
    store.dispatch(setSearch('cpu'));
    const filters = selectFilters(store.getState());
    expect(filters).toEqual({ severity: 'medium', search: 'cpu' });
  });

  it('sentinelApi reducer path is present in store', () => {
    const store = makeTestStore();
    expect(store.getState()).toHaveProperty(sentinelApi.reducerPath);
  });
});
