#!/usr/bin/env node
// deck/build-talk-script.mjs — render the full speaker talk script (TALK-SCRIPT.md)
// from the same single source (deck-content.mjs) that drives the PPTX.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { meta, levers, intro, modules, outro } from "./deck-content.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, "TALK-SCRIPT.md");

const L = [];
L.push(`# ${meta.title} — Talk Script`);
L.push("");
L.push(`> Speaker notes for **token-optimization.pptx** (${intro.length + modules.length + outro.length + 2} slides).`);
L.push(`> Generated from \`deck-content.mjs\` — edit content there, then \`node deck/build-talk-script.mjs\`.`);
L.push("");
L.push("## Slide 1 — Title");
L.push("Title slide. Introduce yourself and set the frame: hands-on, measured, ~80% live demos. Every number comes from the bench harness — nothing is invented.");
L.push("");

let n = 2;
for (const it of intro) {
  L.push(`## Slide ${n} — ${it.title}`);
  L.push(it.notes);
  if (it.isLevers) {
    L.push("");
    L.push("| Lever | Demo module(s) |");
    L.push("|---|---|");
    for (const [l, d] of levers) L.push(`| ${l} | \`${d}\` |`);
  }
  L.push("");
  n++;
}

L.push(`## Slide ${n} — Section: The 20 demos`);
L.push("Section divider. This is the heart of the workshop — twenty modules, one per lever, all measured.");
L.push("");
n++;

for (const m of modules) {
  L.push(`## Slide ${n} — Module ${m.n}: ${m.title}  _(${m.lever})_`);
  L.push(m.notes);
  L.push("");
  L.push(`**Run:** \`${m.cmd}\`  ·  **Takeaway:** ${m.takeaway}`);
  L.push("");
  n++;
}

for (const it of outro) {
  L.push(`## Slide ${n} — ${it.title}`);
  L.push(it.notes);
  L.push("");
  n++;
}

fs.writeFileSync(out, L.join("\n"));
console.log(`✔ Built ${out} (${(fs.statSync(out).size / 1024).toFixed(0)} KB)`);
