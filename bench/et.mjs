#!/usr/bin/env node
// et.mjs — compute Effective Tokens.  ET = m * (1.0*I + 0.1*C + 4.0*O)
// Usage: node et.mjs --input 12000 --output 800 [--cached 5000] [--model opus-4.8]
import { computeET, parseArgs, getModel } from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const input = Number(args.input || 0);
const cached = Number(args.cached || 0);
const output = Number(args.output || 0);
const modelId = args.model;

const r = computeET({ input, cached, output, modelId });
if (args.json) {
  console.log(JSON.stringify(r));
} else {
  const m = getModel(modelId);
  console.log(`model      : ${r.label} (m=${r.multiplier})`);
  console.log(`weights    : I=${m.etWeights.input}  C=${m.etWeights.cached}  O=${m.etWeights.output}`);
  console.log(`input      : ${input}`);
  console.log(`cached     : ${cached}`);
  console.log(`output     : ${output}`);
  console.log(`Effective Tokens (ET): ${r.et}`);
}
