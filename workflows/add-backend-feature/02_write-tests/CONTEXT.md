# 02_write-tests — encode the contract as failing tests

One job: write the tests that define the feature, and show they fail only because the feature is missing.

## Inputs

- Working (this run): `workflows/add-backend-feature/01_spec-and-plan/output/{run}/spec.md`
- Reference (every run): `backend/TESTING.md`
- Reference (every run): `docs/conventions.md`
- Reference (every run): `workflows/add-backend-feature/references/docs-lookup.md`

Do NOT load: the files the feature will change beyond what a test must import, `map/`, other stages.

## Process

1. If `spec.md` is missing or its check is not `pass`, stop and say which. Create `output/{run}/`.
2. Write the tests listed under "Tests to write" in `spec.md`, in the mirrored path under
   `backend/__tests__/`, using the helpers and fixtures named in `backend/TESTING.md`. Add the new
   field to `backend/jest/fixtures/` when a model gains one. For a new model, add it to
   `resetDatabase` in `backend/jest/helpers/integration.helper.js`.
3. Cover each line of the contract: success, each error status, each role that is refused, each
   validation rule, and a case that shows existing behavior is unchanged.
4. For any Jest, Supertest or `mongodb-memory-server` API the tests use that you are not sure of,
   fetch current docs with the `context7-mcp` skill as `references/docs-lookup.md` says.
5. Do not change any file outside `backend/__tests__/` and `backend/jest/`. Do not change source code.

## Outputs

- `tests.md` -> `output/{run}/`: each test file, and for each test the contract line it covers and
  the failing assertion it produces now, then `## Docs consulted`.
- The new and changed test files in `backend/__tests__/` and `backend/jest/`.

## Check

Type: Script

For each test file in `tests.md`: `cd backend && npx jest --coverage=false <test file>`. Do not use
`npm test -- <file>` here: it runs the 80% coverage gate, which fails a correct single-file run.
All true: the run exits non-zero; every failing test is listed in `tests.md` as covering new
behavior and fails on an assertion about the missing feature, not on a syntax, import or setup
error; every test `tests.md` marks as covering unchanged behavior passes. Write `output/{run}/check.md`:
each command with its exit code, then `pass` or `fail: <which>`.
