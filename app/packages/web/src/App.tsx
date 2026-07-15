import { ChartsPanel } from './components/ChartsPanel';
import { ErrorBanner } from './components/ErrorBanner';
import { IncidentsTable } from './components/IncidentsTable';
import { LoadingState } from './components/LoadingState';
import { ServiceHealthGrid } from './components/ServiceHealthGrid';
import { SeverityFilter } from './components/SeverityFilter';
import { Shell } from './components/Shell';
import { StatCard } from './components/StatCard';
import { useDashboardData } from './hooks/useDashboardData';
import { useIncidentFilters } from './hooks/useIncidentFilters';
export function App() {
  const { filters, severity, setSeverity, search, setSearch } = useIncidentFilters();
  const { services, incidents, stats, loading } = useDashboardData(filters);
  return (
    <Shell>
      <ErrorBanner />
      <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4 md:flex-row md:items-center md:justify-between">
        <SeverityFilter value={severity} onChange={setSeverity} />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search incidents"
          className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-white outline-none focus:border-aurora"
        />
      </div>
      {loading || !stats ? (
        <LoadingState />
      ) : (
        <>
          <section className="mb-6 grid gap-4 md:grid-cols-4">
            <StatCard label="Services" value={stats.serviceCount} accent="bg-aurora" />
            <StatCard label="Open incidents" value={stats.openIncidentCount} accent="bg-ember" />
            <StatCard label="Health score" value={stats.averageHealthScore} accent="bg-voltage" />
            <StatCard label="Filtered" value={incidents.length} accent="bg-sky-400" />
          </section>
          <div className="grid gap-6 xl:grid-cols-[1.4fr_.8fr]">
            <div className="space-y-6">
              <ServiceHealthGrid services={services} />
              <IncidentsTable incidents={incidents} />
            </div>
            <ChartsPanel stats={stats} />
          </div>
        </>
      )}
    </Shell>
  );
}
