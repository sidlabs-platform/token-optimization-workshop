#!/usr/bin/env node
// workshop/fixtures/generate.mjs
// Builds authentic baseline-vs-optimized context payloads for the three workshop
// modules directly from the real SentinelOps app, so every measured saving is real.
// Re-run any time: `node workshop/fixtures/generate.mjs`
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const app = path.join(root, 'app', 'packages');

const read = (p) => fs.readFileSync(path.join(app, p), 'utf8');
const write = (rel, text) => {
  const p = path.join(here, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, text);
  const kb = (Buffer.byteLength(text) / 1024).toFixed(1);
  console.log(`  wrote ${rel.padEnd(34)} ${kb.padStart(7)} KB`);
};

// A naive session "reads everything" to add one endpoint. Simulate that context.
const wholeRepoDump = [
  'shared/src/index.ts',
  'shared/src/types/incident.ts',
  'shared/src/types/severity.ts',
  'shared/src/types/service.ts',
  'shared/src/types/filters.ts',
  'shared/src/types/ingestion.ts',
  'shared/src/types/stats.ts',
  'shared/src/utils/query.ts',
  'shared/src/utils/date.ts',
  'shared/src/utils/format.ts',
  'shared/src/utils/id.ts',
  'shared/src/lib/alertDedup.ts',
  'shared/src/lib/healthScore.ts',
  'shared/src/seed/catalog.ts',
  'shared/src/seed/incidents.ts',
  'shared/src/seed/index.ts',
  'shared/src/validators.ts',
  'api/src/app.ts',
  'api/src/server.ts',
  'api/src/index.ts',
  'api/src/data/store.ts',
  'api/src/data/seed.ts',
  'api/src/routes/incidents.ts',
  'api/src/routes/services.ts',
  'api/src/routes/stats.ts',
  'api/src/routes/health.ts',
  'api/src/ingestion/ingestIncident.ts',
  'api/src/middleware/errorHandler.ts',
  'api/src/utils/http.ts',
  'api/src/routes/incidents.test.ts',
  'api/src/routes/services.test.ts',
  'api/src/routes/stats.test.ts',
  'api/src/ingestion/ingestIncident.test.ts',
]
  .map((f) => {
    let body = '';
    try {
      body = read(f);
    } catch {
      body = '// (missing)';
    }
    return `// ==== app/packages/${f} ====\n${body}`;
  })
  .join('\n\n');

// ---------------------------------------------------------------------------
// MODULE 1 — Build the feature the lean way
// baseline: read the whole repo. optimized: scope to the 3 files that matter + XML task.
// ---------------------------------------------------------------------------
write(
  'm1/build-context.raw.txt',
  `[Naive session context — "explore the whole repo, then add an acknowledge endpoint"]\n\n${wholeRepoDump}\n`,
);

const leanContext = `<context>
Files needed to add POST /api/incidents/:id/ack:
</context>
// ==== app/packages/shared/src/types/incident.ts ====
${read('shared/src/types/incident.ts')}
// ==== app/packages/api/src/routes/incidents.ts ====
${read('api/src/routes/incidents.ts')}
// ==== app/packages/api/src/data/store.ts ====
${read('api/src/data/store.ts')}

<task>
Add POST /api/incidents/:id/ack. Add optional acknowledgedBy/acknowledgedAt to Incident.
Move an 'open' incident to 'investigating' on first ack. Return 404 if the incident is missing.
</task>
<constraints>
- Touch only these three files plus a new shared/lib/acknowledge.ts.
- Do not read other files. Do not restate the plan. Keep prose to <=3 lines.
</constraints>
`;
write('m1/build-context.opt.txt', leanContext);

