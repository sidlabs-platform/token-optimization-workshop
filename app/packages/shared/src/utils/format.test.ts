import { describe, expect, it } from 'vitest';
import {
  formatLatency,
  formatPercent,
  formatRelativeTime,
  severityLabel,
  titleCase,
} from '../index';
describe('format helpers', () => {
  it.each([
    ['critical', 'Critical'],
    ['high', 'High'],
    ['medium', 'Medium'],
    ['low', 'Low'],
  ] as const)('formats severity %s', (input, expected) =>
    expect(severityLabel(input)).toBe(expected),
  );
  it.each([
    ['edge-cache', 'Edge Cache'],
    ['queue_depth', 'Queue Depth'],
    ['api', 'Api'],
  ])('title cases %s', (input, expected) => expect(titleCase(input)).toBe(expected));
  it.each([
    [0.1234, '12.3%'],
    [0.001, '0.1%'],
    [1, '100.0%'],
  ])('formats percent %f', (value, expected) =>
    expect(formatPercent(value as number)).toBe(expected),
  );
  it.each([
    [99, '99ms'],
    [1000, '1.0s'],
    [2500, '2.5s'],
  ])('formats latency %i', (value, expected) =>
    expect(formatLatency(value as number)).toBe(expected),
  );
  it.each([
    ['2026-01-15T11:59:00.000Z', '1m ago'],
    ['2026-01-15T10:00:00.000Z', '2h ago'],
    ['2026-01-12T12:00:00.000Z', '3d ago'],
  ])('formats relative time', (iso, expected) => expect(formatRelativeTime(iso)).toBe(expected));
});
