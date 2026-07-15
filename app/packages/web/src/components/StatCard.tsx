export function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30">
      <div className={`mb-4 h-1 w-20 rounded-full ${accent}`} />
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{label}</p>
      <p className="mt-3 text-4xl font-black text-white">{value}</p>
    </article>
  );
}