// Output control: verbose agent narration vs terse structured summary.
write(
  'm1/agent-output.verbose.txt',
  `Great question! Let me help you add an acknowledge endpoint. First, I'll walk through my
understanding of the codebase and the overall architecture so we're on the same page.

SentinelOps is a TypeScript monorepo with three packages — shared, api, and web. The shared
package holds the domain types and pure logic, the api package is an Express server, and the
web package is a React dashboard. To add acknowledgement I first considered several possible
approaches. Approach one would be to store the acknowledgement on the incident record itself.
Approach two would be to create a separate acknowledgements table/collection. Approach three
would be an event-sourced log. After weighing the trade-offs of each of these approaches in
detail, and considering maintainability, testability, performance, and future extensibility,
I've decided to go with approach one because it is the simplest and fits the existing model.

Now, let me explain each change I'm going to make, step by step, before I make it, and then
I'll explain it again after I've made it so you can follow along completely...

1. I will add acknowledgedBy and acknowledgedAt to the Incident interface. These will be
   optional so that all existing seed data and tests keep working without any migration.
2. I will create a new pure function acknowledgeIncident in a new file so that it is easy to
   unit test in isolation without spinning up the whole Express server.
3. I will wire a new route into the incidents router.
4. I will add a method to the store.

Let me now proceed to implement all of these steps. I'll show you the full file each time.
(...continues restating every file in full...)
`,
);
write(
  'm1/agent-output.terse.txt',
  `Plan: store ack on the incident record (simplest, fits model).

Changes:
- incident.ts: +acknowledgedBy?, +acknowledgedAt? (optional -> no migration)
- shared/lib/acknowledge.ts: pure acknowledgeIncident(incident, engineer, now)
- store.ts: acknowledge(id, engineer, now)
- incidents.ts: POST /:id/ack -> 200 | 404 | 409

Done. Tests: acknowledge.test.ts + incidents.ack.test.ts.
`,
);

// ---------------------------------------------------------------------------
// MODULE 2 — Query & navigate the large codebase
// baseline: blind read of many files to answer "where is filtering handled?".
// optimized: a budgeted graph/query answer that names the exact symbols.
// ---------------------------------------------------------------------------
write(
  'm2/where-filtering.raw.txt',
  `[Blind navigation — read many files to answer: "where is incident filtering handled, end to end?"]\n\n` +
    [
      'shared/src/types/filters.ts',
      'shared/src/utils/query.ts',
      'shared/src/index.ts',
      'api/src/routes/incidents.ts',
      'api/src/data/store.ts',
      'api/src/app.ts',
      'web/src/api/client.ts',
      'web/src/hooks/useIncidentFilters.ts',
      'web/src/store/filtersSlice.ts',
      'web/src/components/SeverityFilter.tsx',
      'web/src/components/IncidentsTable.tsx',
    ]
      .map((f) => {
        let body = '';
        try {
          body = read(f);
        } catch {
          body = '// (missing)';
        }
        return `// ==== app/packages/${f} ====\n${body}`;
      })
      .join('\n\n') +
    '\n',
);
write(
  'm2/where-filtering.opt.txt',
  `Q: Where is incident filtering handled, end to end?

A (from code graph, budget 900 tok):
- Filter shape:      shared/src/types/filters.ts  -> IncidentFilters {severity,serviceId,status,search}
- Match predicate:   shared/src/utils/query.ts    -> incidentMatchesFilters(incident, filters)
- API entrypoint:    api/src/routes/incidents.ts  -> GET '/' builds IncidentFilters from req.query
- Store apply:       api/src/data/store.ts        -> listIncidents(filters) => incidents.filter(matches)
- Web -> query:      web/src/api/client.ts        -> getIncidents() serializes filters to querystring
- Web state:         web/src/store/filtersSlice.ts + hooks/useIncidentFilters.ts

To add an 'acknowledged' filter: edit filters.ts (type), query.ts (predicate), incidents.ts (parse).
`,
);

