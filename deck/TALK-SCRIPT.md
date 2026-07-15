# Token Optimization with GitHub Copilot — Talk Script

> Speaker notes for **token-optimization.pptx** (28 slides).
> Generated from `deck-content.mjs` — edit content there, then `node deck/build-talk-script.mjs`.

## Slide 1 — Title
Title slide. Introduce yourself and set the frame: hands-on, measured, ~80% live demos. Every number comes from the bench harness — nothing is invented.

## Slide 2 — The promise
Welcome. Over the next two hours we are not going to talk about token optimization in the abstract — we are going to measure it. By the end you'll be able to spot where tokens leak in your own sessions, put a number on every fix in tokens, Effective Tokens and dollars, and you'll have twenty runnable demos, one for every lever in the playbook. The rule for the whole session: no hand-waving. Every saving on these slides is produced live by the bench harness in this repo, never hard-coded.

## Slide 3 — The 3 token sinks
Before we optimize, know where the tokens actually go. There are three sinks. One: bloated system prompts — every MCP tool you enable injects its schema, and a forty-tool server is ten to fifteen kilobytes riding along on every turn. Two: raw tool output — people paste an entire git diff, npm ls, or test log straight into context. Three, and the biggest surprise for most teams: conversation history. The model re-reads the entire conversation on every single turn, so by turn thirty the history can be ninety percent of your bill. Keep that one sentence in mind for the whole workshop: the model re-reads everything, every turn. History is not free.

## Slide 4 — The money slide — ET normalises everything
Raw token counts lie, because they hide two things: output is billed four to eight times input, and the model tier multiplies everything — Opus is twenty times the weight of Haiku. So we use one number, Effective Tokens. ET equals the model multiplier times input plus ten percent of cached input plus four times output. That single formula lets us compare a chatty Haiku turn against a lean Opus turn honestly, and bench/cost.mjs converts any ET delta straight to dollars from models.json. Two takeaways: shrinking output is worth roughly four times shrinking input, and picking the right model is often the single biggest win.

## Slide 5 — The 11 levers → 20 demos
Here's the map for the day. The playbook defines eleven levers. We've turned every one into at least one runnable demo — twenty in total. The left column is the lever; the right column is the demo folder that measures it. You don't have to adopt all eleven at once; even the first three — context discipline, output control, and model routing — typically recover the majority of the waste. We'll walk each one, run it, and read the real number off the screen.

| Lever | Demo module(s) |
|---|---|
| 1  Prompt compression | `07-prompt-compression, 04-caveman` |
| 2  Choose the right language | `08-language-choice` |
| 3  Manage your context | `05-context-engineering, 16-session-lifecycle` |
| 4  Output control | `09-output-control` |
| 5  Choose the right mode | `10-mode-selection` |
| 6  Custom agents · skills · sub-agents | `11-custom-agents-skills, 17-subagents` |
| 7  Choose the right model | `12-model-routing` |
| 8  Manage your AGENTS file | `13-agents-file` |
| 9  Clean up your tools (MCP) | `14-mcp-tools, 02-rtk` |
| 10 Usage limits & overages | `19-usage-limits` |
| 11 Power user guidance | `20-power-user, 15-reasoning-depth, 18-instruction-caching` |

## Slide 6 — Section: The 20 demos
Section divider. This is the heart of the workshop — twenty modules, one per lever, all measured.

## Slide 7 — Module 01: Identifying token waste  _(Baseline · the 3 sinks)_
We start by finding the waste. Take an ordinary task — add a severity filter to the incidents table — and watch what a naive session drags in: a nine-hundred-line diff, sixty tests of verbose log, dependency dumps, and tool schemas nobody used. The demo measures that baseline context against the surgical minimum needed for the exact same task. This is the 'before' picture for everything that follows: you cannot optimize what you haven't measured.

**Run:** `demos/01-identifying-waste/run.ps1`  ·  **Takeaway:** You can't optimize what you don't measure — establish the baseline first.

## Slide 8 — Module 02: Tool output with RTK  _(Lever 9 · clean up tools)_
The fastest win is compressing raw tool output. RTK — the Rust Token Killer — wraps commands like git diff, vitest, grep and tsc and strips them down to the signal. We A/B each command through the bench harness, then wire RTK into Copilot with rtk init dash g so it happens automatically. Expect seventy to ninety percent off the raw output. If RTK isn't installed the demo falls back to fixtures captured from the real tool, so the numbers are authentic either way.

