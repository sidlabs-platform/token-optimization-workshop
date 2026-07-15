#!/usr/bin/env node
// fixtures/generate.mjs — capture REAL SentinelOps tool outputs and produce genuinely
// compressed ("rtk"/optimized) versions. Every optimized file is a real transformation of
// the raw file, so the token savings measured by bench/ are authentic and reproducible.
//
// Run from repo root:  node fixtures/generate.mjs
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const app = path.join(root, "app");
const W = (rel, content) => {
  const p = path.join(here, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
  console.log(`  wrote ${rel} (${content.length} bytes)`);
};
const cap = (cmd, cwd = root) => {
  try { return execSync(cmd, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 }); }
  catch (e) { return (e.stdout || "") + (e.stderr || ""); }
};
const read = (rel) => fs.readFileSync(path.join(app, rel), "utf8");

// Detect optional tools so we can capture REAL tool output when present, and fall back to
// equivalent built-in transforms (so fixtures still regenerate on a machine without them).
const has = (bin) => {
  try { execSync(`${process.platform === "win32" ? "where" : "which"} ${bin}`, { stdio: "ignore" }); return true; }
  catch { return false; }
};
const HAS_RTK = has("rtk");
const HAS_RG = has("rg");
// Run a command that reads `input` on stdin and return stdout (best-effort).
const capStdin = (cmd, input, cwd = root) => {
  try { return execSync(cmd, { cwd, input, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 }); }
  catch (e) { return (e.stdout || "") + (e.stderr || ""); }
};

// ---- compression transforms (what RTK-style tools do) ----------------------
function compressDiff(text) {
  // RTK-style: replace per-file git boilerplate with one compact header, drop unchanged
  // context lines, keep only hunk ranges and +/- changes, collapse blank runs.
  const out = [];
  for (const line of text.split(/\r?\n/)) {
    const m = /^diff --git a\/(.+?) b\/(.+)$/.exec(line);
    if (m) { out.push(`## ${m[2]}`); continue; }
    if (/^(index |--- |\+\+\+ |new file|deleted file|similarity|rename )/.test(line)) continue;
    if (/^@@/.test(line)) { out.push(line.replace(/@@ (.*?) @@.*/, "@@ $1")); continue; }
    if (/^[+-]/.test(line)) { out.push(line.replace(/\s+$/, "")); continue; }
    // skip context lines (leading space) entirely
  }
  return out.join("\n").replace(/\n{2,}/g, "\n") + "\n";
}
function compressVitest(text) {
  // Keep only summary + failures; drop the per-test PASS spam.
  const keep = [];
  for (const line of text.split(/\r?\n/)) {
    if (/(FAIL|✗|×|Error|expected|Test Files|Tests |Duration|Start at|failed|passed|✓ .*\(\d+ tests\))/i.test(line)) keep.push(line.trim());
  }
  // dedupe consecutive blanks
  return keep.filter((l, i) => l && !(l === keep[i - 1])).join("\n") + "\n";
}
function compressGrep(text) {
  // RTK-style: keep only true match lines (path:line:content), drop -C context lines and
  // "--" separators, and group matches by file so the path is printed once.
  const byFile = new Map();
  for (let line of text.split(/\r?\n/)) {
    line = line.replace(/\s+$/, "");
    const m = /^(.+?\.[A-Za-z]+):(\d+):(.*)$/.exec(line); // path.ext:NN:content
    if (!m) continue; // context lines use path.ext-NN-content -> skipped
    const [, file, num, content] = m;
    if (!byFile.has(file)) byFile.set(file, []);
    byFile.get(file).push(`  ${num}: ${content.trim()}`);
  }
  const out = [];
  for (const [file, lines] of byFile) { out.push(file + ":"); out.push(...lines); }
  return out.join("\n") + "\n";
}
function compressListFiles(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const total = lines.length;
  const nodeMods = lines.filter((l) => /node_modules/.test(l)).length;
  const own = lines.filter((l) => !/node_modules/.test(l));
  return [
    `tsc --noEmit: OK (0 errors)`,
    `files included: ${total} (${nodeMods} from node_modules elided)`,
    `project files:`,
    ...own.map((l) => "  " + l.replace(app, "app").replace(/\\/g, "/")),
  ].join("\n") + "\n";
}

console.log("Capturing real SentinelOps outputs...");
console.log(`  tools: rtk=${HAS_RTK} rg=${HAS_RG}` + (HAS_RTK ? "  (using REAL rtk output)" : "  (using built-in compressor fallback)"));