// ---------------------------------------------------------------------------
// MODULE 3 — Test & harden efficiently
// baseline: full verbose vitest output. optimized: RTK-style compressed summary.
// (Mirrors the shape of a real vitest run over the api package.)
// ---------------------------------------------------------------------------
const verboseVitest = () => {
  const suites = [
    ['incidents.test.ts', 'incidents api', [
      'lists seeded incidents',
      'filters incidents by severity critical',
      'filters incidents by severity high',
      'filters incidents by severity medium',
      'filters incidents by severity low',
      'filters incidents by status open',
      'filters incidents by status investigating',
      'filters incidents by status mitigated',
      'filters incidents by status resolved',
      'filters incidents by service id',
      'filters incidents by search text',
      'gets an incident by id',
      'returns 404 for missing incident',
    ]],
    ['incidents.ack.test.ts', 'incident acknowledgement api', [
      'acknowledges an open incident and moves it to investigating',
      'rejects ack with missing engineerId (400)',
      'rejects ack from an unknown engineer (404)',
      'rejects ack from an off-shift engineer (409)',
      'returns 404 for acknowledging a missing incident',
      'assigns an incident to an engineer',
      'filters incidents by acknowledged=false',
      'reflects an acknowledgement in the acknowledged=true filter',
    ]],
    ['services.test.ts', 'services api', ['lists services', 'gets a service by id', 'returns 404 for missing service']],
    ['stats.test.ts', 'stats api', ['returns dashboard stats', 'aggregates incidents by severity']],
  ];
  let out = `> @sentinelops/api@1.0.0 test\n> vitest run --reporter verbose\n\n RUN  v2.1.8 C:/token-optimization-workshop/app/packages/api\n\n`;
  for (const [file, desc, tests] of suites) {
    for (const t of tests) {
      out += ` \u2713 src/routes/${file} > ${desc} > ${t}  ${(2 + Math.random() * 30).toFixed(1)}ms\n`;
    }
    out += '\n';
  }
  out += ` Test Files  4 passed (4)\n      Tests  26 passed (26)\n   Start at  19:35:07\n   Duration  1.42s (transform 690ms, setup 0ms, collect 1.50s, tests 92ms)\n`;
  return out;
};
write('m3/vitest.raw.txt', verboseVitest());
write(
  'm3/vitest.opt.txt',
  `vitest: 4 files, 26 tests, ALL PASS (1.42s).
files: incidents(13), incidents.ack(8), services(3), stats(2).
0 failures. 0 skipped.
`,
);

// ---------------------------------------------------------------------------
// MODULE 4 — Advanced agent-loop optimization
// The feature slice for this module is an ESCALATION POLICY:
//   incidents acknowledged > 15 min ago but still not resolved get flagged
//   `escalated`, surface as stats.escalatedCount, and are filterable via
//   GET /api/incidents?escalated=true. It spans shared lib + api + stats, so it
//   is a genuinely multi-step task — perfect for task breakdown & routing.
// ---------------------------------------------------------------------------

// -- 4.1 Task breakdown (/plan) --------------------------------------------
// baseline: one mega-prompt that dumps the whole repo and asks for everything
// at once. optimized: a /plan decomposition + ONLY the first step's scoped
// context (each later step carries its own tiny context, not the whole repo).
write(
  'm4/plan-mega.raw.txt',
  `[Naive single-shot session — "read the whole repo, then build the entire escalation policy end to end in one go"]

Task: Implement the full escalation policy across the whole stack in a single pass:
- flag incidents acknowledged > 15 min ago but not resolved as escalated
- add escalatedCount to dashboard stats
- add GET /api/incidents?escalated=true
- add the pure escalation logic, wire the store, the routes, the stats aggregation,
  the web filter chip, and update every affected test.
Explore everything first so you have full context, then do all of it.

${wholeRepoDump}
`,
);
write(
  'm4/plan-decomposed.opt.txt',
  `PLAN (from /plan — 5 scoped steps, each run in its own turn with only the files it needs):
1. shared/lib/escalation.ts  — pure escalateIncident(incident, now, thresholdMs=15*60_000)
2. shared/types/filters + utils/query — add escalated? to IncidentFilters + predicate
3. api store + routes        — apply escalation on read; parse ?escalated=true
4. shared/types/stats + api store.stats() — add escalatedCount (counts read-time escalated incidents)
5. web filter chip + affected tests (optional in-workshop)

--- STEP 1 CONTEXT ONLY (the rest are fetched per-step, not now) ---
// ==== app/packages/shared/src/types/incident.ts ====
${read('shared/src/types/incident.ts')}
// ==== app/packages/shared/src/lib/alertDedup.ts (style anchor: pure, immutable) ====
${read('shared/src/lib/alertDedup.ts')}

<task>Step 1 only: create shared/src/lib/escalation.ts exporting a PURE
escalateIncident(incident, now, thresholdMs=15*60_000) that returns the incident unchanged
unless it is acknowledged (acknowledgedAt set), not resolved, and
(Date.parse(now) - Date.parse(incident.acknowledgedAt)) > thresholdMs, in which case it returns
a new incident with escalated:true. Timestamps are ISO strings (see createdAt/updatedAt), so
compare via Date.parse. Never mutate input. Add optional escalated?: boolean to Incident.</task>
<constraints>Read only the two files above. No repo crawl. <=3 lines of prose.</constraints>
<note>escalation builds on the acknowledgedAt field you added in Module 1.</note>
`,
);

