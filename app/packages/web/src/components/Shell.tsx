import type { ReactNode } from 'react';
export function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen overflow-hidden bg-obsidian text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(56,248,197,.22),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(255,92,53,.18),transparent_30%)]" />
      <section className="relative mx-auto max-w-7xl px-6 py-8">
        <header className="mb-8 flex items-end justify-between border-b border-white/10 pb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-aurora">Incident Command</p>
            <h1 className="font-display text-6xl tracking-wide text-white">SentinelOps</h1>
          </div>
          <div className="rounded-full border border-voltage/30 px-4 py-2 text-sm text-voltage">
            Live synthetic telemetry
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}
