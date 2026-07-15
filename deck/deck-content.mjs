// deck-content.mjs — single source of truth for the workshop deck.
// Consumed by build-pptx.mjs (PowerPoint) and build-talk-script.mjs (talk script md).
// Each module maps to a demo folder and carries speaker notes = the talk script.

export const meta = {
  title: "Token Optimization with GitHub Copilot",
  subtitle: "Cut token & cost burn on real repositories — 20 measured demos",
  footer: "Token Optimization Workshop · SentinelOps · measured live by bench/",
};

// The 11 levers from the token-optimization playbook (the detailed showcase site),
// mapped to the demo module(s) that make each one measurable.
export const levers = [
  ["1  Prompt compression", "07-prompt-compression, 04-caveman"],
  ["2  Choose the right language", "08-language-choice"],
  ["3  Manage your context", "05-context-engineering, 16-session-lifecycle"],
  ["4  Output control", "09-output-control"],
  ["5  Choose the right mode", "10-mode-selection"],
  ["6  Custom agents · skills · sub-agents", "11-custom-agents-skills, 17-subagents"],
  ["7  Choose the right model", "12-model-routing"],
  ["8  Manage your AGENTS file", "13-agents-file"],
  ["9  Clean up your tools (MCP)", "14-mcp-tools, 02-rtk"],
  ["10 Usage limits & overages", "19-usage-limits"],
  ["11 Power user guidance", "20-power-user, 15-reasoning-depth, 18-instruction-caching"],
];

// Front-matter narrative slides (before the module walk-through).
export const intro = [
  {
    title: "The promise",
    bullets: [
      "Spot the three token sinks in your own Copilot sessions",
      "Measure every change in tokens, Effective Tokens (ET), and dollars",
      "Apply all 11 playbook levers — each backed by a runnable, measured demo",
      "Prove 'same answer, fewer tokens' live via the GitHub Copilot CLI",
    ],
    notes:
      "Welcome. Over the next two hours we are not going to talk about token optimization in the abstract — we are going to measure it. By the end you'll be able to spot where tokens leak in your own sessions, put a number on every fix in tokens, Effective Tokens and dollars, and you'll have twenty runnable demos, one for every lever in the playbook. The rule for the whole session: no hand-waving. Every saving on these slides is produced live by the bench harness in this repo, never hard-coded.",
  },
  {
    title: "The 3 token sinks",
    bullets: [
      "Bloated system prompts — a 40-tool MCP server is 10–15 KB of schema EVERY turn",
      "Raw tool outputs — git diff, npm ls, tsc, test logs dumped verbatim",
      "Conversation history — re-read on every single turn; history is not free",
      "Rule of thumb: the model re-reads the ENTIRE context every turn",
    ],
    notes:
      "Before we optimize, know where the tokens actually go. There are three sinks. One: bloated system prompts — every MCP tool you enable injects its schema, and a forty-tool server is ten to fifteen kilobytes riding along on every turn. Two: raw tool output — people paste an entire git diff, npm ls, or test log straight into context. Three, and the biggest surprise for most teams: conversation history. The model re-reads the entire conversation on every single turn, so by turn thirty the history can be ninety percent of your bill. Keep that one sentence in mind for the whole workshop: the model re-reads everything, every turn. History is not free.",
  },
  {
    title: "The money slide — ET normalises everything",
    bullets: [
      "ET = m × (1.0·I + 0.1·C + 4.0·O)   m = Haiku 0.25 · Sonnet 1.0 · Opus 5.0",
      "Output is billed 4–8× input · cached input is ~90% off",
      "Same tokens on the wrong model = up to 20× the ET",
      "Live: node bench/cost.mjs --input 50000 --output 2000 --all",
    ],
    notes:
      "Raw token counts lie, because they hide two things: output is billed four to eight times input, and the model tier multiplies everything — Opus is twenty times the weight of Haiku. So we use one number, Effective Tokens. ET equals the model multiplier times input plus ten percent of cached input plus four times output. That single formula lets us compare a chatty Haiku turn against a lean Opus turn honestly, and bench/cost.mjs converts any ET delta straight to dollars from models.json. Two takeaways: shrinking output is worth roughly four times shrinking input, and picking the right model is often the single biggest win.",
  },
  {
    title: "The 11 levers → 20 demos",
    isLevers: true,
    notes:
      "Here's the map for the day. The playbook defines eleven levers. We've turned every one into at least one runnable demo — twenty in total. The left column is the lever; the right column is the demo folder that measures it. You don't have to adopt all eleven at once; even the first three — context discipline, output control, and model routing — typically recover the majority of the waste. We'll walk each one, run it, and read the real number off the screen.",
  },
];

