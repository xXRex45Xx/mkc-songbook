# 01_spec-and-plan — agree contract, files, risks

One job: turn a feature request into an agreed, scoped spec and file plan before any code or test is written.

## Inputs

- Working (this run): the feature as Esrom described it
- Working (when started by `add-feature`): `workflows/add-feature/01_scope/output/{run}/plan.md`, whose draft
  contract is a starting point; this stage's `spec.md` is the authority
- Reference (every run): `map/effects/CONTEXT.md` ("Route a task to files", then "By what you change")
- Reference (every run): `backend/TESTING.md`
- Reference (every run): `docs/conventions.md`
- Reference (every run): `workflows/add-backend-feature/references/docs-lookup.md`

Do NOT load: all of `map/`, frontend source or frontend cards beyond naming them, unrelated source
files, earlier runs.

## Process

1. If the feature is not stated, stop and ask for it. If it is a defect, stop and point to
   `workflows/fix-defect/`. Name the run: `{run}` = `<YYYYMMDD-HHMM>-<task-slug>`
   (`workflows/CONTEXT.md` §5); say it in chat. Create `output/{run}/`. When `workflows/add-feature/` started this run, use the child run name and the feature text from its `plan.md` instead of asking.
2. Run `git status -sb`. Uncommitted changes: stop and run `workflows/review-commit/` as its own
   run first. A clean tree that is ahead of `origin`: ask Esrom to approve `git push origin HEAD`, then
   continue.
3. In `map/effects/CONTEXT.md`, take the Backend column for the feature and every matching row
   under "By what you change". Open only the cards they name; read each card's **Known defects**
   and **If you change this**.
4. Apply every gotcha the cards and rows list: the "A new field", "A new route with a fixed path",
   "New API endpoint end to end" and "Search" rows of `map/effects/CONTEXT.md`, the Known defects of
   the cards you opened, and the per-change test table in `map/areas/tests/backend-tests.md`.
5. Write the spec. Cite existing code as `path:line`. Keep every file path in full from the repo root.
6. For every library, standard or best practice the contract or data design depends on, and for any
   new dependency, fetch current docs with the `context7-mcp` skill as `references/docs-lookup.md`
   says, before you commit to a design.
7. Do not change any file other than `output/{run}/spec.md` in this stage.

## Outputs

- `spec.md` -> `output/{run}/` with these sections, in order:
  - **Behavior:** what the feature does, for whom, in three sentences.
  - **API contract:** per route: method, path, allowed roles, request fields with Joi rules and their
    unit (Joi `.max` counts UTF-16 code units), response shape, status codes and error messages. Or
    "no new route".
  - **Data:** model fields, indexes, new models, existing documents that need a default or a migration,
    seed changes in `backend/init-db/`, and whether
    existing documents are backfilled or left without the field.
  - **Security and limits:** who may call it, rate limiting, input bounds, anything the gotchas touch.
  - **Client-visible values:** any limit, default or flag the frontend enforces or displays today
    (search `frontend/src/` for the number or the field) and how the client will learn the server's
    value, or "none".
  - **Files to change, in order:** model, validation schema, middleware, controller, route, config or
    utils, `backend/.env.example`. Full paths.
  - **Tests to write:** full paths, from the per-change table in `map/areas/tests/backend-tests.md`.
  - **Docs and cards to update:** `backend/README.md`, root `README.md` endpoint list, map cards.
  - **Docs consulted:** per `references/docs-lookup.md`.
  - **Out of scope:** including the frontend work (screens, API client, offline handling), listed so a
    a run of `workflows/add-frontend-feature/` can pick it up.

## Check

Type: Person

Esrom reads `spec.md` and approves the contract, data changes and file list, or says what to
change. Write `output/{run}/check.md`: `pass — approved by Esrom` or `fail: <reason given>`.
