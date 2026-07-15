import type { DashboardStats } from '@sentinelops/shared';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
const palette = ['#ef4444', '#f97316', '#eab308', '#10b981'];
export function ChartsPanel({ stats }: { stats: DashboardStats }) {
  const data = Object.entries(stats.incidentsBySeverity).map(([name, value]) => ({ name, value }));
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <h2 className="mb-4 text-xl font-black">Severity distribution</h2>
      <div className="h-72">
        <ResponsiveContainer>
          <PieChart>
            <Pie dataKey="value" data={data} innerRadius={60} outerRadius={105} paddingAngle={4}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={palette[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
