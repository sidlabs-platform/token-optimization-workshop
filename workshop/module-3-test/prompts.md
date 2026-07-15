# Module 3 — prompt pairs (paste into Copilot)

Run each pair through Copilot and read the real token delta from your **agent debug log** / `/usage`
(see [`MEASURING.md`](../MEASURING.md)).

---

## 3.1 — Scoped unit-test generation {#31}

### ❌ Baseline
```
Look over the whole project and write tests for everything related to acknowledgement and
assignment so we have good coverage.
```

### ✅ Optimized (scoped + style anchor)
```
<context>
Under test (read ONLY these):
- app/packages/shared/src/lib/acknowledge.ts
- app/packages/shared/src/lib/assignment.ts
Style anchor (match this file's structure, imports, and it.each usage):
- app/packages/shared/src/lib/healthScore.test.ts
</context>

<task>
Write app/packages/shared/src/lib/acknowledge.test.ts and assignment.test.ts (vitest).
Cover EVERY branch:
- acknowledge: happy path (open -> investigating, sets acknowledgedBy/At), non-open status
  preserved, off-shift rejected, resolved rejected, idempotent re-ack (keeps first
  acknowledger, bumps updatedAt), input not mutated.
- assign: happy path sets assignee (status unchanged), off-shift rejected, resolved rejected,
  no-op when already assignee, re-assign to a different engineer, input not mutated.
Build a helper makeIncident(overrides) so each test is one clear assertion block.
</task>

<constraints>
- Match the anchor's conventions exactly. No snapshot tests.
- Reply in <=3 lines after writing the files.
</constraints>
```

---

## 3.2 — API endpoint tests + cheap debugging {#32}

### ✅ Optimized
```
<context>
Read ONLY:
- app/packages/api/src/routes/incidents.ts
- app/packages/api/src/routes/incidents.test.ts   (style anchor: supertest + createApp)
</context>

<task>
Write app/packages/api/src/routes/incidents.ack.test.ts (vitest + supertest). Cover:
- POST /:id/ack on an open incident -> 200, accepted:true, status investigating, acknowledgedBy set
- missing engineerId -> 400 reason 'engineerId-required'
- unknown engineer -> 404 reason 'engineer-not-found'
- off-shift engineer (eng-cy) -> 409 reason 'engineer-not-on-shift'
- missing incident -> 404
- POST /:id/assign -> 200, assignee set
- GET /api/incidents?acknowledged=false -> every item has no acknowledgedBy
- ack then GET ?acknowledged=true -> includes that incident
Use the same active engineer id as the store roster (eng-ada / eng-ben; eng-cy is off-shift).
</task>

<constraints>
- Match the anchor's supertest style. Reply in <=3 lines.
</constraints>
```

### Cheap debugging loop (when a test fails)
Instead of pasting the full log, hand Copilot only the compressed failure:
```
Here is the compressed failure (only the failing assertions). Propose the minimal fix; read
only the file named in the trace.

<paste the 10-20 lines from Select-String "FAIL|Error|expected">
```

---

## 3.4 — Final challenge prompt {#34}

```
<context>
Read ONLY:
- app/packages/api/src/routes/stats.ts
- app/packages/shared/src/types/stats.ts
</context>
<task>
Add acknowledgedRate to GET /api/stats = (# active incidents with acknowledgedBy) / (# active
incidents), where active = status !== 'resolved'; 0 when there are no active incidents.
Add one supertest assertion for it.
</task>
<constraints>
Cheapest capable model. Surgical edits. Reply <=3 lines, no file dumps.
</constraints>
```
