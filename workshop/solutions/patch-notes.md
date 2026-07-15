# patch-notes.md — surgical edits to existing files

The new files (oncall.ts, acknowledge.ts, assignment.ts, AckButton.tsx) are drop-in.
These three EXISTING shared files need small edits. Each is shown as before → after.

---

## 1. `app/packages/shared/src/types/incident.ts`

Add four optional fields to the `Incident` interface (ack + assignment metadata).

**Before**
```ts
  fingerprint: string;
  duplicateCount: number;
}
```

**After**
```ts
  fingerprint: string;
  duplicateCount: number;
  acknowledgedBy?: string | null;
  acknowledgedAt?: string | null;
  assignee?: string | null;
}
```

> Optional fields keep every existing seed record and test valid — no migration needed.

---

## 2. `app/packages/shared/src/types/filters.ts`

Add an `acknowledged` filter and include it in the active-filters check.

**Before**
```ts
export interface IncidentFilters {
  severity?: Severity;
  serviceId?: string;
  status?: IncidentStatus;
  search?: string;
}
export function hasActiveIncidentFilters(filters: IncidentFilters): boolean {
  return Boolean(filters.severity || filters.serviceId || filters.status || filters.search?.trim());
}
```

**After**
```ts
export interface IncidentFilters {
  severity?: Severity;
  serviceId?: string;
  status?: IncidentStatus;
  search?: string;
  acknowledged?: boolean;
}
export function hasActiveIncidentFilters(filters: IncidentFilters): boolean {
  return Boolean(
    filters.severity ||
      filters.serviceId ||
      filters.status ||
      filters.search?.trim() ||
      filters.acknowledged !== undefined,
  );
}
```

---

## 3. `app/packages/shared/src/utils/query.ts`

Teach the matcher about the `acknowledged` filter.

**Before**
```ts
  if (filters.status && incident.status !== filters.status) return false;
  if (filters.search?.trim()) {
```

**After**
```ts
  if (filters.status && incident.status !== filters.status) return false;
  if (filters.acknowledged !== undefined) {
    const isAck = Boolean(incident.acknowledgedBy);
    if (isAck !== filters.acknowledged) return false;
  }
  if (filters.search?.trim()) {
```

---

## 4. `app/packages/shared/src/index.ts`

Export the new modules so the api/web can import them.

**Add these lines** (next to the other `export *` lines):
```ts
export * from './types/oncall';
export * from './lib/acknowledge';
export * from './lib/assignment';
```
