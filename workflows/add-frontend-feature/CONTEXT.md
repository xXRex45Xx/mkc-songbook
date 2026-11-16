# add-frontend-feature — add a frontend feature

Trigger: `workflows/add-feature/` assigns the frontend half of a feature (new frontend capability: a screen, a component, a flow, an offline behavior; not a defect fix). Start every feature at `add-feature`, not here.

## Stages

| Stage | Job |
|---|---|
| `01_spec-and-plan` | Agree UX, files, acceptance steps |
| `02_implement` | Build it, lint and build clean |
| `03_verify` | Prove it works in the browser |
| `04_update-docs-and-map` | Make docs and map true |
| hand-off | Run `workflows/review-commit/` |

Each stage's own `CONTEXT.md` holds its inputs, outputs and check. Nothing moves to the next
stage until the current check passes. One run adds one feature. Frontend only: if the feature
needs a new or changed endpoint, run `workflows/add-backend-feature/` first and start here from
its `map-update.md` follow-up.

Not for these:

- a defect: use `workflows/fix-defect/`;
- the `impeccable` skill's live mode (`live`, `generate`): it iterates in the browser on its own
  and is not wrapped in this workflow;
- a pure restyle or polish with no new behavior: run the `impeccable` skill directly, then
  `workflows/review-commit/`.

## Done

The feature is committed and pushed by a `review-commit` run whose `04_commit` check says `pass`.

## Factory

Every stage may read these; none copies them:

- `docs/conventions.md`
- `frontend/STYLE_GUIDE.md` and `frontend/TEMPLATES.md` (JSDoc)
- `PRODUCT.md` and `DESIGN.md` (loaded through the `impeccable` skill)
- `.claude/skills/impeccable/SKILL.md` (run the skill for every UI or visual step)
- `map/effects/CONTEXT.md` and the cards it lists
- `workflows/add-frontend-feature/references/docs-lookup.md` (library docs through the `context7-mcp` skill)

Before stage 01 changes anything, the working tree is committed and pushed.

Status is whatever exists: a stage is done for a run when its `output/{run}/` holds an artifact and
its `check.md` says `pass`.
