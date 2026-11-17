# 03_implement — write code until tests pass

One job: make the change `spec.md` plans, and nothing more.

## Inputs

- Working (this run): `workflows/add-backend-feature/01_spec-and-plan/output/{run}/spec.md`
- Working (this run): `workflows/add-backend-feature/02_write-tests/output/{run}/tests.md`
- Reference (every run): `docs/conventions.md`
- Reference (every run): `backend/STYLE_GUIDE.md` and `backend/TEMPLATES.md`
- Reference (every run): `workflows/add-backend-feature/references/docs-lookup.md`

Do NOT load: `map/` cards (stage 04's job), frontend, unrelated code, earlier runs.

## Process

1. If `tests.md` is missing or its check is not `pass`, stop and say which. Create `output/{run}/`.
2. Change only the files "Files to change, in order" names, in that order. If the feature needs
   another file, stop and ask Esrom to amend `spec.md`.
3. Follow `docs/conventions.md`. Every new or changed public function carries JSDoc per
   `backend/STYLE_GUIDE.md`; every new route carries its doc block. Add new environment variables to
   `backend/.env.example`.
4. Do not edit a test to make it pass. If a test contradicts the spec, stop, say which line, and
   ask Esrom to amend `spec.md` or `tests.md`; record the amendment in `implement.md`.
5. Before you write each library call the code adds or changes, fetch its current docs with the
   `context7-mcp` skill as `references/docs-lookup.md` says, for the version in `backend/package.json`.
6. Do not touch the frontend.

## Outputs

- `implement.md` -> `output/{run}/`: files changed and why each, any amendment to the spec or tests,
  new environment variables, anything left out of scope, and `## Docs consulted`.

## Check

Type: Script

All exit 0, in order:

1. `cd backend && npx jest --coverage=false <each new test file from tests.md>`
2. `cd backend && npm test` (the full suite with the 80% coverage gate)
3. `{ git diff HEAD --name-only; git ls-files -o --exclude-standard; } | sort -u`: every path listed is in
   the spec's "Files to change" list, a test file from `tests.md`, under `backend/jest/`, or
   `backend/.env.example`. Any other path fails the check.
4. `grep -q "## Docs consulted" output/{run}/implement.md` (a table, or "none" with its reason).

Write `output/{run}/check.md`: each command with its exit code, then `pass` or `fail: <which>`.
