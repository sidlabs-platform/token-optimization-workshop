# Module 11 — Custom Agents, Skills, and Sub-Agents

**Goal:** keep persistent context small while retaining specialist behavior.

Always-on instruction files are paid every turn. Custom agents and skills let you keep the
main session lean: the role and routing rule stay loaded, while detailed procedures load only
when needed.

## Measurement

### always-on-vs-lazy
`fixtures/11-custom-agents-skills/always-on-vs-lazy.raw.txt` is a giant instruction blob:
API, UI, security, testing, incident dedupe, release, and review rules all ride along.

`always-on-vs-lazy.opt.txt` keeps only a short persistent rule plus a lazy-loaded skill
summary. The full skill body would be fetched only for relevant tasks.

The SentinelOps example focuses on incident API work, but the lesson applies to any large
agent instruction stack.

## Run

```powershell
./run.ps1
```

```bash
./run.sh
```

## Measured takeaway

Custom agents lock role and trim tool surfaces. Skills are lazy-loaded context. Sub-agents
can do focused work without polluting the main session. Use persistent instructions for
stable routing rules, not every detailed checklist.