**Run:** `demos/02-rtk/run.ps1`  ·  **Takeaway:** −70–90% on raw tool output — validated.

## Slide 9 — Module 03: Large codebases with Graphify  _(Lever 3 · manage context)_
On a large repo the blanket move — 'look at src' or hashtag-codebase — pulls entire files into context, and every token is re-billed on later turns. Graphify builds a knowledge graph of the codebase and answers a question with a token-budgeted query instead of raw file bodies. Same question — explain the incident-ingestion flow — but one budgeted query instead of reading twenty files. We measure read-everything versus ask-the-graph, and the delta is large.

**Run:** `demos/03-graphify/run.ps1`  ·  **Takeaway:** Ask a budgeted knowledge graph instead of dumping whole files.

## Slide 10 — Module 04: Output compression with Caveman  _(Levers 1 & 4 · compression)_
Caveman attacks the two most expensive habits: re-reading and rambling. Its read-deduplication cache returns a file in full the first time and a tiny stub on every repeat — this demo uses the real Caveman engine to produce that fixture. Then it compares chatty versus ultra output. Because output carries the four-times ET weight, terse generation is the single highest-leverage move. We measure roughly sixty-one percent off re-reads and about eighty-five percent ET off the output.

**Run:** `demos/04-caveman/run.ps1`  ·  **Takeaway:** read-dedup ≈61%; agent-output ≈85% ET — shrink what the agent generates and re-reads.

## Slide 11 — Module 05: Context engineering  _(Lever 3 · manage context)_
Context engineering is the discipline layer. We rewrite a bloated prose prompt into XML with explicit context, task and constraints blocks — the model parses structure faster and cheaper. We add a memory file so stable rules are written once. We prune MCP tools and swap live MCP data-fetch for a plain gh CLI call. And we practise hygiene: clear every fifteen to twenty messages, compact before switching focus, cap the thinking budget, route models. The demo measures the prose-to-XML rewrite and the MCP-to-gh swap directly.

**Run:** `demos/05-context-engineering/run.ps1`  ·  **Takeaway:** Structure the prompt, cache the stable prefix, prune the tools.

## Slide 12 — Module 06: Advanced challenge + scoreboard  _(Stack everything)_
The challenge ties it together. There's a real task with a deterministic gate — implement alert dedup and make the failing tests pass — and the goal is to do it while minimizing ET. You stack every lever you've learned. The report generator produces the live scoreboard from the recorded measurements and declares a winner. This is where the abstract idea 'optimize tokens' becomes a leaderboard.

**Run:** `demos/06-challenge/run.ps1 → results/RESULTS.md`  ·  **Takeaway:** Stack the levers; let the scoreboard prove the win.

## Slide 13 — Module 07: Prompt compression  _(Lever 1)_
Lever one: prompt compression. Conversational scaffolding — 'hey, could you please help me' — carries zero information but is billed at full rate. Caveman-speak strips the filler and keeps the technical terms exact; that alone is around seventy-five percent off the input. The second scenario shows structured input: the same API description as a type signature or bullet spec is about thirty-six percent smaller than prose, and the model understands it identically. Pick the compression tier that matches the risk — Full is the safe default, Ultra only when ambiguity is impossible.

**Run:** `demos/07-prompt-compression/run.ps1`  ·  **Takeaway:** Density beats politeness — same meaning, a quarter of the tokens.

## Slide 14 — Module 08: Choose the right language  _(Lever 2)_
Lever two is counter-intuitive. People assume a language where each character carries more meaning must be cheaper, but the tokenizer heatmap across six models and nine languages shows English is cheapest in most cases. The demo shows the same instruction padded with a translated restatement versus concise English — English wins. So the practical rule for Copilot users: write your prompts in English, even if your team's spoken language is different. Don't translate to save tokens; the tokenizer overhead outweighs any per-word advantage.

**Run:** `demos/08-language-choice/run.ps1`  ·  **Takeaway:** Default prompt language: English — even if the team speaks another.

## Slide 15 — Module 09: Output control  _(Lever 4)_
Lever four is the highest-ROI instruction you'll ever write. Teams polish prompts to save pennies on input and then pay four to eight times for a verbose answer they never needed. One line — 'code only, no explanation' — cuts sixty to eighty percent of output. You can cap the shape instead: one sentence, three bullets, JSON only. The demo measures a chatty answer against a capped one using the four-times output weight. Write the rule once in copilot-instructions and every reply is short, forever. The one trade-off: when you're learning, ask for the explanation explicitly.

