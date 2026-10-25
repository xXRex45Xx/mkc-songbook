# 02_reproduce — prove the defect exists

One job: show the defect happening, so stage 03 can prove it is gone.

## Inputs

- Working (this run): `workflows/fix-defect/01_triage/output/triage.md`
- Reference (backend): `backend/TESTING.md`
- Reference (every run): `docs/conventions.md`

Do NOT load: the fix's target code beyond what the test needs, `map/`, other stages.

## Process

1. If `triage.md` is missing or its check is not `pass`, stop and say which. Create `output/`
   if it does not exist.
2. Backend: write one Jest test in `backend/__tests__/` that encodes the correct behavior, using
   the factories and helpers named in `backend/TESTING.md`. Do not change source code.
3. Frontend (no test suite exists): write exact steps to reproduce in the browser: URL, role,
   online or offline, actions, what you see vs what should happen.

## Outputs

- `repro.md` -> `output/`: the test file path and its failing assertion, or the browser steps.
- Backend: the new test file in `backend/__tests__/`.

## Check

Backend — Type: Script. `cd backend && npm test -- <new test file>` exits non-zero, and the
failure is the assertion named in `repro.md`, not a syntax or setup error.

Frontend — Type: Person. Esrom follows the steps in `repro.md` and confirms the defect shows.

Write `output/check.md`: `pass` (with the failing assertion, or `— approved by Esrom`) or
`fail: <why>`.
