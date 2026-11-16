# 01_spec-and-plan — agree contract, files, risks

One job: turn a feature request into an agreed, scoped spec and file plan before any code or test is written.

## Inputs

- Working (this run): the feature as Esrom described it
- Reference (every run): `map/effects/CONTEXT.md` ("Route a task to files", then "By what you change")
- Reference (every run): `backend/TESTING.md`
- Reference (every run): `docs/conventions.md`

Do NOT load: all of `map/`, frontend source or frontend cards beyond naming them, unrelated source
files, earlier runs.

## Process

1. If the feature is not stated, stop and ask for it. If it is a defect, stop and point to
   `workflows/fix-defect/`. Name the run: `{run}` = `<YYYYMMDD-HHMM>-<task-slug>`
   (`workflows/CONTEXT.md` §5); say it in chat. Create `output/{run}/`.
2. Confirm the working tree is committed and pushed (`git status -sb`). If not, run
   `workflows/review-commit/` first.
3. In `map/effects/CONTEXT.md`, take the Backend column for the feature and every matching row
   under "By what you change". Open only the cards they name; read each card's **Known defects**
   and **If you change this**.
4. Check the request against the gotchas the cards list: Joi rejects unknown body keys (add the
   field to create and update schemas); PUT clears omitted fields; list responses project only
   some fields; the JWT user projection and the hand-built user replies; `PATCH /:id` route
   order; the song id-rename copy list; a new model needs a line in
   `backend/jest/helpers/integration.helper.js`.
5. Write the spec. Cite existing code as `path:line`. Keep every file path in full from the repo root.
6. Do not change any file other than `output/{run}/spec.md` in this stage.

## Outputs

- `spec.md` -> `output/{run}/` with these sections, in order:
  - **Behavior:** what the feature does, for whom, in three sentences.
  - **API contract:** per route: method, path, allowed roles, request fields with Joi rules, response
    shape, status codes and error messages. Or "no new route".
  - **Data:** model fields, indexes, new models, existing documents that need a default or a migration,
    seed changes in `backend/init-db/`.
  - **Security and limits:** who may call it, rate limiting, input bounds, anything the gotchas touch.
  - **Files to change, in order:** model, validation schema, middleware, controller, route, config or
    utils, `backend/.env.example`. Full paths.
  - **Tests to write:** full paths, from the per-change table in `map/areas/tests/backend-tests.md`.
  - **Docs and cards to update:** `backend/README.md`, root `README.md` endpoint list, map cards.
  - **Out of scope:** including the frontend work (screens, API client, offline handling), listed so a
    later run can pick it up.

## Check

Type: Person

Esrom reads `spec.md` and approves the contract, data changes and file list, or says what to
change. Write `output/{run}/check.md`: `pass — approved by Esrom` or `fail: <reason given>`.
