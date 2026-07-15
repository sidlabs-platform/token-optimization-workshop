export const severityLevels = ['critical', 'high', 'medium', 'low'] as const;
export type Severity = (typeof severityLevels)[number];
export const severityRank: Record<Severity, number> = { critical: 4, high: 3, medium: 2, low: 1 };
export function isSeverity(value: unknown): value is Severity {
  return typeof value === 'string' && (severityLevels as readonly string[]).includes(value);
}
export function compareSeverity(a: Severity, b: Severity): number {
  return severityRank[b] - severityRank[a];
}
