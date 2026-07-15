import { describe, expect, it } from 'vitest';
import {
  filtersSlice,
  resetFilters,
  selectFilters,
  selectSearch,
  selectSeverity,
  setSearch,
  setSeverity,
  type FiltersState,
} from '../filtersSlice';

const { reducer } = filtersSlice;

function makeState(partial: Partial<FiltersState> = {}): { filters: FiltersState } {
  return { filters: { severity: undefined, search: '', ...partial } };
}

describe('filtersSlice', () => {
  it('has correct initial state', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state.severity).toBeUndefined();
    expect(state.search).toBe('');
  });

  describe('setSeverity', () => {
    it('sets severity to a valid level', () => {
      const state = reducer(undefined, setSeverity('critical'));
      expect(state.severity).toBe('critical');
    });

    it('clears severity when set to undefined', () => {
      const prev = reducer(undefined, setSeverity('high'));
      const state = reducer(prev, setSeverity(undefined));
      expect(state.severity).toBeUndefined();
    });

    it.each(['critical', 'high', 'medium', 'low'] as const)('accepts %s', (sev) => {
      const state = reducer(undefined, setSeverity(sev));
      expect(state.severity).toBe(sev);
    });
  });

  describe('setSearch', () => {
    it('sets search text', () => {
      const state = reducer(undefined, setSearch('latency'));
      expect(state.search).toBe('latency');
    });

    it('clears search when set to empty string', () => {
      const prev = reducer(undefined, setSearch('foo'));
      const state = reducer(prev, setSearch(''));
      expect(state.search).toBe('');
    });
  });

  describe('resetFilters', () => {
    it('resets all filters back to initial state', () => {
      let state = reducer(undefined, setSeverity('medium'));
      state = reducer(state, setSearch('timeout'));
      state = reducer(state, resetFilters());
      expect(state.severity).toBeUndefined();
      expect(state.search).toBe('');
    });
  });
});

describe('filters selectors', () => {
  it('selectSeverity returns current severity', () => {
    expect(selectSeverity(makeState({ severity: 'high' }))).toBe('high');
    expect(selectSeverity(makeState())).toBeUndefined();
  });

  it('selectSearch returns current search', () => {
    expect(selectSearch(makeState({ search: 'db' }))).toBe('db');
    expect(selectSearch(makeState())).toBe('');
  });

  describe('selectFilters', () => {
    it('returns empty object when no filters active', () => {
      expect(selectFilters(makeState())).toEqual({});
    });

    it('includes severity when set', () => {
      const result = selectFilters(makeState({ severity: 'critical' }));
      expect(result.severity).toBe('critical');
    });

    it('includes trimmed search when set', () => {
      const result = selectFilters(makeState({ search: '  latency  ' }));
      expect(result.search).toBe('latency');
    });

    it('omits search when whitespace-only', () => {
      const result = selectFilters(makeState({ search: '   ' }));
      expect(result.search).toBeUndefined();
    });

    it('combines severity and search filters', () => {
      const result = selectFilters(makeState({ severity: 'low', search: 'timeout' }));
      expect(result).toEqual({ severity: 'low', search: 'timeout' });
    });
  });
});
