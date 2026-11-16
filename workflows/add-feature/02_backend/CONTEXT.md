# 02_backend — run add-backend-feature

One job: run `workflows/add-backend-feature/` for the backend half, or record that it is not needed.

## Inputs

- Working (this run): `workflows/add-feature/01_scope/output/{run}/plan.md`
- Reference (every run): `workflows/add-backend-feature/CONTEXT.md`

Do NOT load: the frontend workflow, frontend source, earlier runs.

## Process

1. If `plan.md` is missing or its check is not `pass`, stop and say which. Create `output/{run}/`.
2. If `plan.md` Child runs says the backend is `skipped`, write `backend.md` saying so and its reason,
   and stop at the check.
3. Otherwise start `workflows/add-backend-feature/` with the backend child run name from `plan.md`
   and `plan.md` as its optional input. Run it stage by stage, honoring every stage check, including
   the spec approval and the `review-commit` hand-off with the child run name.
4. When the child's `review-commit` `04_commit` check says `pass`, record its commit hash and the
   path to its `spec.md`.

## Outputs

- `backend.md` -> `output/{run}/`: `skipped` and why, or the child run name, the commit hash, the
  path to the child's `spec.md`, and any change to the draft contract.

## Check

Type: Script

Skipped: `backend.md` states the reason from `plan.md`. Run: `workflows/review-commit/04_commit/output/{child run}/check.md`
first line is `pass`, and `git status -sb` shows the branch even with `origin`. Write
`output/{run}/check.md`: `pass` (`pass — skipped` when skipped) or `fail: <which>`.
