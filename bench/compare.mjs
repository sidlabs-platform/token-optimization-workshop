#!/usr/bin/env node
// compare.mjs — measure RAW vs OPTIMIZED payloads/commands and record the saving.
//
// Sources (pick one per side):
//   --raw-file <p>   --opt-file <p>        read payload from file
//   --raw-cmd  <c>   --opt-cmd  <c>        run shell command, measure its stdout
//   --raw-text <s>   --opt-text <s>        inline text
//
// Options:
//   --demo <name> --scenario <name> --model <id>
//   --raw-output <n> --opt-output <n>   output tokens to attribute (default 0)
//   --cached <n>                        cached input tokens (applied to opt side)
//   --no-record                         do not append to results.csv / jsonl
//   --json                              machine-readable output
//
// The measured payload is treated as INPUT tokens (context fed to the model).
import {
  countTokens, computeET, computeCost, tokenizerName,
  parseArgs, appendResult, appendUsage, pct, fmtUsd, runCapture, getModel,
} from "./lib.mjs";
import fs from "node:fs";
import path from "node:path";

const args = parseArgs(process.argv.slice(2));

function resolveSide(prefix) {
  if (args[`${prefix}-file`]) return fs.readFileSync(path.resolve(args[`${prefix}-file`]), "utf8");
  if (args[`${prefix}-cmd`]) return runCapture(args[`${prefix}-cmd`]);
  if (args[`${prefix}-text`] != null) return String(args[`${prefix}-text`]);
  return null;
}

const rawPayload = resolveSide("raw");
const optPayload = resolveSide("opt");
if (rawPayload == null || optPayload == null) {
  console.error("compare.mjs: need both a raw source and an opt source (see --help in file header).");
  process.exit(2);
}

const modelId = args.model || getModel().id;
const rawOut = Number(args["raw-output"] || 0);
const optOut = Number(args["opt-output"] || 0);
const cached = Number(args.cached || 0);

const rawTokens = await countTokens(rawPayload);
const optTokens = await countTokens(optPayload);
const delta = rawTokens - optTokens;
const pctSaved = pct(rawTokens, optTokens);

// By default measured payload = INPUT (context fed in). --as-output attributes it
// to OUTPUT instead (agent-generated text), which carries the 4x ET weight.
const asOutput = !!args["as-output"];
const rawInput = asOutput ? 0 : rawTokens;
const optInput = asOutput ? 0 : optTokens;
const rawOutput = asOutput ? rawTokens + rawOut : rawOut;
const optOutput = asOutput ? optTokens + optOut : optOut;

const rawET = computeET({ input: rawInput, output: rawOutput, modelId }).et;
const optET = computeET({ input: optInput, cached, output: optOutput, modelId }).et;
const rawCost = computeCost({ input: rawInput, output: rawOutput, modelId }).usd;
const optCost = computeCost({ input: optInput, cached, output: optOutput, modelId }).usd;

const demo = args.demo || "adhoc";
const scenario = args.scenario || "compare";
const timestamp = new Date().toISOString();

const record = {
  timestamp, demo, scenario, model: modelId,
  raw_tokens: rawTokens, opt_tokens: optTokens,
  delta_tokens: delta, pct_saved: pctSaved,
  raw_et: rawET, opt_et: optET, et_saved: +(rawET - optET).toFixed(2),
  raw_usd: rawCost, opt_usd: optCost, usd_saved: +(rawCost - optCost).toFixed(6),
};

if (!args["no-record"]) {
  appendResult(record);
  appendUsage({ ...record, tokenizer: await tokenizerName() });
}

if (args.json) {
  console.log(JSON.stringify(record));
} else {
  const model = getModel(modelId);
  console.log(`\n== ${demo} / ${scenario} ==`);
  console.log(`tokenizer : ${await tokenizerName()}`);
  console.log(`model     : ${model.label}\n`);
  const pad = (l, v) => `${l.padEnd(12)} ${String(v).padStart(12)}`;
  console.log("                     RAW      OPTIMIZED");
  console.log(`tokens        ${String(rawTokens).padStart(10)}   ${String(optTokens).padStart(10)}`);
  console.log(`ET            ${String(rawET).padStart(10)}   ${String(optET).padStart(10)}`);
  console.log(`cost          ${fmtUsd(rawCost).padStart(10)}   ${fmtUsd(optCost).padStart(10)}`);
  console.log("-".repeat(40));
  console.log(`Δ tokens  : ${delta}  (${pctSaved}% saved)`);
  console.log(`Δ ET      : ${record.et_saved}`);
  console.log(`Δ cost    : ${fmtUsd(record.usd_saved)}`);
  if (pctSaved > 0) console.log(`\n✔ SAVING CONFIRMED: ${pctSaved}% fewer tokens`);
  else console.log(`\n✖ no saving (${pctSaved}%)`);
}

// Non-zero exit if there was no positive saving (used by verify-all asserts).
if (!args["allow-negative"] && pctSaved <= 0) process.exit(1);
