# 01_spec-and-plan — agree UX, files, acceptance steps

One job: turn a feature request into an agreed, scoped UX plan, file list and browser acceptance steps before any code is written.

## Inputs

- Working (this run): the feature as Esrom described it
- Working (when started by `add-feature`): `workflows/add-feature/01_scope/output/{run}/plan.md`, and the backend
  child's `spec.md`, whose API contract is the authority
- Working (optional): a backend run's `map-update.md` frontend follow-up, e.g.
  `workflows/add-backend-feature/04_update-docs-and-map/output/{run}/map-update.md`
- Reference (every run): `map/effects/CONTEXT.md` ("Route a task to files", then "By what you change")
- Reference (every run): `docs/conventions.md`
- Reference (every run): `workflows/add-frontend-feature/references/docs-lookup.md`
- Reference (UI or visual stages only): `.claude/skills/impeccable/SKILL.md` — run the skill

Do NOT load: all of `map/`, backend source or backend cards beyond naming them, unrelated source
files, earlier runs.

## Process

1. If the feature is not stated, stop and ask for it. If it is a defect, stop and point to
   `workflows/fix-defect/`. If Esrom wants live iteration, stop: that is the `impeccable` skill's
   live mode, outside this workflow. Name the run: `{run}` = `<YYYYMMDD-HHMM>-<task-slug>`
   (`workflows/CONTEXT.md` §5); say it in chat. Create `output/{run}/`. When `workflows/add-feature/` started this run, use the child run name and the feature text from its `plan.md` instead of asking.
2. Confirm the working tree is committed and pushed (`git status -sb`). If not, run
   `workflows/review-commit/` first.
3. Run the `impeccable` skill's `shape` command for the feature. It loads `PRODUCT.md` and
   `DESIGN.md`, decides the mode (Operate, Persuade, Read or Experience) and plans the UX before
   code. Take its brief into `spec.md`; do not paste its full output.
4. In `map/effects/CONTEXT.md`, take the Frontend column for the feature and every matching row
   under "By what you change". Open only the cards they name; read each card's **Known defects**
   and **If you change this**.
5. Check the request against the gotchas the cards list: roles are checked in the UI only, so the
   server must enforce them; loaders and actions live in the page file and need a route in
   `frontend/src/main.jsx`; `sendMutation` queues offline writes but `apiFetch` calls do not; a new
   IndexedDB store needs `STORE_SCHEMAS`, a `DB_VERSION` bump and a service file; a list read offline
   needs a service worker rule in `frontend/vite.config.js` or an IndexedDB copy; a new per-user store
   needs a decision in `endSession`; a new field must reach `optimistic-write.util.js` for offline edits.
6. If the feature needs an endpoint, field or role the backend does not have, stop and say so: the
   backend run comes first.
7. For every library, browser standard or best practice the flow depends on, and for any new
   dependency, fetch current docs with the `context7-mcp` skill as `references/docs-lookup.md` says.
8. Do not change any file other than `output/{run}/spec.md` in this stage.

## Outputs

- `spec.md` -> `output/{run}/` with these sections, in order:
  - **Behavior:** what the feature does, for whom, in three sentences, and the impeccable mode.
  - **UX plan:** the `shape` brief: screens or states, flow, the empty, loading, error and offline
    states, mobile and desktop layout, copy, accessibility. Or "no visible UI".
  - **Routes and access:** URL, page file, loader and action, roles, `main.jsx` change.
  - **Data and API:** existing `frontend/src/utils/api/` functions used (full path and name), IndexedDB
    or Redux changes, offline behavior, caching rules. Or "none".
  - **Files to change, in order:** full paths, new files marked.
  - **Acceptance steps:** numbered browser steps with URL, role, online or offline, width, the action
    and what must show. These stand in for tests: stage 03 follows them.
  - **Docs consulted:** per `references/docs-lookup.md`.
  - **Docs and cards to update:** `DESIGN.md` if tokens or components change, map cards, README rows.
  - **Out of scope.**

## Check

Type: Person

Esrom reads `spec.md` and approves the UX plan, file list and acceptance steps, or says what to
change. Write `output/{run}/check.md`: `pass — approved by Esrom` or `fail: <reason given>`.
