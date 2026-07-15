#!/usr/bin/env bash
# workshop/solutions/apply.sh — apply the full reference solution into app/.
# Idempotent. Use to catch up a table or verify the solution.
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$(cd "$here/../.." && pwd)"
shared="$root/app/packages/shared/src"
api="$root/app/packages/api/src"
web="$root/app/packages/web/src"

echo "== Copying new + replacement files =="
cp "$here/shared/types/oncall.ts"         "$shared/types/oncall.ts"
cp "$here/shared/lib/acknowledge.ts"      "$shared/lib/acknowledge.ts"
cp "$here/shared/lib/acknowledge.test.ts" "$shared/lib/acknowledge.test.ts"
cp "$here/shared/lib/assignment.ts"       "$shared/lib/assignment.ts"
cp "$here/shared/lib/assignment.test.ts"  "$shared/lib/assignment.test.ts"
cp "$here/api/store.ts"                    "$api/data/store.ts"
cp "$here/api/incidents.ts"               "$api/routes/incidents.ts"
cp "$here/api/incidents.ack.test.ts"      "$api/routes/incidents.ack.test.ts"
cp "$here/web/AckButton.tsx"              "$web/components/AckButton.tsx"

echo "== Applying surgical edits to existing files =="
node - "$shared" <<'NODE'
const fs = require('fs');
const path = require('path');
const shared = process.argv[2];
function edit(file, find, replace) {
  const p = path.join(shared, file);
  let t = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
  if (t.includes(replace.trim())) { console.log(`  (already applied) ${file}`); return; }
  if (!t.includes(find)) throw new Error(`anchor not found in ${file}`);
  fs.writeFileSync(p, t.replace(find, replace));
  console.log(`  patched ${file}`);
}
edit('types/incident.ts',
  '  fingerprint: string;\n  duplicateCount: number;\n}',
  '  fingerprint: string;\n  duplicateCount: number;\n  acknowledgedBy?: string | null;\n  acknowledgedAt?: string | null;\n  assignee?: string | null;\n}');
edit('types/filters.ts',
  '  status?: IncidentStatus;\n  search?: string;\n}',
  '  status?: IncidentStatus;\n  search?: string;\n  acknowledged?: boolean;\n}');
edit('types/filters.ts',
  'return Boolean(filters.severity || filters.serviceId || filters.status || filters.search?.trim());',
  'return Boolean(\n    filters.severity ||\n      filters.serviceId ||\n      filters.status ||\n      filters.search?.trim() ||\n      filters.acknowledged !== undefined,\n  );');
edit('utils/query.ts',
  '  if (filters.status && incident.status !== filters.status) return false;\n  if (filters.search?.trim()) {',
  '  if (filters.status && incident.status !== filters.status) return false;\n  if (filters.acknowledged !== undefined) {\n    const isAck = Boolean(incident.acknowledgedBy);\n    if (isAck !== filters.acknowledged) return false;\n  }\n  if (filters.search?.trim()) {');
edit('index.ts',
  "export * from './lib/healthScore';",
  "export * from './lib/healthScore';\nexport * from './types/oncall';\nexport * from './lib/acknowledge';\nexport * from './lib/assignment';");
NODE

echo ""
echo "✔ Reference solution applied. Now run:  npm --prefix app test"