// -- 4.2 Context management (/compact) -------------------------------------
// baseline: sprawling multi-task history re-sent before the escalation work.
// optimized: a /compact operational summary carrying only what step 3 needs.
const sprawl = [];
for (let turn = 1; turn <= 18; turn++) {
  const topics = [
    `[turn ${turn}] (ACK work) Discussed POST /:id/ack status codes again: 200 ok, 400 missing engineerId, 404 unknown, 409 off-shift/resolved. Re-pasted incident.ts and store.ts in full for context.`,
    `[turn ${turn}] (UI copy) Bikeshed the toast text for the acknowledge button: "Acknowledged by {name}" vs "You acknowledged this". Pasted three React components to compare styling.`,
    `[turn ${turn}] (CI triage) A flaky vitest snapshot in the web package failed twice; pasted the whole 300-line CI log and the vite config to investigate, then it passed on retry.`,
    `[turn ${turn}] (dedup debugging) Chased why findDuplicateIncident skipped resolved incidents; re-read alertDedup.ts and ingestIncident.ts and the seed data top to bottom.`,
  ];
  sprawl.push(topics[turn % topics.length]);
}
write(
  'm4/history-sprawl.raw.txt',
  `[40-ish turn mixed session carried forward as context before starting the escalation store/route step]

${sprawl.join('\n\n')}

Now, unrelated to all of the above, please add the escalated read-time flagging in the store and the ?escalated=true route parsing.
`,
);
write(
  'm4/history-compact.opt.txt',
  `[/compact focus="escalation store + route step"]
GOAL: add escalation to the API layer only.
DONE: shared/lib/escalation.ts (pure escalateIncident) + filters.escalated? predicate — merged, typecheck green.
NOW: (a) app/packages/api/src/data/store.ts — apply escalateIncident(inc, now) when listing/reading incidents;
     (b) app/packages/api/src/routes/incidents.ts — parse ?escalated=true|false on GET '/'.
CONSTRAINTS: optional field only, no migration; surgical edits; reply <=3 lines.
OPEN RISK: keep escalation read-time (derived), do not persist a mutation in seed data.
`,
);

// -- 4.3 Model selection & routing (/model) --------------------------------
// baseline: all-Opus workflow that re-explains SentinelOps every turn.
// optimized: a routing plan with concise per-tier handoffs.
const domainReminder = `SentinelOps is a TypeScript monorepo (shared, api, web). Incidents have
severity/status; there is a store, an Express incidents router, a stats aggregator, and a React
dashboard. House rules: optional fields only, no migrations, surgical edits, terse replies.`;
write(
  'm4/route-single.raw.txt',
  `[Model policy: pin Opus 4.8 for every step of the escalation feature. Re-explain the repo each turn.]

--- turn 1 (Opus) ---
${domainReminder}
Look up the exact field name used for acknowledgement time on Incident and the status enum values.

--- turn 2 (Opus) ---
${domainReminder}
Grep for every place incidents are filtered so I know where to add the escalated predicate.

--- turn 3 (Opus) ---
${domainReminder}
Now design the escalation rule and its edge cases (idempotency, resolved incidents, clock skew).

--- turn 4 (Opus) ---
${domainReminder}
Implement escalateIncident and wire it into the store and routes.

--- turn 5 (Opus) ---
${domainReminder}
Write the unit tests and update the affected API tests.
`,
);
write(
  'm4/route-mixed.opt.txt',
  `[Routing plan — one model per SESSION (no mid-session switching; keep the ~90%-off cache).
Stable rules live in copilot-instructions.md, not re-pasted.]
- Session A (Sonnet): lookup (field = acknowledgedAt; status open|investigating|mitigated|resolved),
  grep hops (types/filters.ts, utils/query.ts, routes/incidents.ts), implement escalateIncident +
  store/route wiring, and the unit + affected API tests — all on one model, one session.
- Session B (Opus, the one ambiguous piece): escalation rule + edge cases (idempotent, skip resolved,
  clock skew). Hand the conclusion back to Session A as one line of state.
Handoff between sessions: one line of state, no repo re-explanation (it is in copilot-instructions.md).
`,
);

