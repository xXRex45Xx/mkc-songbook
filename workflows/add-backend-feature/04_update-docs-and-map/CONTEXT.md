# 04_update-docs-and-map — make docs and map true

One job: update the docs and every map card the feature touched, then hand off to `review-commit`.

## Inputs

- Working (this run): `workflows/add-backend-feature/01_spec-and-plan/output/{run}/spec.md`
- Working (this run): `workflows/add-backend-feature/03_implement/output/{run}/implement.md`
- Reference (every run): `map/_meta/schema.md`
- Reference (every run): `map/effects/CONTEXT.md`

Do NOT load: cards that `spec.md` and the effects index do not name.

## Process

1. If `implement.md` is missing or its check is not `pass`, stop and say which. Create `output/{run}/`.
2. Docs: update `backend/README.md` (endpoints, body field lists, environment variables) and the root
   `README.md` endpoint list for every route or field the feature added or changed.
3. Map, from `spec.md` "Docs and cards to update" and the effects rows it named:
   - object cards: new fields, indexes, models, with `path:line` citations;
   - area cards: new files in the Files table and in `owns`, new routes in Entry points, new gotchas
     under Known defects only if they are bugs;
   - process cards the feature moved;
   - `map/effects/CONTEXT.md`: a new row or changed Hits, and the per-change test row in
     `map/areas/tests/backend-tests.md` for each new test file;
   - set `verified: <today> @ <HEAD commit>` on every card whose claims you rechecked.
4. Correct every `path:line` the change moved in cards you touched.
5. Rebuild indexes: `python3 -I map/_tools/index.py map/objects/data-model map/objects/local-db map/objects/app-state map/processes map/areas/backend-api map/areas/backend-core map/areas/frontend-ui map/areas/frontend-core map/areas/tests`.
6. Write the frontend follow-up from `spec.md` "Out of scope" into `map-update.md`, so a later run
   can pick it up.
7. Hand off: start `workflows/review-commit/` with the same `{run}`, and `map-update.md` as its
   optional input.

## Outputs

- `map-update.md` -> `output/{run}/`: docs and cards changed, citations refreshed, the frontend
  follow-up, and a one-line summary for the commit message.

## Check

Type: Script

All true: `python3 -I map/_tools/links.py . --skip node_modules dist dev-dist coverage` reports 0
broken; every `map/` frontmatter block parses with `yaml.safe_load`; every new non-test file under
`backend/` (`git ls-files -o --exclude-standard backend`) has its basename in some card under
`map/areas/` (`grep -rl <basename> map/areas`). Write `output/{run}/check.md`: `pass` or
`fail: <which>`.
