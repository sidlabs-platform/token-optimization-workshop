#!/usr/bin/env node
// report.mjs — regenerate results/RESULTS.md scoreboard from results.csv.
import fs from "node:fs";
import path from "node:path";
import { RESULTS_CSV, RESULTS_DIR, fmtUsd } from "./lib.mjs";

if (!fs.existsSync(RESULTS_CSV)) {
  console.error(`No results yet at ${RESULTS_CSV}. Run some demos / compare.mjs first.`);
  process.exit(1);
}

const lines = fs.readFileSync(RESULTS_CSV, "utf8").trim().split(/\r?\n/);
const header = lines[0].split(",");
const rows = lines.slice(1).map((l) => parseCsvLine(l)).map((cols) => {
  const o = {};
  header.forEach((h, i) => (o[h] = cols[i]));
  return o;
});

function parseCsvLine(line) {
  const out = [];
  let cur = "", inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') inQ = false;
      else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

const num = (v) => Number(v || 0);
let totalRawTok = 0, totalOptTok = 0, totalRawET = 0, totalOptET = 0, totalRawUsd = 0, totalOptUsd = 0;
for (const r of rows) {
  totalRawTok += num(r.raw_tokens); totalOptTok += num(r.opt_tokens);
  totalRawET += num(r.raw_et); totalOptET += num(r.opt_et);
  totalRawUsd += num(r.raw_usd); totalOptUsd += num(r.opt_usd);
}
const overallPct = totalRawTok ? (((totalRawTok - totalOptTok) / totalRawTok) * 100).toFixed(1) : "0";
const etPct = totalRawET ? (((totalRawET - totalOptET) / totalRawET) * 100).toFixed(1) : "0";

// winner = row with highest pct_saved
const winner = [...rows].sort((a, b) => num(b.pct_saved) - num(a.pct_saved))[0];

let md = `# 📊 SentinelOps Token-Optimization Scoreboard\n\n`;
md += `_Generated ${new Date().toISOString()} from \`bench/results.csv\` (${rows.length} measurements)._\n\n`;
md += `> Every number below was **measured**, not hardcoded. Re-run \`node bench/report.mjs\` after any demo to refresh.\n\n`;
md += `## Headline\n\n`;
md += `| Metric | Raw | Optimized | Saved |\n|---|--:|--:|--:|\n`;
md += `| Tokens | ${totalRawTok.toLocaleString()} | ${totalOptTok.toLocaleString()} | **${overallPct}%** |\n`;
md += `| Effective Tokens (ET) | ${totalRawET.toFixed(0)} | ${totalOptET.toFixed(0)} | **${etPct}%** |\n`;
md += `| Cost (USD) | ${fmtUsd(totalRawUsd)} | ${fmtUsd(totalOptUsd)} | **${fmtUsd(totalRawUsd - totalOptUsd)}** |\n\n`;
if (winner) md += `🏆 **Best single win:** ${winner.demo} / ${winner.scenario} — **${winner.pct_saved}%** fewer tokens.\n\n`;

md += `## All measurements\n\n`;
md += `| Demo | Scenario | Model | Raw tok | Opt tok | Saved | Raw ET | Opt ET | Δ$ |\n`;
md += `|---|---|---|--:|--:|--:|--:|--:|--:|\n`;
for (const r of rows) {
  md += `| ${r.demo} | ${r.scenario} | ${r.model} | ${num(r.raw_tokens).toLocaleString()} | ${num(r.opt_tokens).toLocaleString()} | ${r.pct_saved}% | ${r.raw_et} | ${r.opt_et} | ${fmtUsd(num(r.usd_saved))} |\n`;
}

md += `\n## By demo (aggregated)\n\n`;
const byDemo = {};
for (const r of rows) {
  const d = (byDemo[r.demo] ||= { raw: 0, opt: 0 });
  d.raw += num(r.raw_tokens); d.opt += num(r.opt_tokens);
}
md += `| Demo | Raw tok | Opt tok | Saved |\n|---|--:|--:|--:|\n`;
for (const [d, v] of Object.entries(byDemo)) {
  const p = v.raw ? (((v.raw - v.opt) / v.raw) * 100).toFixed(1) : "0";
  md += `| ${d} | ${v.raw.toLocaleString()} | ${v.opt.toLocaleString()} | ${p}% |\n`;
}

md += `\n---\n_ET = m × (1.0·I + 0.1·C + 4.0·O). Prices from \`models.json\`._\n`;

fs.mkdirSync(RESULTS_DIR, { recursive: true });
fs.writeFileSync(path.join(RESULTS_DIR, "RESULTS.md"), md);
console.log(`Wrote ${path.join(RESULTS_DIR, "RESULTS.md")} (${rows.length} rows, overall ${overallPct}% tokens saved).`);
