import type { Severity } from '@sentinelops/shared';
import { useAppDispatch, useAppSelector } from '../store';
import { selectFilters, selectSearch, selectSeverity, setSearch, setSeverity } from '../store/filtersSlice';

export function useIncidentFilters() {
  const dispatch = useAppDispatch();
  const severity = useAppSelector(selectSeverity);
  const search = useAppSelector(selectSearch);
  const filters = useAppSelector(selectFilters);

  return {
    filters,
    severity,
    setSeverity: (value: Severity | undefined) => dispatch(setSeverity(value)),
    search,
    setSearch: (value: string) => dispatch(setSearch(value)),
  };
}