// One entry per demo module. `n` is the agenda number; `lever` is the mapping tag.
export const modules = [
  {
    n: "01", id: "01-identifying-waste", title: "Identifying token waste",
    lever: "Baseline · the 3 sinks",
    bullets: [
      "Run a real task on SentinelOps: 'add a severity filter to the incidents table'",
      "Capture a baseline ET, then expose the waste",
      "900-line diff + 60-test log + npm ls dumps + unused MCP schemas",
      "Baseline context vs surgical minimum for the SAME task",
    ],
    cmd: "demos/01-identifying-waste/run.ps1",
    takeaway: "You can't optimize what you don't measure — establish the baseline first.",
    notes:
      "We start by finding the waste. Take an ordinary task — add a severity filter to the incidents table — and watch what a naive session drags in: a nine-hundred-line diff, sixty tests of verbose log, dependency dumps, and tool schemas nobody used. The demo measures that baseline context against the surgical minimum needed for the exact same task. This is the 'before' picture for everything that follows: you cannot optimize what you haven't measured.",
  },
  {
    n: "02", id: "02-rtk", title: "Tool output with RTK",
    lever: "Lever 9 · clean up tools",
    bullets: [
      "A/B every command: rtk git diff vs git diff, rtk vitest vs vitest, grep, tsc",
      "Wire RTK into Copilot with rtk init -g and re-run the baseline",
      "Raw tool output is a sink you pay for verbatim, every turn",
    ],
    cmd: "demos/02-rtk/run.ps1",
    takeaway: "−70–90% on raw tool output — validated.",
    notes:
      "The fastest win is compressing raw tool output. RTK — the Rust Token Killer — wraps commands like git diff, vitest, grep and tsc and strips them down to the signal. We A/B each command through the bench harness, then wire RTK into Copilot with rtk init dash g so it happens automatically. Expect seventy to ninety percent off the raw output. If RTK isn't installed the demo falls back to fixtures captured from the real tool, so the numbers are authentic either way.",
  },
  {
    n: "03", id: "03-graphify", title: "Large codebases with Graphify",
    lever: "Lever 3 · manage context",
    bullets: [
      "Task: 'explain the incident-ingestion flow'",
      "Blind: the agent reads many files → huge input",
      "Graphify: one budgeted query — /graphify query 'incident ingestion' --budget 1500",
      "Measure read-everything vs ask-the-graph",
    ],
    cmd: "demos/03-graphify/run.ps1",
    takeaway: "Ask a budgeted knowledge graph instead of dumping whole files.",
    notes:
      "On a large repo the blanket move — 'look at src' or hashtag-codebase — pulls entire files into context, and every token is re-billed on later turns. Graphify builds a knowledge graph of the codebase and answers a question with a token-budgeted query instead of raw file bodies. Same question — explain the incident-ingestion flow — but one budgeted query instead of reading twenty files. We measure read-everything versus ask-the-graph, and the delta is large.",
  },
  {
    n: "04", id: "04-caveman", title: "Output compression with Caveman",
    lever: "Levers 1 & 4 · compression",
    bullets: [
      "read-dedup: the same file read 3× → full once + tiny stubs (real Caveman engine)",
      "agent output: /caveman off (chatty) vs /caveman ultra (terse)",
      "Output carries the 4× ET weight — the highest-leverage tokens",
    ],
    cmd: "demos/04-caveman/run.ps1",
    takeaway: "read-dedup ≈61%; agent-output ≈85% ET — shrink what the agent generates and re-reads.",
    notes:
      "Caveman attacks the two most expensive habits: re-reading and rambling. Its read-deduplication cache returns a file in full the first time and a tiny stub on every repeat — this demo uses the real Caveman engine to produce that fixture. Then it compares chatty versus ultra output. Because output carries the four-times ET weight, terse generation is the single highest-leverage move. We measure roughly sixty-one percent off re-reads and about eighty-five percent ET off the output.",
  },
  {
    n: "05", id: "05-context-engineering", title: "Context engineering",
    lever: "Lever 3 · manage context",
    bullets: [
      "Bloated prose prompt → XML <context>/<task>/<constraints> + surgical context",
      "Add a memory file: .github/copilot-instructions.md",
      "Prune MCP tools / swap MCP data-fetch → gh CLI",
      "/clear every 15–20 msgs · /compact · cap thinking · route models",
    ],
    cmd: "demos/05-context-engineering/run.ps1",
    takeaway: "Structure the prompt, cache the stable prefix, prune the tools.",
    notes:
      "Context engineering is the discipline layer. We rewrite a bloated prose prompt into XML with explicit context, task and constraints blocks — the model parses structure faster and cheaper. We add a memory file so stable rules are written once. We prune MCP tools and swap live MCP data-fetch for a plain gh CLI call. And we practise hygiene: clear every fifteen to twenty messages, compact before switching focus, cap the thinking budget, route models. The demo measures the prose-to-XML rewrite and the MCP-to-gh swap directly.",
  },
  {
    n: "06", id: "06-challenge", title: "Advanced challenge + scoreboard",
    lever: "Stack everything",
    bullets: [
      "Real task with a pass/fail gate: implement alert dedup, make failing tests pass",
      "Combine ALL techniques while minimizing ET",
      "bench/report.mjs produces the live scoreboard and declares a winner",
    ],
    cmd: "demos/06-challenge/run.ps1 → results/RESULTS.md",
    takeaway: "Stack the levers; let the scoreboard prove the win.",
    notes:
      "The challenge ties it together. There's a real task with a deterministic gate — implement alert dedup and make the failing tests pass — and the goal is to do it while minimizing ET. You stack every lever you've learned. The report generator produces the live scoreboard from the recorded measurements and declares a winner. This is where the abstract idea 'optimize tokens' becomes a leaderboard.",
  },
  // ---- new modules ----
  {
    n: "07", id: "07-prompt-compression", title: "Prompt compression",
    lever: "Lever 1",
    bullets: [
      "caveman-speak: drop polite filler, keep technical terms exact — ~75% input off",
      "structured-input: prose spec → type signature / bullets — ~36% fewer tokens",
      "Three tiers: Lite (15–25%) · Full (30–50%, default) · Ultra (max, risk)",
    ],
    cmd: "demos/07-prompt-compression/run.ps1",
    takeaway: "Density beats politeness — same meaning, a quarter of the tokens.",
    notes:
      "Lever one: prompt compression. Conversational scaffolding — 'hey, could you please help me' — carries zero information but is billed at full rate. Caveman-speak strips the filler and keeps the technical terms exact; that alone is around seventy-five percent off the input. The second scenario shows structured input: the same API description as a type signature or bullet spec is about thirty-six percent smaller than prose, and the model understands it identically. Pick the compression tier that matches the risk — Full is the safe default, Ultra only when ambiguity is impossible.",
  },
  {
    n: "08", id: "08-language-choice", title: "Choose the right language",
    lever: "Lever 2",
    bullets: [
      "Intuition says Chinese is cheaper; the tokenizer heatmap says English wins",
      "Don't translate prompts to save tokens — overhead outweighs the per-word gain",
      "Gemini/Qwen best on non-English; Anthropic/Kimi most expensive",
    ],
    cmd: "demos/08-language-choice/run.ps1",
    takeaway: "Default prompt language: English — even if the team speaks another.",
    notes:
      "Lever two is counter-intuitive. People assume a language where each character carries more meaning must be cheaper, but the tokenizer heatmap across six models and nine languages shows English is cheapest in most cases. The demo shows the same instruction padded with a translated restatement versus concise English — English wins. So the practical rule for Copilot users: write your prompts in English, even if your team's spoken language is different. Don't translate to save tokens; the tokenizer overhead outweighs any per-word advantage.",
  },
  {
    n: "09", id: "09-output-control", title: "Output control",
    lever: "Lever 4",
    bullets: [
      "Output is billed 4–8× input — the most under-managed line item",
      "'Code only, no explanation' → 60–80% output saved",
      "Cap the shape: one sentence · 3 bullets · JSON only — set it once, forever",
    ],
    cmd: "demos/09-output-control/run.ps1",
    takeaway: "One rule in the instructions file caps every reply — permanent leverage.",
    notes:
      "Lever four is the highest-ROI instruction you'll ever write. Teams polish prompts to save pennies on input and then pay four to eight times for a verbose answer they never needed. One line — 'code only, no explanation' — cuts sixty to eighty percent of output. You can cap the shape instead: one sentence, three bullets, JSON only. The demo measures a chatty answer against a capped one using the four-times output weight. Write the rule once in copilot-instructions and every reply is short, forever. The one trade-off: when you're learning, ask for the explanation explicitly.",
  },
  {
    n: "10", id: "10-mode-selection", title: "Choose the right mode",
    lever: "Lever 5",
    bullets: [
      "Ask = 1 call · Plan = 1 call · Agent = 5–25 calls (15k–50k tokens)",
      "Most expensive mistake: vague prompt → Agent explores 20 steps → restarts",
      "Divide & conquer: Research → Plan → Implement, fresh context per phase",
    ],
    cmd: "demos/10-mode-selection/run.ps1",
    takeaway: "If you can't state success in one sentence, don't start Agent yet.",
    notes:
      "Lever five: match the mode to the job. Ask is one call for a lookup. Plan is one call to design. Agent is five to twenty-five calls for a big job — and that's where money burns. The most expensive mistake in the platform is starting Agent with a vague prompt: it explores twenty steps, realises it misunderstood, and starts over. The demo contrasts that bloated single session with a phased Research-Plan-Implement flow that uses a fresh context window per phase. Simple rule: if you can't state the success criteria in one sentence, use Ask or Plan first — then switch to Agent to execute.",
  },
  {
    n: "11", id: "11-custom-agents-skills", title: "Custom agents · skills · sub-agents",
    lever: "Lever 6",
    bullets: [
      "Custom agents lock a role and trim the tools it can touch",
      "Skills are lazy-loaded — only the description rides along until matched",
      "Sub-agents keep the main session lean (a second context window)",
    ],
    cmd: "demos/11-custom-agents-skills/run.ps1",
    takeaway: "Pick the right container: role-lock, lazy-load, or isolate.",
    notes:
      "Lever six is about containers for the work. A custom agent forces a role and trims tools — if you only want it to read a GitHub issue, don't give it the write tool. Skills are markdown that's lazy-loaded: only the short description sits in context until the model detects a matching task and asks for the full skill. The demo compares one giant always-on instructions blob against a lean persistent instruction plus a lazy-loaded skill. And sub-agents — which we measure separately in demo seventeen — open a second context window so discovery work never clogs the main session.",
  },
  {
    n: "12", id: "12-model-routing", title: "Choose the right model",
    lever: "Lever 7",
    bullets: [
      "30 turns: all-Opus 50 units · all-Sonnet 30 · mixed ~22.8",
      "Plan with the big model, build with the small one, look up with mini",
      "Default to Auto Mode (~10% token-multiplier discount)",
    ],
    cmd: "demos/12-model-routing/run.ps1",
    takeaway: "Right model, right job — the picker is a cost lever, not a ritual.",
    notes:
      "Lever seven: model routing, often the single biggest win. Opus is about one-point-seven times the price of Sonnet on Copilot. Over thirty turns, all-Opus is fifty cost units, all-Sonnet thirty, but a mixed strategy — Opus to plan, Sonnet to build, mini for lookups — lands at about twenty-three. Let the expensive model think and the cheap model type. Set Auto Mode as the org default; it routes each turn to the best fit and earns roughly a ten percent discount. Promote to a frontier model by hand only when the task is worth the premium.",
  },
  {
    n: "13", id: "13-agents-file", title: "Manage your AGENTS file",
    lever: "Lever 8",
    bullets: [
      "ETH-Zurich, 47 projects: LLM-written AGENTS files → −2% correctness, +20–23% cost",
      "Keep landmines: 'use uv not pip', 'deploy needs VPN', 'don't touch auth'",
      "Delete anything the agent can read from the repo itself",
    ],
    cmd: "demos/13-agents-file/run.ps1",
    takeaway: "Landmines, not encyclopedias — manage it like a bug tracker.",
    notes:
      "Lever eight: your AGENTS file. Most teams run slash-init and ship the auto-generated file. A study of forty-seven projects found that made things worse — correctness fell two percent and token cost climbed twenty to twenty-three percent, because the file restates things the agent can already read from the code. Keep only the landmines: use uv not pip, deploy needs VPN, don't touch auth right now. Delete the project description and anything discoverable in the repo. Manage it like a bug tracker, not a wiki — the Copilot CLI team throws theirs away every three months.",
  },
  {
    n: "14", id: "14-mcp-tools", title: "Clean up your tools (MCP)",
    lever: "Lever 9",
    bullets: [
      "Every enabled tool's schema re-sends on every agent step",
      "188 tools × 30 steps = 330,000 tokens of schema alone",
      "A real audit: 188 → 52 tools (−72%), ~650k tokens saved/day",
    ],
    cmd: "demos/14-mcp-tools/run.ps1",
    takeaway: "Tools should be enabled, not accumulated — configure per workspace.",
    notes:
      "Lever nine: the MCP schema tax. Every tool you enable injects its schema, and — this is the trap — it re-sends on every autonomous step, not just at startup. With a hundred and eighty-eight tools, a thirty-step run carries three hundred thirty thousand tokens of schema before doing any work. One real audit checked actual usage: Slack eight percent, dropped; Jira two percent, dropped; database tools across five environments, kept production only. Result: a hundred eighty-eight down to fifty-two tools, seventy-two percent fewer, about six hundred fifty thousand tokens saved a day. Configure MCP per workspace, never globally.",
  },
  {
    n: "15", id: "15-reasoning-depth", title: "Reasoning-depth control",
    lever: "Lever 11 · reasoning",
    bullets: [
      "The thinking trace is billed as OUTPUT — the most expensive tokens",
      "HIGH = 5k–20k thinking tokens; MAX up to 64k — on a typo",
      "Default to MEDIUM; decompose one HIGH task into 3–5 MEDIUM steps",
    ],
    cmd: "demos/15-reasoning-depth/run.ps1",
    takeaway: "Pay for the thinking the task actually needs.",
    notes:
      "Reasoning-depth control. Reasoning models emit an invisible chain-of-thought before the visible answer, and it's metered as output — the priciest token type. Leaving effort on HIGH 'just in case' can burn thousands of thinking tokens on a trivial task; MAX reasoning on a typo can cost eighty times a LOW call. The demo compares a HIGH-effort verbose trace with a MEDIUM concise one using the output weight. Default the floor to MEDIUM org-wide, cap with a phrase like 'think briefly', and decompose one hard task into three-to-five medium steps — lower cost and higher quality.",
  },
  {
    n: "16", id: "16-session-lifecycle", title: "Session lifecycle & compaction",
    lever: "Lever 3 · sessions",
    bullets: [
      "By turn 30, conversation history can be ~90% of the bill",
      "One task = one session — the cheapest habit on the platform",
      "/compact <focus> proactively at ~70% window, not after it's full",
    ],
    cmd: "demos/16-session-lifecycle/run.ps1",
    takeaway: "Treat sessions as disposable, not as diaries — reset, don't compound.",
    notes:
      "Session lifecycle. History is re-sent every turn and grows linearly, so a fifty-thousand-token session over forty turns sends around two million input tokens even if the last prompt was twenty words. The demo contrasts a sprawling forty-turn session that mixes four unrelated tasks with a compacted, single-task summary. Two habits: one task equals one session — start fresh per unrelated task — and compact proactively at about seventy percent of the window, before auto-compaction fires late and costs you anyway. If you can't summarize the session in a sentence, compact or fork.",
  },
  {
    n: "17", id: "17-subagents", title: "Subagents — the compression boundary",
    lever: "Lever 6 · sub-agents",
    bullets: [
      "Flat session: discovery lands in the parent, re-billed every turn (quadratic)",
      "Subagent reads N files in isolation, returns a ~1k-token digest",
      "Coordinator → worker → reviewer handoff keeps the parent lean",
    ],
    cmd: "demos/17-subagents/run.ps1",
    takeaway: "~10× parent input reduction — the parent only sees the summary.",
    notes:
      "Sub-agents are a compression boundary. In a flat session, discovery — reading twenty files, parsing logs — lands in the parent context and is re-billed on every later turn, so cost grows quadratically. A sub-agent does that work in an isolated context and returns a small digest; the parent reasons over roughly a thousand tokens instead of twenty thousand. The demo measures about a ten-times reduction in parent input. Pattern: coordinator plans, worker implements, reviewer checks — each in its own window. It costs some tokens in the sub-agent, so it's a conditional optimization, but for research it pays off handsomely.",
  },
  {
    n: "18", id: "18-instruction-caching", title: "Instruction engineering & caching",
    lever: "Lever 11 · caching",
    bullets: [
      "A byte-identical prefix earns the ~90% cached-token discount every turn",
      "Reordering a section or adding a timestamp invalidates the whole cache",
      "Tier it: always-on · path-scoped (applyTo:) · on-demand skills",
    ],
    cmd: "demos/18-instruction-caching/run.ps1",
    takeaway: "Instructions are paid once; engineer the prefix for cache stability.",
    notes:
      "Instruction caching. Your copilot-instructions file is re-sent every turn — at full rate it's a recurring tax, but a byte-identical prefix earns the roughly ninety-percent cached discount on every later turn. The catch: any change near the top — a timestamp, a ticket ID, a reordered section — busts the whole cache. The demo shows an unstable prefix versus a stable one with volatile bits moved to the end and area-specific rules split into applyTo-scoped files that only load when matched. Keep the always-on file under about two hundred lines and put dates and ticket IDs last, never first.",
  },
  {
    n: "19", id: "19-usage-limits", title: "Usage limits & overages",
    lever: "Lever 10",
    bullets: [
      "The last lever is about the meter, not the tokens",
      "Set overage caps; know which actions count against entitlement",
      "Healthy overage ratio 10–15% vs 30%+ uncontrolled",
    ],
    cmd: "demos/19-usage-limits/run.ps1",
    takeaway: "Cap the bill before the bill caps you.",
    notes:
      "Lever ten steps back from tokens to the meter itself. Set overage caps, understand which actions count against your entitlement, and watch the overage ratio — a healthy team runs ten to fifteen percent overage; uncontrolled teams blow past thirty. The demo contrasts an ungoverned session that ignores budget and reloads context against a governed setup with caps and Auto mode. This is the governance wrapper around everything else: the technical levers reduce spend, and usage limits make sure a runaway agent can't surprise you at month-end.",
  },
  {
    n: "20", id: "20-power-user", title: "Power user guidance",
    lever: "Lever 11",
    bullets: [
      "Think in code — script the analysis instead of feeding raw context",
      "Trim shell output before sending; collapse repeated tool calls",
      "Consider CLIs vs MCPs; run usage diagnostics regularly",
    ],
    cmd: "demos/20-power-user/run.ps1",
    takeaway: "Adopt selectively where telemetry shows recurring high-cost patterns.",
    notes:
      "The last module is for teams already running the fundamentals. These are conditional, trade-off-laden patterns: think in code — write a script to analyze files instead of dumping them into context; trim long shell output before it reaches the model; collapse repeated tool calls; prefer CLIs over broad MCP catalogs where schema overhead dominates; and run usage diagnostics regularly to find drift. The demo measures trimming a raw tool dump. These aren't mandatory — adopt them where your telemetry shows a recurring high-cost pattern.",
  },
];

