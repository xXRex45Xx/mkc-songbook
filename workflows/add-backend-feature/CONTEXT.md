# add-backend-feature — add a backend feature

Trigger: `workflows/add-feature/` assigns the backend half of a feature (new backend capability: an endpoint, a field, a rule; not a defect fix). Start every feature at `add-feature`, not here.

## Stages

| Stage | Job |
|---|---|
| `01_spec-and-plan` | Agree contract, files, risks |
| `02_write-tests` | Encode the contract as failing tests |
| `03_implement` | Write code until tests pass |
| `04_update-docs-and-map` | Make docs and map true |
| hand-off | Run `workflows/review-commit/` |

Each stage's own `CONTEXT.md` holds its inputs, outputs and check. Nothing moves to the next
stage until the current check passes. One run adds one feature. Backend only: the frontend half
is recorded in `spec.md` and done by a run of `workflows/add-frontend-feature/`.

A defect is not a feature: send it to `workflows/fix-defect/`.

## Done

The feature is committed and pushed by a `review-commit` run whose `04_commit` check says `pass`.

## Factory

Every stage may read these; none copies them:

- `docs/conventions.md`
- `backend/TESTING.md`
- `backend/STYLE_GUIDE.md` and `backend/TEMPLATES.md` (JSDoc)
- `workflows/add-backend-feature/references/docs-lookup.md` (when and how to fetch library docs with the `context7-mcp` skill)
- `map/effects/CONTEXT.md` and the cards it lists

Before stage 01 changes anything, the working tree is committed and pushed.

Status is whatever exists: a stage is done for a run when its `output/{run}/` holds an artifact and
its `check.md` says `pass`.
