#!/usr/bin/env node
// selftest.mjs — sanity check the harness math without any external tools.
import assert from "node:assert";
import { countTokens, computeET, computeCost, tokenizerName } from "./lib.mjs";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`✔ ${name}`); }
  catch (e) { failures++; console.error(`✖ ${name}\n   ${e.message}`); }
}

// ET: Opus m=5, input=100, output=10 => 5*(100 + 40) = 700
check("ET opus math", () => {
  const r = computeET({ input: 100, output: 10, modelId: "opus-4.8" });
  assert.strictEqual(r.et, 700);
});
// ET: cached weighting. input=0 cached=100 => sonnet m=1 * (0.1*100)=10
check("ET cached weighting", () => {
  const r = computeET({ cached: 100, modelId: "sonnet-4.6" });
  assert.strictEqual(r.et, 10);
});
// Cost: opus input 1M => $5
check("cost opus input 1M", () => {
  const c = computeCost({ input: 1_000_000, modelId: "opus-4.8" });
  assert.strictEqual(c.usd, 5);
});
// Cost: gpt-5.5 long-context surcharge kicks in >=200k input
check("gpt-5.5 long-context surcharge", () => {
  const lo = computeCost({ input: 100_000, output: 0, modelId: "gpt-5.5" });
  const hi = computeCost({ input: 250_000, output: 0, modelId: "gpt-5.5" });
  assert.strictEqual(lo.inPrice, 5);
  assert.strictEqual(hi.inPrice, 10);
  assert.ok(hi.longContext === true && lo.longContext === false);
});
// Cost: cached input ~90% off
check("cached 90% discount", () => {
  const c = computeCost({ cached: 1_000_000, modelId: "opus-4.8" });
  assert.strictEqual(c.usd, 0.5); // 10% of $5
});
// Tokenizer counts something reasonable
check("tokenizer counts", async () => {
  const n = await countTokens("The quick brown fox jumps over the lazy dog.");
  assert.ok(n > 3 && n < 30, `got ${n}`);
});

console.log(`\ntokenizer: ${await tokenizerName()}`);
console.log(failures ? `\n${failures} FAILED` : `\nAll harness self-tests passed.`);
process.exit(failures ? 1 : 0);
