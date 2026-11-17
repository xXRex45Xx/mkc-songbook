# 01_scope — decide backend, frontend or both

One job: turn a feature request into an agreed scope: which workflows run, in what order, and the contract the two sides share.

## Inputs

- Working (this run): the feature as Esrom described it
- Reference (every run): `map/effects/CONTEXT.md` ("Route a task to files", then "By what you change")
- Reference (every run): `workflows/add-feature/references/scope-rules.md`
- Reference (every run): `docs/conventions.md`

Do NOT load: all of `map/`, source files beyond naming a client function, the child workflows'
stage contracts, earlier runs.

## Process

1. If the feature is not stated, stop and ask for it. Name the run: `{run}` =
   `<YYYYMMDD-HHMM>-<task-slug>` (`workflows/CONTEXT.md` §5); say it in chat. Create `output/{run}/`.
2. Run `git status -sb`. Uncommitted changes: stop and run `workflows/review-commit/` as its own
   run first. A clean tree that is ahead of `origin`: ask Esrom to approve `git push origin HEAD`, then
   continue.
3. Apply `references/scope-rules.md`: decide backend, frontend, both, or send away. If it is sent
   away, write `plan.md` with only **Feature**, **Scope** and **Hand-off**, name the workflow or
   skill it goes to (or "none"), and stop at the check.
4. For each need the feature has, cite the map row and the code it touches (`path:line`), reading
   only the cards the rows name. Search `frontend/src/` for any limit, default or flag the feature
   changes, since the client may hold its own copy. For frontend-only scope, name the existing client
   function for each data need and confirm its data has the type and meaning the UI needs.
5. Draft the shared contract: every route, role, request field, response shape and status code both
   sides rely on. Mark it a draft: the backend `spec.md` is the authority.
6. Name the child runs as `references/scope-rules.md` says.
7. Do not change any file other than `output/{run}/plan.md` in this stage (step 2's `review-commit`
   run is its own run).

## Outputs

- `plan.md` -> `output/{run}/` with these sections, in order:
  - **Feature:** what it does, for whom, in three sentences. Children copy this as their request.
  - **Scope:** `backend`, `frontend`, `both` or `send away: <workflow>`, with the reason and the map rows.
  - **Run order:** which workflows run and in what order.
  - **Child runs:** a table of workflow, run name, `run` or `skipped`.
  - **Draft contract:** routes, roles, fields with their bounds and unit, responses, status codes,
    offline behavior (online-only or queued), whether existing data is backfilled, and every
    value the client enforces or shows today. Or "none".
  - **Hand-off:** per child, the exact input it takes (`plan.md` path; for the frontend child also
    the backend child's `spec.md`).

## Check

Type: Person

Esrom reads `plan.md` and approves the scope, order and contract, or says what to change. Write
`output/{run}/check.md`: `pass — approved by Esrom` or `fail: <reason given>`.
