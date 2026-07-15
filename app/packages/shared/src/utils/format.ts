import type { Severity } from '../types/severity';
export function titleCase(value: string): string {
  return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
export function formatPercent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}
export function formatLatency(ms: number): string {
  return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`;
}
export function severityLabel(severity: Severity): string {
  return titleCase(severity);
}
