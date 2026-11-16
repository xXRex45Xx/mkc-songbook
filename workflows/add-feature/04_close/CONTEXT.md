# 04_close — check the two halves agree

One job: confirm every child run finished and the backend contract and the frontend client match.

## Inputs

- Working (this run): `workflows/add-feature/01_scope/output/{run}/plan.md`
- Working (this run): `workflows/add-feature/02_backend/output/{run}/backend.md`
- Working (this run): `workflows/add-feature/03_frontend/output/{run}/frontend.md`
- Working (when both ran): the backend child's `spec.md` API contract and the frontend functions it
  names under `frontend/src/utils/api/`

Do NOT load: other source files, `map/` cards, earlier runs.

## Process

1. If `frontend.md` is missing or its check is not `pass`, stop and say which. Create `output/{run}/`.
2. List each child run, its commit hash and whether it was skipped.
3. When both sides ran, compare the backend `spec.md` API contract with the client functions the
   frontend child added or used: method, path, request field names, roles, response fields, and the
   status codes the UI handles.
4. List anything the children recorded as out of scope that this feature still needs.

## Outputs

- `summary.md` -> `output/{run}/`: the child runs and commits, the contract comparison (one row per
  route, match or mismatch), the open out-of-scope items, and a one-paragraph summary Esrom can read.

## Check

Type: Agent

Rubric: (a) every non-skipped child's `review-commit` check is `pass`; (b) every contract point has a
row, and every row says match; (c) the summary lists out-of-scope items or says there are none. All
three true: `pass`. A mismatch: `fail: <route and field>`, and name which workflow should fix it. Write
`output/{run}/check.md`.