**Run:** `demos/09-output-control/run.ps1`  ·  **Takeaway:** One rule in the instructions file caps every reply — permanent leverage.

## Slide 16 — Module 10: Choose the right mode  _(Lever 5)_
Lever five: match the mode to the job. Ask is one call for a lookup. Plan is one call to design. Agent is five to twenty-five calls for a big job — and that's where money burns. The most expensive mistake in the platform is starting Agent with a vague prompt: it explores twenty steps, realises it misunderstood, and starts over. The demo contrasts that bloated single session with a phased Research-Plan-Implement flow that uses a fresh context window per phase. Simple rule: if you can't state the success criteria in one sentence, use Ask or Plan first — then switch to Agent to execute.

**Run:** `demos/10-mode-selection/run.ps1`  ·  **Takeaway:** If you can't state success in one sentence, don't start Agent yet.

## Slide 17 — Module 11: Custom agents · skills · sub-agents  _(Lever 6)_
Lever six is about containers for the work. A custom agent forces a role and trims tools — if you only want it to read a GitHub issue, don't give it the write tool. Skills are markdown that's lazy-loaded: only the short description sits in context until the model detects a matching task and asks for the full skill. The demo compares one giant always-on instructions blob against a lean persistent instruction plus a lazy-loaded skill. And sub-agents — which we measure separately in demo seventeen — open a second context window so discovery work never clogs the main session.

**Run:** `demos/11-custom-agents-skills/run.ps1`  ·  **Takeaway:** Pick the right container: role-lock, lazy-load, or isolate.

## Slide 18 — Module 12: Choose the right model  _(Lever 7)_
Lever seven: model routing, often the single biggest win. Opus is about one-point-seven times the price of Sonnet on Copilot. Over thirty turns, all-Opus is fifty cost units, all-Sonnet thirty, but a mixed strategy — Opus to plan, Sonnet to build, mini for lookups — lands at about twenty-three. Let the expensive model think and the cheap model type. Set Auto Mode as the org default; it routes each turn to the best fit and earns roughly a ten percent discount. Promote to a frontier model by hand only when the task is worth the premium.

**Run:** `demos/12-model-routing/run.ps1`  ·  **Takeaway:** Right model, right job — the picker is a cost lever, not a ritual.

## Slide 19 — Module 13: Manage your AGENTS file  _(Lever 8)_
Lever eight: your AGENTS file. Most teams run slash-init and ship the auto-generated file. A study of forty-seven projects found that made things worse — correctness fell two percent and token cost climbed twenty to twenty-three percent, because the file restates things the agent can already read from the code. Keep only the landmines: use uv not pip, deploy needs VPN, don't touch auth right now. Delete the project description and anything discoverable in the repo. Manage it like a bug tracker, not a wiki — the Copilot CLI team throws theirs away every three months.

**Run:** `demos/13-agents-file/run.ps1`  ·  **Takeaway:** Landmines, not encyclopedias — manage it like a bug tracker.

## Slide 20 — Module 14: Clean up your tools (MCP)  _(Lever 9)_
Lever nine: the MCP schema tax. Every tool you enable injects its schema, and — this is the trap — it re-sends on every autonomous step, not just at startup. With a hundred and eighty-eight tools, a thirty-step run carries three hundred thirty thousand tokens of schema before doing any work. One real audit checked actual usage: Slack eight percent, dropped; Jira two percent, dropped; database tools across five environments, kept production only. Result: a hundred eighty-eight down to fifty-two tools, seventy-two percent fewer, about six hundred fifty thousand tokens saved a day. Configure MCP per workspace, never globally.

**Run:** `demos/14-mcp-tools/run.ps1`  ·  **Takeaway:** Tools should be enabled, not accumulated — configure per workspace.

## Slide 21 — Module 15: Reasoning-depth control  _(Lever 11 · reasoning)_
Reasoning-depth control. Reasoning models emit an invisible chain-of-thought before the visible answer, and it's metered as output — the priciest token type. Leaving effort on HIGH 'just in case' can burn thousands of thinking tokens on a trivial task; MAX reasoning on a typo can cost eighty times a LOW call. The demo compares a HIGH-effort verbose trace with a MEDIUM concise one using the output weight. Default the floor to MEDIUM org-wide, cap with a phrase like 'think briefly', and decompose one hard task into three-to-five medium steps — lower cost and higher quality.

**Run:** `demos/15-reasoning-depth/run.ps1`  ·  **Takeaway:** Pay for the thinking the task actually needs.

