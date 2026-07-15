# Module 2 — prompt pairs (paste into Copilot)

Run each pair through Copilot and read the real token delta from your **agent debug log** / `/usage`
(see [`MEASURING.md`](../MEASURING.md)).

---

## 2.1 — Query, don't read {#21}

### ❌ Blind read
```
I need to add an "acknowledged" filter to the incidents list. Open every file that might be
involved in incident filtering across shared, api, and web, read them fully, and then tell me
where to make the change.
```

### ✅ Budgeted query
```
Answer in <=12 lines. For the incident-filtering flow, give me the exact file + symbol for each
hop: (1) the filter type, (2) the match predicate, (3) where the API parses query params,
(4) where the store applies it, (5) where the web serializes filters. Read at most 3 files to
confirm, then stop. Do not paste file contents.
```
> With Graphify installed: `graphify query "incident filtering" --budget 900`.

---

## 2.2 — Build assignment + acknowledged filter {#22}

### ✅ Optimized (scoped to the files the query surfaced)
```
<context>
Read ONLY:
- app/packages/shared/src/types/filters.ts
- app/packages/shared/src/utils/query.ts
- app/packages/api/src/routes/incidents.ts
</context>

<task>
1. Add acknowledged?: boolean to IncidentFilters and include it in hasActiveIncidentFilters.
2. In incidentMatchesFilters, when filters.acknowledged is defined, keep an incident only if
   Boolean(incident.acknowledgedBy) === filters.acknowledged.
3. In the incidents router GET '/', parse ?acknowledged=true|false into the filter.
4. Add a new PURE app/packages/shared/src/lib/assignment.ts exporting
   assignIncident(incident, engineer, now): reject off-shift ('engineer-not-on-shift') and
   resolved ('incident-resolved'); no-op if incident.assignee === engineer.id; otherwise set
   assignee and bump updatedAt; never change status; never mutate the input.
5. Add POST /:id/assign to the router (same status-code contract as /:id/ack).
Export assignment from app/packages/shared/src/index.ts.
</task>

<constraints>
- Surgical edits only. Keep existing tests valid.
- Reply in <=5 lines. No restating file contents.
</constraints>
```

---

## 2.4 — copilot-instructions.md template {#24}

Save as `.github/copilot-instructions.md` (stable → cacheable, so you stop retyping it):
```markdown
# SentinelOps — agent house rules

- Monorepo: packages/shared (types + pure logic), packages/api (Express), packages/web (React).
- Domain types + pure functions live in @sentinelops/shared and must stay I/O-free + unit-tested.
- Prefer OPTIONAL fields; never write a data migration for seed data.
- Make surgical edits; do not reformat or touch unrelated code.
- Status-code contract for mutations: 200 ok · 400 bad input · 404 not found · 409 conflict.
- Reply concisely (<=6 lines) and do not restate file contents.
- Build check: `npm --prefix app run typecheck`. Tests: `npm --prefix app test`.
```
