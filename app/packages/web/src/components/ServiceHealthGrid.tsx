import type { Service } from '@sentinelops/shared';
import { calculateHealthScore, scoreBand } from '@sentinelops/shared';
const bandClass = {
  stable: 'border-emerald-400/30',
  watch: 'border-yellow-400/30',
  degraded: 'border-orange-400/40',
  critical: 'border-red-400/50',
};
export function ServiceHealthGrid({ services }: { services: Service[] }) {
  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {services.slice(0, 12).map((service) => {
        const score = calculateHealthScore(service.health);
        const band = scoreBand(score);
        return (
          <article
            key={service.id}
            className={`rounded-2xl border bg-slate-950/70 p-4 ${bandClass[band]}`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold">{service.name}</h3>
              <span className="text-xl font-black text-aurora">{score}</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {service.owner} • {service.region} • {service.tier}
            </p>
            <div className="mt-4 h-2 rounded-full bg-slate-800">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-aurora to-voltage"
                style={{ width: `${score}%` }}
              />
            </div>
          </article>
        );
      })}
    </section>
  );
}
