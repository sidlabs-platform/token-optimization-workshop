// bench/lib.mjs — shared measurement primitives for the workshop harness.
// Pure ESM, no side effects on import. Windows/mac/Linux friendly.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

export const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, "..");
export const RESULTS_DIR = path.join(ROOT, "results");
export const RESULTS_CSV = path.join(__dirname, "results.csv");
export const USAGE_JSONL = path.join(__dirname, "token-usage.jsonl");

// ---------------------------------------------------------------------------
// Tokenizer: real tokenizer via gpt-tokenizer when available, else chars/4.
// ---------------------------------------------------------------------------
let _encode = null;
let _tokenizerName = "chars/4 (fallback)";

async function loadTokenizer() {
  if (_encode) return;
  try {
    const mod = await import("gpt-tokenizer");
    // gpt-tokenizer default export exposes `encode`.
    const enc = mod.encode || (mod.default && mod.default.encode);
    if (typeof enc === "function") {
      _encode = (text) => enc(text).length;
      _tokenizerName = "gpt-tokenizer (o200k_base)";
      return;
    }
  } catch {
    /* fall through to fallback */
  }
  _encode = (text) => Math.ceil(text.length / 4);
  _tokenizerName = "chars/4 (fallback)";
}

export async function countTokens(text) {
  await loadTokenizer();
  if (text == null) return 0;
  const s = typeof text === "string" ? text : String(text);
  if (s.length === 0) return 0;
  return _encode(s);
}

export async function tokenizerName() {
  await loadTokenizer();
  return _tokenizerName;
}

// ---------------------------------------------------------------------------
// Models / pricing
// ---------------------------------------------------------------------------
export function loadModels() {
  const p = path.join(ROOT, "models.json");
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

export function getModel(modelId) {
  const cfg = loadModels();
  const id = modelId || cfg.defaultModel;
  const m = cfg.models[id];
  if (!m) {
    const known = Object.keys(cfg.models).join(", ");
    throw new Error(`Unknown model "${id}". Known models: ${known}`);
  }
  return { id, ...m, etWeights: cfg.etWeights };
}

// ---------------------------------------------------------------------------
// Effective Tokens:  ET = m * (wI*I + wC*C + wO*O)
// ---------------------------------------------------------------------------
export function computeET({ input = 0, cached = 0, output = 0, modelId } = {}) {
  const m = getModel(modelId);
  const w = m.etWeights;
  const raw = w.input * input + w.cached * cached + w.output * output;
  return {
    modelId: m.id,
    label: m.label,
    multiplier: m.etMultiplier,
    input,
    cached,
    output,
    et: +(m.etMultiplier * raw).toFixed(2),
  };
}

// ---------------------------------------------------------------------------
// Cost:  USD given token counts. Handles long-context surcharge + cache.
// ---------------------------------------------------------------------------
export function computeCost({ input = 0, cached = 0, output = 0, modelId } = {}) {
  const m = getModel(modelId);
  let inPrice = m.price.input;
  let outPrice = m.price.output;
  const totalInput = input + cached;
  if (m.longContext && totalInput >= m.longContext.thresholdTokens) {
    inPrice = m.longContext.input;
    outPrice = m.longContext.output;
  }
  const disc = m.cachedInputDiscount ?? 0;
  const cachedPrice = inPrice * (1 - disc);
  const cost =
    (input / 1e6) * inPrice +
    (cached / 1e6) * cachedPrice +
    (output / 1e6) * outPrice;
  return {
    modelId: m.id,
    label: m.label,
    usd: +cost.toFixed(6),
    inPrice,
    outPrice,
    cachedPrice: +cachedPrice.toFixed(4),
    longContext: !!(m.longContext && totalInput >= m.longContext.thresholdTokens),
  };
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------
const CSV_HEADER =
  "timestamp,demo,scenario,model,raw_tokens,opt_tokens,delta_tokens,pct_saved,raw_et,opt_et,et_saved,raw_usd,opt_usd,usd_saved\n";

export function appendResult(row) {
  if (!fs.existsSync(RESULTS_CSV)) fs.writeFileSync(RESULTS_CSV, CSV_HEADER);
  const cols = [
    row.timestamp,
    csv(row.demo),
    csv(row.scenario),
    row.model,
    row.raw_tokens,
    row.opt_tokens,
    row.delta_tokens,
    row.pct_saved,
    row.raw_et,
    row.opt_et,
    row.et_saved,
    row.raw_usd,
    row.opt_usd,
    row.usd_saved,
  ];
  fs.appendFileSync(RESULTS_CSV, cols.join(",") + "\n");
}

export function appendUsage(obj) {
  fs.appendFileSync(USAGE_JSONL, JSON.stringify(obj) + "\n");
}

function csv(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function pct(rawN, optN) {
  if (rawN <= 0) return 0;
  return +(((rawN - optN) / rawN) * 100).toFixed(1);
}

export function fmtUsd(n) {
  if (n === 0) return "$0.000000";
  if (Math.abs(n) < 0.01) return "$" + n.toFixed(6);
  return "$" + n.toFixed(4);
}

// Read a payload from --file path or inline --text. Returns string.
export function readPayload({ file, text }) {
  if (text != null) return text;
  if (file) return fs.readFileSync(path.resolve(file), "utf8");
  return null;
}

// Minimal CLI arg parser:  --key value  and  --flag
export function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) {
        out[key] = true;
      } else {
        out[key] = next;
        i++;
      }
    } else {
      out._.push(a);
    }
  }
  return out;
}

// Run a shell command, capture stdout (best-effort). Used for live A/B.
export function runCapture(command) {
  try {
    return execSync(command, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], shell: true });
  } catch (e) {
    // Some tools exit non-zero but still emit useful stdout (e.g. tsc/lint).
    return (e.stdout || "") + (e.stderr || "");
  }
}
