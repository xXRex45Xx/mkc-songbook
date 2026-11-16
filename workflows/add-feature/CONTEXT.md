# add-feature — scope a feature, run the right pipelines

Trigger: Esrom asks for a new feature, in any words. Every add-feature task starts here, whether it touches the backend, the frontend or both.

## Stages

| Stage | Job |
|---|---|
| `01_scope` | Decide backend, frontend or both |
| `02_backend` | Run `add-backend-feature` |
| `03_frontend` | Run `add-frontend-feature` |
| `04_close` | Check the two halves agree |

Each stage's own `CONTEXT.md` holds its inputs, outputs and check. Nothing moves to the next
stage until the current check passes. One run is one feature. Stage 02 or 03 is `skipped` when
stage 01 says that side is not needed. Each child workflow runs in full, including its own
`review-commit` hand-off, so a feature with both sides ends in two commits: backend first.

Not for these (stage 01 sends them away): a defect, to `workflows/fix-defect/`; the
`impeccable` skill's live mode; a pure restyle or polish with no new behavior, to the `impeccable`
skill and then `workflows/review-commit/`.

## Done

Every child run this feature needs has a pushed `review-commit` commit, and `summary.md` says the
backend contract and the frontend client agree. A run that stage 01 sends away is done when `plan.md`
says `send away` and names the workflow or skill it goes to.

## Factory

Every stage may read these; none copies them:

- `map/effects/CONTEXT.md` ("Route a task to files" and "By what you change")
- `workflows/add-feature/references/scope-rules.md`
- `docs/conventions.md`

Before stage 01 changes anything, the working tree is committed and pushed.

Status is whatever exists: a stage is done for a run when its `output/{run}/` holds an artifact and
its `check.md` says `pass`.
