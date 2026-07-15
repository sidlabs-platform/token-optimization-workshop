# Module 18 — Instruction Engineering & the Cache Discount

**Goal:** show how stable instruction prefixes and path scoping reduce always-on input.

Prompt caching rewards byte-identical prefixes. If the top of `.github/copilot-instructions.md`
contains timestamps, ticket IDs, reordered sections, or sprint notes, the prefix changes and the
cache cannot help. A stable prefix can earn a large cached-token discount.

## Scenario: unstable-vs-stable-prefix

`fixtures/18-instruction-caching/instructions.unstable.txt` puts volatile status, dates, incident IDs,
and ad-hoc sprint notes before the durable SentinelOps rules. It also loads API, web, and docs rules
for every turn.

`fixtures/18-instruction-caching/instructions.stable.txt` keeps the always-on prefix small and stable,
puts volatile notes last, and splits path-specific guidance with `applyTo` blocks.

## Run
```powershell
./run.ps1
```
```bash
./run.sh
```

## Practice

- Keep the always-on instruction file under about 200 lines.
- Put stable policy first: stack, style, test commands, safety rules.
- Put ticket IDs, dates, and sprint status at the end or outside always-on instructions.
- Split heavy details by path, for example API rules only for `app/packages/api/**`.

## Expected result

The optimized fixture is smaller and cache-friendlier. In live systems, the byte-identical prefix can
also receive the cached-token discount on later turns.
