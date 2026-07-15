const MINUTE = 60_000;
export function addMinutes(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * MINUTE).toISOString();
}
export function formatRelativeTime(iso: string, nowIso = '2026-01-15T12:00:00.000Z'): string {
  const diff = new Date(nowIso).getTime() - new Date(iso).getTime();
  const minutes = Math.max(0, Math.round(diff / MINUTE));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
export function isIsoDate(value: string): boolean {
  return !Number.isNaN(Date.parse(value)) && value.includes('T');
}
