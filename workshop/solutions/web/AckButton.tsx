// workshop reference solution — app/packages/web/src/components/AckButton.tsx
// Reference component + api client helper for acknowledging an incident from the UI.
import { useState } from 'react';
import type { Incident } from '@sentinelops/shared';

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:4100';

/** POST an acknowledgement for an incident and return the updated record. */
export async function acknowledgeIncident(
  incidentId: string,
  engineerId: string,
): Promise<Incident> {
  const res = await fetch(`${baseUrl}/api/incidents/${incidentId}/ack`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ engineerId }),
  });
  const body = (await res.json()) as { accepted: boolean; incident?: Incident; reason?: string };
  if (!res.ok || !body.accepted || !body.incident) {
    throw new Error(body.reason ?? `HTTP ${res.status}`);
  }
  return body.incident;
}

export function AckButton({
  incident,
  engineerId,
  onAcknowledged,
}: {
  incident: Incident;
  engineerId: string;
  onAcknowledged?: (incident: Incident) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const acknowledged = Boolean(incident.acknowledgedBy);

  async function handleClick() {
    setPending(true);
    setError(null);
    try {
      const updated = await acknowledgeIncident(incident.id, engineerId);
      onAcknowledged?.(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ack-failed');
    } finally {
      setPending(false);
    }
  }

  if (acknowledged) {
    return (
      <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-bold uppercase tracking-widest text-emerald-100 ring-1 ring-emerald-400/40">
        ack&apos;d
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleClick}
      className="rounded-md bg-sky-500/20 px-2 py-1 text-xs font-bold uppercase tracking-widest text-sky-100 ring-1 ring-sky-400/40 disabled:opacity-50"
      title={error ?? undefined}
    >
      {pending ? '…' : 'ack'}
    </button>
  );
}
