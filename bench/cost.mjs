#!/usr/bin/env node
// cost.mjs — convert token counts to USD for any model in models.json.
// Usage: node cost.mjs --input 12000 --output 800 [--cached 5000] [--model gpt-5.5]
//        node cost.mjs --input 12000 --output 800 --all   (compare all models)
import { computeCost, computeET, parseArgs, loadModels, fmtUsd } from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const input = Number(args.input || 0);
const cached = Number(args.cached || 0);
const output = Number(args.output || 0);

if (args.all) {
  const cfg = loadModels();
  const rows = Object.keys(cfg.models).map((id) => {
    const c = computeCost({ input, cached, output, modelId: id });
    const e = computeET({ input, cached, output, modelId: id });
    return { model: c.label.padEnd(20), et: String(e.et).padStart(12), usd: fmtUsd(c.usd).padStart(14), lc: c.longContext ? " (long-ctx)" : "" };
  });
  console.log(`Tokens: input=${input} cached=${cached} output=${output}\n`);
  console.log("Model                            ET            USD");
  console.log("-".repeat(52));
  for (const r of rows) console.log(`${r.model} ${r.et} ${r.usd}${r.lc}`);
} else {
  const c = computeCost({ input, cached, output, modelId: args.model });
  const e = computeET({ input, cached, output, modelId: args.model });
  if (args.json) {
    console.log(JSON.stringify({ ...c, et: e.et }));
  } else {
    console.log(`model      : ${c.label}`);
    console.log(`in price   : $${c.inPrice}/1M   out price: $${c.outPrice}/1M   cached: $${c.cachedPrice}/1M`);
    console.log(`long-ctx   : ${c.longContext}`);
    console.log(`ET         : ${e.et}`);
    console.log(`cost       : ${fmtUsd(c.usd)}`);
  }
}
