#!/usr/bin/env node
// deck/build-pptx.mjs — generate token-optimization.pptx from deck-content.mjs.
// Every slide's speaker notes are the talk script. Run: node deck/build-pptx.mjs
import pptxgen from "pptxgenjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { meta, levers, intro, modules, outro } from "./deck-content.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, "token-optimization.pptx");

// ---- theme ----
const BG = "0D1117", FG = "E6EDF3", BLUE = "58A6FF", GREEN = "3FB950";
const MUTED = "8B949E", PANEL = "161B22", BORDER = "30363D";

const pptx = new pptxgen();
pptx.defineLayout({ name: "W", width: 13.333, height: 7.5 });
pptx.layout = "W";
pptx.author = "Token Optimization Workshop";
pptx.company = "SentinelOps";
pptx.title = meta.title;

pptx.defineSlideMaster({
  title: "MAIN",
  background: { color: BG },
  objects: [
    { rect: { x: 0, y: 7.05, w: 13.333, h: 0.45, fill: { color: PANEL } } },
    { text: {
        text: meta.footer,
        options: { x: 0.4, y: 7.05, w: 10, h: 0.45, fontSize: 9, color: MUTED, align: "left", valign: "middle", fontFace: "Segoe UI" },
    } },
  ],
  slideNumber: { x: 12.4, y: 7.05, w: 0.7, h: 0.45, fontSize: 9, color: MUTED, align: "right", valign: "middle" },
});

const notes = (s, t) => s.addNotes(t);

function bulletLines(items) {
  return items.map((t) => ({ text: t, options: { bullet: { code: "2022" }, color: FG, fontSize: 17, paraSpaceAfter: 8 } }));
}

// ---- title slide ----
(() => {
  const s = pptx.addSlide({ masterName: "MAIN" });
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 2.4, w: 0.18, h: 2.4, fill: { color: BLUE } });
  s.addText(meta.title, { x: 0.7, y: 2.5, w: 12, h: 1.4, fontSize: 40, bold: true, color: BLUE, fontFace: "Segoe UI" });
  s.addText(meta.subtitle, { x: 0.72, y: 3.9, w: 12, h: 0.7, fontSize: 20, color: FG, fontFace: "Segoe UI" });
  s.addText("A 2-hour hands-on workshop · ~80% live demos · every saving measured by bench/", {
    x: 0.72, y: 4.7, w: 12, h: 0.6, fontSize: 14, color: MUTED, italic: true, fontFace: "Segoe UI" });
  notes(s, "Title slide. Introduce yourself and set the frame: this is a hands-on, measured workshop. Roughly eighty percent of the time is live demos. Nothing on these slides is invented — every number is produced by the bench harness in the repo. We'll cover all eleven levers of the token-optimization playbook, each backed by a runnable demo.");
})();

// ---- section header helper ----
function sectionHeader(label) {
  const s = pptx.addSlide({ masterName: "MAIN" });
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 3.1, w: 13.333, h: 1.3, fill: { color: PANEL } });
  s.addText(label, { x: 0.7, y: 3.1, w: 12, h: 1.3, fontSize: 32, bold: true, color: BLUE, valign: "middle", fontFace: "Segoe UI" });
  return s;
}

// ---- content slide helper ----
function contentSlide({ title, bullets, cmd, takeaway, tag }) {
  const s = pptx.addSlide({ masterName: "MAIN" });
  if (tag) s.addText(tag, { x: 0.7, y: 0.35, w: 12, h: 0.4, fontSize: 13, bold: true, color: GREEN, fontFace: "Segoe UI" });
  s.addText(title, { x: 0.7, y: 0.7, w: 12, h: 0.8, fontSize: 28, bold: true, color: BLUE, fontFace: "Segoe UI" });
  s.addShape(pptx.ShapeType.line, { x: 0.7, y: 1.55, w: 11.9, h: 0, line: { color: BORDER, width: 1 } });
  s.addText(bulletLines(bullets), { x: 0.8, y: 1.75, w: 11.7, h: 3.4, valign: "top", fontFace: "Segoe UI" });
  let y = 5.3;
  if (cmd) {
    s.addText([{ text: "▶ ", options: { color: GREEN } }, { text: cmd, options: { color: "79C0FF" } }], {
      x: 0.8, y, w: 11.7, h: 0.5, fontSize: 14, fontFace: "Consolas", fill: { color: PANEL }, valign: "middle" });
    y += 0.65;
  }
  if (takeaway) {
    s.addText([{ text: "Takeaway  ", options: { bold: true, color: GREEN } }, { text: takeaway, options: { color: FG } }], {
      x: 0.8, y, w: 11.7, h: 0.6, fontSize: 15, italic: true, fontFace: "Segoe UI", valign: "middle" });
  }
  return s;
}

// ---- intro slides ----
for (const it of intro) {
  if (it.isLevers) {
    const s = pptx.addSlide({ masterName: "MAIN" });
    s.addText(it.title, { x: 0.7, y: 0.5, w: 12, h: 0.8, fontSize: 28, bold: true, color: BLUE, fontFace: "Segoe UI" });
    const rows = [[
      { text: "Lever", options: { bold: true, color: BLUE, fill: { color: PANEL } } },
      { text: "Demo module(s)", options: { bold: true, color: BLUE, fill: { color: PANEL } } },
    ]];
    for (const [l, d] of levers) rows.push([
      { text: l, options: { color: FG } },
      { text: d, options: { color: "79C0FF", fontFace: "Consolas", fontSize: 12 } },
    ]);
    s.addTable(rows, { x: 0.7, y: 1.5, w: 11.9, colW: [4.6, 7.3], border: { type: "solid", color: BORDER, pt: 1 },
      fontSize: 13, fontFace: "Segoe UI", valign: "middle", rowH: 0.42, fill: { color: BG }, color: FG });
    notes(s, it.notes);
  } else {
    const s = contentSlide({ title: it.title, bullets: it.bullets });
    notes(s, it.notes);
  }
}

// ---- module section divider ----
notes(sectionHeader("The 20 demos — one per lever, all measured"),
  "This is the heart of the workshop. We'll walk twenty demo modules. For each: the idea, the command to run it, and the measured takeaway. Run them live where you can; the offline fixtures are captured from the real tools, so the numbers hold either way.");

// ---- module slides ----
for (const m of modules) {
  const s = contentSlide({
    title: `Module ${m.n} — ${m.title}`,
    tag: `${m.lever}`,
    bullets: m.bullets,
    cmd: m.cmd,
    takeaway: m.takeaway,
  });
  notes(s, m.notes);
}

// ---- outro slides ----
for (const it of outro) {
  const s = contentSlide({ title: it.title, bullets: it.bullets });
  notes(s, it.notes);
}

await pptx.writeFile({ fileName: out });
const kb = (fs.statSync(out).size / 1024).toFixed(0);
console.log(`\n✔ Built ${out} (${kb} KB) · ${intro.length + modules.length + outro.length + 2} slides`);