export const outro = [
  {
    title: "Context-hygiene checklist",
    bullets: [
      "/clear at 15–20 msgs · edit, don't follow-up · surgical edits · outline-first",
      "/compact before switching focus · cap the thinking budget · route models",
      "Prune unused MCP tools · replace MCP data-fetch with gh CLI",
      "Front-load stable content for caching (~90% off) · log state to SQLite, not the prompt",
    ],
    notes:
      "Here's the one-card checklist to take back to your desk. Clear every fifteen to twenty messages. Edit a previous message instead of piling on follow-ups. Make surgical edits and outline before you build. Compact before switching focus and cap the thinking budget. Route models deliberately. Prune MCP tools and swap live data-fetch for the gh CLI. Front-load the stable content so it caches at ninety percent off. And log state to SQLite, not into the prompt. None of this is exotic — it's hygiene, and it compounds.",
  },
  {
    title: "Live scoreboard + references",
    bullets: [
      "node bench/report.mjs — regenerates results/RESULTS.md",
      "scripts/verify-all.ps1 — runs every demo, asserts a positive saving",
      "References: GitHub Blog · MindStudio · Tetrate · Apex Hours",
      "Measure. Optimize. Verify. Repeat.",
    ],
    notes:
      "To close: everything here is reproducible. Run bench report to regenerate the scoreboard, and run verify-all to execute every one of the twenty demos and assert each still produces a positive, measured saving — if a demo ever stops saving tokens, the build fails. The research percentages come from the GitHub blog, MindStudio, Tetrate and Apex Hours, but the numbers on your screen are what this repo actually measured on your machine. The whole philosophy in four words: measure, optimize, verify, repeat. Thank you.",
  },
];
