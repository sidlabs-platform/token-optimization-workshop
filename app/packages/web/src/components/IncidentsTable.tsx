import type { Incident } from '@sentinelops/shared';
import { formatRelativeTime } from '@sentinelops/shared';
import { SeverityBadge } from './Badge';
export function IncidentsTable({ incidents }: { incidents: Incident[] }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-black">Incident stream</h2>
        <span className="text-sm text-slate-400">{incidents.length} matching alerts</span>
      </div>
      <div className="max-h-[520px] overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-slate-950 text-xs uppercase tracking-[0.25em] text-slate-500">
            <tr>
              <th className="py-3">Severity</th>
              <th>Incident</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {incidents.slice(0, 80).map((incident) => (
              <tr key={incident.id} className="border-t border-white/5">
                <td className="py-3">
                  <SeverityBadge severity={incident.severity} />
                </td>
                <td>
                  <p className="font-semibold text-white">{incident.title}</p>
                  <p className="text-xs text-slate-500">{incident.summary}</p>
                </td>
                <td className="capitalize text-slate-300">{incident.status}</td>
                <td className="text-slate-400">{formatRelativeTime(incident.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