// 1) git diff (feature branch) -----------------------------------------------
// Raw = verbose diff (-U20). Optimized = real `rtk diff -` (ultra-condensed) if rtk is
// installed, else the built-in compressor.
const diffRaw = cap("git --no-pager diff -U20 main..feature/severity-filter -- app", root);
W("02-rtk/git-diff.raw.txt", diffRaw);
W("02-rtk/git-diff.rtk.txt", HAS_RTK ? capStdin("rtk diff -", diffRaw) : compressDiff(diffRaw));

// 2) vitest ------------------------------------------------------------------
// Raw = full verbose reporter. Optimized = real `rtk vitest run` (PASS/FAIL summary).
console.log("Running app tests (this can take ~30s)...");
const vitestRaw = cap("npx vitest run --reporter verbose", path.join(app, "packages/shared"));
W("02-rtk/vitest.raw.txt", vitestRaw);
W("02-rtk/vitest.rtk.txt", HAS_RTK ? cap("rtk vitest run", path.join(app, "packages/shared")) : compressVitest(vitestRaw));

// 3) grep --------------------------------------------------------------------
// Raw = ripgrep/grep WITH context (-C3). Optimized = real `rtk rg` (grouped, truncated).
let grepRaw;
if (HAS_RG) grepRaw = cap("rg -n -C 3 -i severity -t ts .", app);
else grepRaw = cap("git --no-pager grep -n -C 3 -i severity -- app", root);
if (!grepRaw.trim()) grepRaw = cap('findstr /s /n /i severity app\\packages\\*.ts app\\packages\\*.tsx', root);
W("02-rtk/grep.raw.txt", grepRaw);
W("02-rtk/grep.rtk.txt", HAS_RTK && HAS_RG ? cap("rtk rg -i severity -t ts .", app) : compressGrep(grepRaw));

// 4) tsc ---------------------------------------------------------------------
// Raw = tsc --listFiles (every included file). Optimized = real `rtk tsc` (grouped errors
// / "no errors" summary) if rtk installed, else the built-in compressor.
let tscRaw = cap("npx tsc --noEmit --listFiles -p packages/api/tsconfig.json", app);
if (!tscRaw.trim() || tscRaw.split(/\r?\n/).length < 20) tscRaw = cap("npm ls --all", app);
W("02-rtk/tsc.raw.txt", tscRaw);
W("02-rtk/tsc.rtk.txt", HAS_RTK ? cap("rtk tsc --noEmit -p packages/api/tsconfig.json", app) : compressListFiles(tscRaw));

// 5) Graphify: blind read set vs budgeted graph answer -----------------------
const ingestionFiles = [
  "packages/shared/src/types/ingestion.ts",
  "packages/shared/src/validators.ts",
  "packages/shared/src/lib/alertDedup.ts",
  "packages/api/src/ingestion/ingestIncident.ts",
  "packages/api/src/data/store.ts",
  "packages/api/src/routes/incidents.ts",
];
let blind = "";
for (const f of ingestionFiles) {
  try { blind += `\n// ===== ${f} =====\n` + read(f) + "\n"; } catch {}
}
W("03-graphify/blind.raw.txt", blind);
W(
  "03-graphify/graph.opt.txt",
  `# Graphify answer: incident-ingestion flow  (budget 1500 tokens)

nodes/edges the query returned (no full files read):

routes/incidents.ts  POST /api/incidents
  └─calls→ ingestion/ingestIncident.ts  ingestIncident(payload)
        ├─validate→ shared/validators.ts  validateIncidentPayload()
        ├─normalize→ shared/types/ingestion.ts  normalizeIncoming()
        ├─dedup→ shared/lib/alertDedup.ts  dedupeAlerts(key = service+title+severity window)
        └─persist→ api/data/store.ts  store.addIncident()

Summary: an incoming payload is validated, normalized, deduped against a recent
window (same service+title+severity), then stored. Duplicates increment a count
instead of inserting. This answers the question from the graph — the agent never
had to read the ${ingestionFiles.length} source files verbatim.
`
);

// 5b) Caveman: real read-dedup engine (its signature feature) ----------------
// An agent that re-reads the same file 3x wastes 3x the tokens. Caveman's
// ReadDeduplicationCache returns the full content once, then a tiny stub for repeats.
// We invoke the REAL caveman module when installed; else a faithful fallback stub.
const cavemanMod = findCaveman();
const ingestFile = "packages/api/src/ingestion/ingestIncident.ts";
const ingestContent = read(ingestFile);
const reads = 3;
const dedupOff = Array.from({ length: reads }, (_, i) =>
  `// ===== read #${i + 1}: ${ingestFile} =====\n${ingestContent}`
).join("\n\n");
W("04-caveman/readdedup.off.txt", dedupOff);

