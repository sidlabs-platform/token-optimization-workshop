#!/usr/bin/env node
// deck/build.mjs — export slides.md to slides.pdf via globally-installed md-to-pdf.
// One-command build:  node deck/build.mjs   (or  npm run build  inside deck/)
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const md = path.join(here, "slides.md");
const pdf = path.join(here, "slides.pdf");
if (!fs.existsSync(md)) { console.error("slides.md not found"); process.exit(1); }

// Prefer a local/global md-to-pdf; fall back to npx.
function run(cmd) {
  execSync(cmd, { stdio: "inherit", cwd: here, shell: true });
}
try {
  run(`md-to-pdf "${md}"`);
} catch {
  console.log("md-to-pdf not on PATH; trying npx…");
  run(`npx --yes md-to-pdf "${md}"`);
}
if (fs.existsSync(pdf)) {
  const kb = (fs.statSync(pdf).size / 1024).toFixed(0);
  console.log(`\n✔ Built ${pdf} (${kb} KB)`);
} else {
  console.error("PDF was not produced.");
  process.exit(1);
}