## Slide 22 — Module 16: Session lifecycle & compaction  _(Lever 3 · sessions)_
Session lifecycle. History is re-sent every turn and grows linearly, so a fifty-thousand-token session over forty turns sends around two million input tokens even if the last prompt was twenty words. The demo contrasts a sprawling forty-turn session that mixes four unrelated tasks with a compacted, single-task summary. Two habits: one task equals one session — start fresh per unrelated task — and compact proactively at about seventy percent of the window, before auto-compaction fires late and costs you anyway. If you can't summarize the session in a sentence, compact or fork.

**Run:** `demos/16-session-lifecycle/run.ps1`  ·  **Takeaway:** Treat sessions as disposable, not as diaries — reset, don't compound.

## Slide 23 — Module 17: Subagents — the compression boundary  _(Lever 6 · sub-agents)_
Sub-agents are a compression boundary. In a flat session, discovery — reading twenty files, parsing logs — lands in the parent context and is re-billed on every later turn, so cost grows quadratically. A sub-agent does that work in an isolated context and returns a small digest; the parent reasons over roughly a thousand tokens instead of twenty thousand. The demo measures about a ten-times reduction in parent input. Pattern: coordinator plans, worker implements, reviewer checks — each in its own window. It costs some tokens in the sub-agent, so it's a conditional optimization, but for research it pays off handsomely.

**Run:** `demos/17-subagents/run.ps1`  ·  **Takeaway:** ~10× parent input reduction — the parent only sees the summary.

## Slide 24 — Module 18: Instruction engineering & caching  _(Lever 11 · caching)_
Instruction caching. Your copilot-instructions file is re-sent every turn — at full rate it's a recurring tax, but a byte-identical prefix earns the roughly ninety-percent cached discount on every later turn. The catch: any change near the top — a timestamp, a ticket ID, a reordered section — busts the whole cache. The demo shows an unstable prefix versus a stable one with volatile bits moved to the end and area-specific rules split into applyTo-scoped files that only load when matched. Keep the always-on file under about two hundred lines and put dates and ticket IDs last, never first.

**Run:** `demos/18-instruction-caching/run.ps1`  ·  **Takeaway:** Instructions are paid once; engineer the prefix for cache stability.

## Slide 25 — Module 19: Usage limits & overages  _(Lever 10)_
Lever ten steps back from tokens to the meter itself. Set overage caps, understand which actions count against your entitlement, and watch the overage ratio — a healthy team runs ten to fifteen percent overage; uncontrolled teams blow past thirty. The demo contrasts an ungoverned session that ignores budget and reloads context against a governed setup with caps and Auto mode. This is the governance wrapper around everything else: the technical levers reduce spend, and usage limits make sure a runaway agent can't surprise you at month-end.

**Run:** `demos/19-usage-limits/run.ps1`  ·  **Takeaway:** Cap the bill before the bill caps you.

## Slide 26 — Module 20: Power user guidance  _(Lever 11)_
The last module is for teams already running the fundamentals. These are conditional, trade-off-laden patterns: think in code — write a script to analyze files instead of dumping them into context; trim long shell output before it reaches the model; collapse repeated tool calls; prefer CLIs over broad MCP catalogs where schema overhead dominates; and run usage diagnostics regularly to find drift. The demo measures trimming a raw tool dump. These aren't mandatory — adopt them where your telemetry shows a recurring high-cost pattern.

**Run:** `demos/20-power-user/run.ps1`  ·  **Takeaway:** Adopt selectively where telemetry shows recurring high-cost patterns.

## Slide 27 — Context-hygiene checklist
Here's the one-card checklist to take back to your desk. Clear every fifteen to twenty messages. Edit a previous message instead of piling on follow-ups. Make surgical edits and outline before you build. Compact before switching focus and cap the thinking budget. Route models deliberately. Prune MCP tools and swap live data-fetch for the gh CLI. Front-load the stable content so it caches at ninety percent off. And log state to SQLite, not into the prompt. None of this is exotic — it's hygiene, and it compounds.

## Slide 28 — Live scoreboard + references
To close: everything here is reproducible. Run bench report to regenerate the scoreboard, and run verify-all to execute every one of the twenty demos and assert each still produces a positive, measured saving — if a demo ever stops saving tokens, the build fails. The research percentages come from the GitHub blog, MindStudio, Tetrate and Apex Hours, but the numbers on your screen are what this repo actually measured on your machine. The whole philosophy in four words: measure, optimize, verify, repeat. Thank you.
