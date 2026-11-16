# 04_update-docs-and-map — make docs and map true

One job: update the docs, `DESIGN.md` and every map card the feature touched, then hand off to `review-commit`.

## Inputs

- Working (this run): `workflows/add-frontend-feature/01_spec-and-plan/output/{run}/spec.md`
- Working (this run): `workflows/add-frontend-feature/02_implement/output/{run}/implement.md`
- Working (this run): `workflows/add-frontend-feature/03_verify/output/{run}/verify.md`
- Reference (every run): `map/_meta/schema.md`
- Reference (every run): `map/effects/CONTEXT.md`
- Reference (every run): `workflows/add-frontend-feature/references/docs-lookup.md`
- Reference (UI or visual stages only): `.claude/skills/impeccable/SKILL.md` — run the skill

Do NOT load: cards that `spec.md` and the effects index do not name.

## Process

1. If `verify.md` is missing or its check is not `pass`, stop and say which. Create `output/{run}/`.
2. `DESIGN.md`: if the feature added tokens, components or patterns, run the `impeccable` skill's
   `document` command to update it from the shipped code. Leave it alone otherwise.
3. Docs: update `README.md` and `frontend/.env.example` for new routes or environment variables.
4. Map, from `spec.md` "Docs and cards to update" and the effects rows it named:
   - area cards: new files in the Files table and in `owns`, new URLs in the route table, new
     components with their slices and utils;
   - object cards: new IndexedDB stores or Redux slices, with `path:line` citations;
   - process cards the feature moved (sync, offline writes, audio, auth);
   - `map/effects/CONTEXT.md`: a new row or changed Hits;
   - set `verified: <today> @ <HEAD commit>` on every card whose claims you rechecked.
5. Correct every `path:line` the change moved in cards you touched. Where `spec.md` or `implement.md`
   recorded a library fact a card depends on, state it in that card. Do not fetch new docs here.
6. Rebuild indexes: `python3 -I map/_tools/index.py map/objects/data-model map/objects/local-db map/objects/app-state map/processes map/areas/backend-api map/areas/backend-core map/areas/frontend-ui map/areas/frontend-core map/areas/tests`.
7. Hand off: start `workflows/review-commit/` with the same `{run}`, and `map-update.md` as its
   optional input.

## Outputs

- `map-update.md` -> `output/{run}/`: docs, `DESIGN.md` and cards changed, citations refreshed, and
  a one-line summary for the commit message.

## Check

Type: Script

All true: `python3 -I map/_tools/links.py . --skip node_modules dist dev-dist coverage` reports 0
broken; every `map/` frontmatter block parses with `yaml.safe_load`; every new file under
`frontend/src/` (`git ls-files -o --exclude-standard frontend/src`) has its basename in some card
under `map/areas/` (`grep -rl <basename> map/areas`). Write `output/{run}/check.md`: `pass` or
`fail: <which>`.
