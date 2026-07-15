# Reference solution — Incident Acknowledgement & On-Call Assignment

This folder is the **completed reference** for the feature participants build across the
three modules. Use it to unblock a table, to diff your work, or to reset.

> ⚠️ Participants should try each exercise with Copilot FIRST. Peek here only when stuck.

## What the feature adds
- Acknowledge an active incident on behalf of an on-call engineer (`POST /:id/ack`).
- Assign / re-assign an incident to an engineer (`POST /:id/assign`).
- Filter the incidents list by `acknowledged=true|false`.
- Pure, unit-tested domain logic in `@sentinelops/shared`.
- A React `AckButton` for the dashboard.

## Files in this folder → where they go in the app

| Solution file | Destination in `app/` |
|---|---|
| `shared/types/oncall.ts` | `packages/shared/src/types/oncall.ts` (new) |
| `shared/lib/acknowledge.ts` | `packages/shared/src/lib/acknowledge.ts` (new) |
| `shared/lib/acknowledge.test.ts` | `packages/shared/src/lib/acknowledge.test.ts` (new) |
| `shared/lib/assignment.ts` | `packages/shared/src/lib/assignment.ts` (new) |
| `shared/lib/assignment.test.ts` | `packages/shared/src/lib/assignment.test.ts` (new) |
| `api/store.ts` | `packages/api/src/data/store.ts` (replace) |
| `api/incidents.ts` | `packages/api/src/routes/incidents.ts` (replace) |
| `api/incidents.ack.test.ts` | `packages/api/src/routes/incidents.ack.test.ts` (new) |
| `web/AckButton.tsx` | `packages/web/src/components/AckButton.tsx` (new) |

## Edits to EXISTING files — see `patch-notes.md`
Three existing shared files need small, surgical edits (add fields / a filter / exports).
`patch-notes.md` gives the exact before/after for each.

## Apply the whole solution at once (facilitator / catch-up)
```powershell
# from repo root
./workshop/solutions/apply.ps1        # copies files + prints the manual edits still needed
```
Then run `npm --prefix app test` to confirm green.
