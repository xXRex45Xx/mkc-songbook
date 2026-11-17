# 01_triage — define the defect, scope, plan

One job: turn a bug report into an agreed, scoped fix plan before any code changes.

## Inputs

- Working (this run): the defect as Esrom described it, or one Known defects bullet on a
  `map/objects/` or `map/processes/` card
- Reference (every run): `map/effects/CONTEXT.md`
- Reference (security issues): `workflows/fix-defect/references/security.md`

Do NOT load: all of `map/`, unrelated source files, earlier runs.

## Process

1. If the defect is not stated, stop and ask for it.
   Name the run: `{run}` = `<YYYYMMDD-HHMM>-<task-slug>` (`workflows/CONTEXT.md` §5); say it
   in chat. Create `output/{run}/`.
2. Confirm the working tree is committed and pushed (`git status -sb`). If not, run
   `workflows/review-commit/` first.
3. Find the cause in code and cite it as `path:line`. Read only the files the defect's card
   and the effects index point at.
4. From `map/effects/CONTEXT.md`, list the cards this fix will make untrue.
5. Write the plan: the smallest change that fixes the cause, what is out of scope, and how
   stage 02 will reproduce it (a Jest test for backend; browser steps for frontend).

## Outputs

- `triage.md` -> `output/{run}/`: symptom, cause (`path:line`), severity, `security: yes/no`, area
  (backend / frontend / both), cards to update, planned change, out of scope, repro plan.

## Check

Type: Person

Esrom reads `triage.md` and approves the scope and plan, or says what to change. Write
`output/{run}/check.md`: `pass — approved by Esrom` or `fail: <reason given>`.
