import type { Severity } from '@sentinelops/shared';
const colors: Record<Severity, string> = {
  critical: 'bg-red-500/20 text-red-200 ring-red-400/40',
  high: 'bg-orange-500/20 text-orange-200 ring-orange-400/40',
  medium: 'bg-yellow-500/20 text-yellow-100 ring-yellow-400/40',
  low: 'bg-emerald-500/20 text-emerald-100 ring-emerald-400/40',
};
export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-bold uppercase tracking-widest ring-1 ${colors[severity]}`}
    >
      {severity}
    </span>
  );
}
