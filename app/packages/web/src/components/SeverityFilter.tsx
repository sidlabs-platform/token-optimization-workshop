import type { Severity } from '@sentinelops/shared';
import { severityLevels } from '@sentinelops/shared';
export function SeverityFilter({
  value,
  onChange,
}: {
  value: Severity | undefined;
  onChange: (value?: Severity) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(undefined)}
        className={`rounded-full px-4 py-2 text-sm ${!value ? 'bg-white text-slate-950' : 'bg-white/10 text-slate-300'}`}
      >
        All severities
      </button>
      {severityLevels.map((severity) => (
        <button
          key={severity}
          onClick={() => onChange(severity)}
          className={`rounded-full px-4 py-2 text-sm uppercase tracking-wider ${value === severity ? 'bg-ember text-white' : 'bg-white/10 text-slate-300'}`}
        >
          {severity}
        </button>
      ))}
    </div>
  );
}
