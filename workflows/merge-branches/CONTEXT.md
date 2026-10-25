# merge-branches — merge, resolve conflicts, commit

Trigger: Esrom asks to merge one branch (source) into another (target).

## Stages

| Stage | Job |
|---|---|
| `01_prepare` | Confirm branches, preview conflicts |
| `02_merge` | Start the merge, list conflicts |
| `03_resolve` | Resolve each conflict with reasons |
| `04_verify` | Prove the merge is clean |
| hand-off | Run `workflows/review-commit/` |

Each stage's own `CONTEXT.md` holds its inputs, outputs and check. Nothing moves to the next
stage until the current check passes. If `02_merge` finds no conflicts, `03_resolve` writes
`no conflicts` and passes.

## Done

The merge commit is pushed by a `review-commit` run whose `04_commit` check says `pass`, or
`01_prepare` reports the target already contains the source.

## Factory

Every stage may read these; none copies them:

- `workflows/merge-branches/references/resolve-rules.md`
- `docs/conventions.md`
- `map/effects/CONTEXT.md` (when conflicts touch code or map cards)

Before stage 01 changes anything, the working tree is committed and pushed. Any `fail` before
the commit: `git merge --abort` returns the target to the tip recorded in `merge-plan.md`.

Status is whatever exists: a stage is done when its `output/` holds an artifact and its
`check.md` says `pass`.
