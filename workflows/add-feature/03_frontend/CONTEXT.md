# 03_frontend — run add-frontend-feature

One job: run `workflows/add-frontend-feature/` for the frontend half, or record that it is not needed.

## Inputs

- Working (this run): `workflows/add-feature/01_scope/output/{run}/plan.md`
- Working (this run): `workflows/add-feature/02_backend/output/{run}/backend.md`
- Reference (every run): `workflows/add-frontend-feature/CONTEXT.md`
- Reference (UI or visual stages only): `.claude/skills/impeccable/SKILL.md` — run the skill

Do NOT load: the backend workflow, backend source, earlier runs.

## Process

1. If `backend.md` is missing or its check is not `pass`, stop and say which. Create `output/{run}/`.
2. If `plan.md` Child runs says the frontend is `skipped`, write `frontend.md` saying so and its
   reason, and stop at the check.
3. Otherwise start `workflows/add-frontend-feature/` with the frontend child run name from `plan.md`,
   `plan.md` as its optional input, and, when the backend ran, the backend child's `spec.md` as the
   contract authority. Run it stage by stage, honoring every stage check, including both Person
   checks, the impeccable steps and the `review-commit` hand-off with the child run name. Do not
   run the `impeccable` live mode.
4. When the child's `review-commit` `04_commit` check says `pass`, record its commit hash.

## Outputs

- `frontend.md` -> `output/{run}/`: `skipped` and why, or the child run name and the commit hash.

## Check

Type: Script

Skipped: `frontend.md` states the reason from `plan.md`. Run:
`workflows/review-commit/04_commit/output/{child run}/check.md` first line is `pass`, and
`git status -sb` shows the branch even with `origin`. Write `output/{run}/check.md`: `pass`
(`pass — skipped` when skipped) or `fail: <which>`.
