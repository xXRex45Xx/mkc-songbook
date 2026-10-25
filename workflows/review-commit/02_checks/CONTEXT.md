# 02_checks — run tests, lint, build, links

One job: run the pre-commit checks for every area the commit touches.

## Inputs

- Working (this run): `workflows/review-commit/01_inventory/output/{run}/changes.md`
- Reference (every run): `backend/TESTING.md`

Do NOT load: source files, `map/` cards, `docs/pwa/`.

## Process

1. If `changes.md` is missing or its check is not `pass`, stop and say which. Create
   `output/{run}/`.
2. Run only the rows whose area appears in `changes.md`, from the repo root:

| Area touched | Command |
|---|---|
| backend | `cd backend && npm test` (Jest, 80% coverage gate) |
| frontend | `cd frontend && npm run lint && npm run build` |
| map, docs, workflows, any `.md` | `python3 -I map/_tools/links.py . --skip node_modules dist dev-dist coverage` |
| map cards | every frontmatter block in `map/` parses with `yaml.safe_load` |

3. Record each command, its exit code and the last lines of its output that show the result.
   Do not fix failures here; a failure stops the run.

## Outputs

- `checks.md` -> `output/{run}/`: one row per command run, with exit code and result.

## Check

Type: Script

Every command in `checks.md` exited 0. Write `output/{run}/check.md`: `pass`, or `fail: <command>`
with its error line.
