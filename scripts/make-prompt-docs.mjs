#!/usr/bin/env node
// scripts/make-prompt-docs.mjs — generate demos/<demo>/PROMPTS.md from prompts/<demo>/*.
// Single source of truth = prompts/. Run: node scripts/make-prompt-docs.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const promptsDir = path.join(root, "prompts");
const demos = fs.readdirSync(promptsDir).filter((d) => fs.statSync(path.join(promptsDir, d)).isDirectory());

for (const demo of demos) {
  const dir = path.join(promptsDir, demo);
  const meta = JSON.parse(fs.readFileSync(path.join(dir, "meta.json"), "utf8"));
  const baseline = fs.readFileSync(path.join(dir, "baseline.txt"), "utf8").trim();
  const optimized = fs.readFileSync(path.join(dir, "optimized.txt"), "utf8").trim();
  const req = (meta.requires && meta.requires.length) ? meta.requires.join(", ") : "none";

  const md = `# ${demo} — validated prompts (baseline vs optimized)

**Task:** ${meta.task}

**Technique:** ${meta.technique}

**Quality gate (both answers must satisfy this):**
> ${meta.quality_check}

**Requires tools:** ${req} · **Default model:** \`${meta.model}\`

---

## 1) Run it the easy way

Compare both variants on one model and see the token delta:
\`\`\`powershell
./scripts/run-prompt.ps1 -Demo ${demo} -Compare
\`\`\`
Compare across all six models (Opus vs Sol, Sonnet 5 vs Terra, Haiku vs MAI):
\`\`\`powershell
./scripts/run-matrix.ps1 -Demo ${demo} -Variant both
\`\`\`
(macOS/Linux: use the \`.sh\` equivalents. Add \`-DryRun\` to preview without calling Copilot.)

Then open \`results/MODEL-MATRIX-${demo}.md\` and confirm the answers still satisfy the
quality gate above — that's the "same quality, fewer tokens" proof.

---

## 2) Or paste the prompts into Copilot yourself

### ❌ Baseline (no optimization)
\`\`\`
${baseline}
\`\`\`

### ✅ Optimized (${meta.technique.split(":")[0]})
\`\`\`
${optimized}
\`\`\`

**Expected:** ${meta.expected}

> Both prompts produce an answer that satisfies the quality gate; the optimized one does it
> with fewer tokens (and therefore fewer AI credits / lower ET / lower $).
`;
  fs.writeFileSync(path.join(root, "demos", demo, "PROMPTS.md"), md);
  console.log(`wrote demos/${demo}/PROMPTS.md`);
}
console.log("Done.");
