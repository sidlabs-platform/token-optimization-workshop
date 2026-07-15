#!/usr/bin/env node
// token-count.mjs — count tokens for a file or inline text.
// Usage: node token-count.mjs --file path [--model opus-4.8]
//        node token-count.mjs --text "hello world"
import { countTokens, tokenizerName, parseArgs, readPayload } from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const payload = readPayload({ file: args.file, text: args.text });
if (payload == null) {
  console.error("Usage: node token-count.mjs --file <path> | --text <string>");
  process.exit(2);
}
const tokens = await countTokens(payload);
if (args.json) {
  console.log(JSON.stringify({ tokens, chars: payload.length, tokenizer: await tokenizerName() }));
} else {
  console.log(`tokenizer : ${await tokenizerName()}`);
  console.log(`chars     : ${payload.length}`);
  console.log(`tokens    : ${tokens}`);
}