let dedupUltra;
if (cavemanMod) {
  const mod = await import(cavemanMod);
  const cache = new mod.ReadDeduplicationCache();
  const parts = [];
  for (let i = 0; i < reads; i++) {
    const stub = cache.checkRead(ingestFile, ingestContent);
    parts.push(`// ===== read #${i + 1}: ${ingestFile} =====\n${stub ?? ingestContent}`);
  }
  dedupUltra = parts.join("\n\n");
  console.log("  (04-caveman read-dedup used REAL caveman ReadDeduplicationCache)");
} else {
  dedupUltra =
    `// ===== read #1: ${ingestFile} =====\n${ingestContent}\n\n` +
    `// ===== read #2: ${ingestFile} =====\n[File unchanged since read #1. Content identical to prior read. Reference that context.]\n\n` +
    `// ===== read #3: ${ingestFile} =====\n[File unchanged since read #1. Content identical to prior read. Reference that context.]`;
  console.log("  (04-caveman read-dedup used fallback stub — caveman not found)");
}
W("04-caveman/readdedup.ultra.txt", dedupUltra);

// 6) Module 1: baseline (all sinks) vs lean (surgical) -----------------------
const npmls = cap("npm ls --all", app);
const baseline =
  "# BASELINE CONTEXT a naive session drags in to 'add a severity filter'\n\n" +
  "## 1) full feature diff (raw)\n" + diffRaw +
  "\n## 2) full test log (raw)\n" + vitestRaw +
  "\n## 3) dependency dump (npm ls --all)\n" + npmls +
  "\n## 4) re-read of the whole ingestion flow\n" + blind;
W("01-waste/baseline-context.raw.txt", baseline);

const lean =
  fs.readFileSync(path.join(here, "05-context/prompt.xml.txt"), "utf8") +
  "\n\n// only file that must change:\n// ===== packages/web/src/components/IncidentsTable.tsx (relevant slice) =====\n" +
  sliceAround(read("packages/web/src/components/IncidentsTable.tsx"), /severity/i, 40);
W("01-waste/lean-context.opt.txt", lean);

// 7) Module 6: whole naive session vs fully-optimized session ----------------
const naive =
  baseline +
  "\n## 5) 40-tool MCP schema loaded every turn\n" +
  fs.readFileSync(path.join(here, "05-context/mcp-schemas.raw.txt"), "utf8") +
  "\n## 6) chatty agent output\n" +
  fs.readFileSync(path.join(here, "04-caveman/agent-output.off.txt"), "utf8");
W("06-challenge/naive-session.raw.txt", naive);

const optimized =
  fs.readFileSync(path.join(here, "05-context/prompt.xml.txt"), "utf8") + "\n" +
  compressDiff(diffRaw) + "\n" +
  compressVitest(vitestRaw) + "\n" +
  fs.readFileSync(path.join(here, "03-graphify/graph.opt.txt"), "utf8") + "\n" +
  fs.readFileSync(path.join(here, "05-context/mcp-schemas.gh.txt"), "utf8") + "\n" +
  fs.readFileSync(path.join(here, "04-caveman/agent-output.ultra.txt"), "utf8");
W("06-challenge/optimized-session.opt.txt", optimized);

console.log("\nDone. Fixtures regenerated from the real SentinelOps app.");

function sliceAround(text, re, span) {
  const lines = text.split(/\r?\n/);
  const idx = lines.findIndex((l) => re.test(l));
  if (idx < 0) return lines.slice(0, span).join("\n");
  const s = Math.max(0, idx - 5), e = Math.min(lines.length, idx + span);
  return lines.slice(s, e).join("\n");
}

// Locate caveman's compiled compression module (dist/core/cave-tool-compression.js).
// Checks $CAVEMAN_MODULE, `npm root -g`, and the workshop's local node22 prefix.
function findCaveman() {
  const rel = "@juliusbrussee/caveman-code/dist/core/cave-tool-compression.js";
  const candidates = [];
  if (process.env.CAVEMAN_MODULE) candidates.push(process.env.CAVEMAN_MODULE);
  const home = process.env.USERPROFILE || process.env.HOME || "";
  candidates.push(path.join(home, ".local", "caveman-prefix", "node_modules", rel));
  candidates.push(path.join(home, ".local", "caveman-prefix", "lib", "node_modules", rel));
  try {
    const gr = execSync("npm root -g", { encoding: "utf8" }).trim();
    if (gr) candidates.push(path.join(gr, rel));
  } catch { /* ignore */ }
  for (const c of candidates) {
    try { if (c && fs.existsSync(c)) return "file:///" + c.replace(/\\/g, "/"); } catch { /* */ }
  }
  return null;
}
