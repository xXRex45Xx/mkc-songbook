# 03_fix — change code to fix it

One job: make the change planned in `triage.md`, and nothing more.

## Inputs

- Working (this run): `workflows/fix-defect/01_triage/output/{run}/triage.md`
- Working (this run): `workflows/fix-defect/02_reproduce/output/{run}/repro.md`
- Reference (every run): `docs/conventions.md`
- Reference (security issues): `workflows/fix-defect/references/security.md`
- Reference (UI or visual fixes only): `.claude/skills/impeccable/SKILL.md` — run the skill

Do NOT load: `map/` cards (stage 04's job), unrelated code, earlier runs.

## Process

1. If `repro.md` is missing or its check is not `pass`, stop and say which. Create `output/{run}/`.
2. Change only the files the plan names. If the fix needs more, stop and ask Esrom to amend
   `triage.md`.
3. Follow `docs/conventions.md` and add or update JSDoc on changed public functions.
4. Do not edit the repro test to make it pass.

## Outputs

- `fix.md` -> `output/{run}/`: files changed, why each, anything left out of scope, and (security)
  whether users must sign in again.

## Check

Backend — Type: Script. All exit 0: the repro test
(`cd backend && npm test -- <test file from repro.md>`), then `cd backend && npm test` (80%
coverage gate).

Frontend — Type: Script, then Person. `cd frontend && npm run lint && npm run build` exits 0;
then Esrom re-runs the `repro.md` steps and confirms the defect is gone.

Write `output/{run}/check.md`: each command with its exit code (and Esrom's answer for frontend),
then `pass` or `fail: <why>`.
