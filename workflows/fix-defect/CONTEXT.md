# fix-defect — fix a bug or security issue

Trigger: Esrom names a bug, a security issue, or a map Known defect to fix.

## Stages

| Stage | Job |
|---|---|
| `01_triage` | Define the defect, scope, plan |
| `02_reproduce` | Prove the defect exists |
| `03_fix` | Change code to fix it |
| `04_update-map` | Make the map true again |
| hand-off | Run `workflows/review-commit/` |

Each stage's own `CONTEXT.md` holds its inputs, outputs and check. Nothing moves to the next
stage until the current check passes. One run fixes one defect.

## Done

The fix is committed and pushed by a `review-commit` run whose `04_commit` check says `pass`.

## Factory

Every stage may read these; none copies them:

- `docs/conventions.md`
- `backend/TESTING.md`
- `map/effects/CONTEXT.md` and the cards it lists
- `workflows/fix-defect/references/security.md` (security issues)
- `.claude/skills/impeccable/SKILL.md` (UI or visual fixes only; run the skill)

Before stage 01 changes anything, the working tree is committed and pushed.

Status is whatever exists: a stage is done when its `output/` holds an artifact and its
`check.md` says `pass`.