// -- 4.4 Auto model (/model auto) ------------------------------------------
// baseline: the user hand-micromanages the model every turn with verbose meta-prose.
// optimized: lean prompt that relies on /model auto + /subagents config.
write(
  'm4/auto-manual.raw.txt',
  `[Manually babysitting the model tier inside every prompt]
Use Claude Opus 4.8 for this next part because it is important. Actually, wait — for the simple
lookup of the field name, switch down to the Haiku small model to save money, then switch back up
to Opus for the reasoning, but only if the reasoning is hard, otherwise use Sonnet. For the tests
use Sonnet, but if a test is tricky escalate to Opus, then remember to switch back down to Sonnet
or Haiku for the mechanical edits. Before each step, tell me which model you are on and why, and
confirm you switched. If you are unsure which model to use, ask me first and I will decide. Repeat
this model-selection preamble at the start of every single turn so we never lose track.
`,
);
write(
  'm4/auto-managed.opt.txt',
  `[/model auto turned on; /subagents sets a lean default sub-agent model — configured once]
Router: auto (picks a tier per step). Subagents: default sub-agent model set to a mid/small tier
via /subagents so delegated work doesn't all run on the flagship.
Just do the work; let auto pick. No per-turn model preamble, no switch confirmations.
`,
);

// -- 4.5 Thinking & reasoning depth ----------------------------------------
// baseline: over-thought visible reasoning to a concrete stats question.
// optimized: right-sized reasoning + crisp recommendation. Scored as OUTPUT (4x).
write(
  'm4/reason-high.raw.txt',
  `Question: should incidents that are acknowledged but not yet resolved still be counted in
DashboardStats.openIncidentCount, or excluded once escalated?

Let me think about this very carefully and consider every possible angle before answering.

First, what is an "open" incident conceptually? I should enumerate all four statuses: open,
investigating, mitigated, resolved. Now, acknowledgement is orthogonal to status — an incident can
be acknowledged while still being open or investigating. So the question is really about whether the
"open" count is a status-based count or a workflow-based count. Let me consider the history of how
this metric might have been used. If a stakeholder looks at openIncidentCount on a wall dashboard,
what do they expect? Probably the number of things still needing attention. But an acknowledged
incident IS still needing attention until resolved. On the other hand, if we exclude acknowledged
ones, the number would drop the moment someone clicks ack, which could be misleading and could be
gamed. Let me also consider escalation: an escalated incident is by definition still unresolved and
overdue, so it must count. Let me now consider the alternative where we split the metric into two:
openIncidentCount and unacknowledgedIncidentCount. That would be cleaner but is a bigger change and
touches the web layer and the stats type and every test. Let me weigh the migration cost versus the
clarity benefit across maintainability, testability, stakeholder expectations, and backward
compatibility, each in turn... (continues deliberating at length) ...

After all of that deliberation, weighing every trade-off exhaustively, my recommendation is that
open should mean status !== 'resolved', so acknowledged and escalated incidents both still count,
because they are still unresolved work.
`,
);
write(
  'm4/reason-medium.opt.txt',
  `Reasoning (brief): "open" here means status !== 'resolved'. Acknowledgement and escalation are
orthogonal to status — both are still unresolved work — so both must keep counting.

Recommendation: openIncidentCount = incidents where status !== 'resolved'. Do NOT exclude acknowledged
or escalated incidents. If you want a "needs first response" number, add a separate
unacknowledgedIncidentCount rather than mutating the meaning of open.
`,
);

console.log('\nDone. Fixtures written under workshop/fixtures/.');
