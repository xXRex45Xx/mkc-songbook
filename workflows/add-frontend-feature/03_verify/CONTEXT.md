# 03_verify — prove it works in the browser

One job: show every acceptance step passing in a real browser, and fix what does not, before anything is committed.

## Inputs

- Working (this run): `workflows/add-frontend-feature/01_spec-and-plan/output/{run}/spec.md`
- Working (this run): `workflows/add-frontend-feature/02_implement/output/{run}/implement.md`
- Reference (every run): `docs/conventions.md`
- Reference (every run): `workflows/add-frontend-feature/references/docs-lookup.md`
- Reference (UI or visual stages only): `.claude/skills/impeccable/SKILL.md` — run the skill

Do NOT load: `map/` cards, backend source, files the feature did not change.

## Process

1. If `implement.md` is missing or its check is not `pass`, stop and say which. Create `output/{run}/`.
2. Start the dev server for `frontend/` and the backend it needs (start it with the harness's
   preview tooling, not a plain shell), and open the app in the built-in browser.
3. Follow each numbered acceptance step from `spec.md` with the role, width and network state it
   names (offline through the browser's network controls). Record the result of each step:
   `pass`, or what you saw instead. Use one batched round for desktop and mobile together.
4. Run the `impeccable` skill's `audit` on the changed surface once, and `polish` if it finds
   issues. Fix everything found in one batch; allow at most one more round.
5. After any fix, rerun `cd frontend && npm run lint && npm run build`. If a fix needs a file outside
   the spec's list, stop and ask Esrom to amend `spec.md`.
6. If a fix needs a library call you have not looked up, do so as `references/docs-lookup.md` says.

## Outputs

- `verify.md` -> `output/{run}/`: one row per acceptance step with its result, the audit findings and
  what was fixed, the final lint and build exit codes, and `## Docs consulted`.

## Check

Type: Person

Esrom follows the acceptance steps in `verify.md` (or the ones that matter most to them), confirms
the feature behaves as specified, and approves. Write `output/{run}/check.md`:
`pass — approved by Esrom` or `fail: <reason given>`.
