# 04_update-map — make the map true again

One job: update every map card the fix made untrue, then hand off to `review-commit`.

## Inputs

- Working (this run): `workflows/fix-defect/01_triage/output/triage.md`
- Working (this run): `workflows/fix-defect/03_fix/output/fix.md`
- Reference (every run): `map/_meta/schema.md`
- Reference (every run): `map/effects/CONTEXT.md`

Do NOT load: cards that `triage.md` and the effects index do not name.

## Process

1. If `fix.md` is missing or its check is not `pass`, stop and say which. Create `output/` if
   it does not exist.
2. For each card listed in `triage.md`: remove the fixed Known defects bullet (and any
   "See also" pointing at it), correct every claim and `path:line` the fix moved, and set
   `verified: <today> @ <HEAD commit>`.
3. If the fix changed what a change hits, update the row in `map/effects/CONTEXT.md`.
4. Rebuild indexes: `python3 -I map/_tools/index.py map/objects/data-model map/objects/local-db map/objects/app-state map/processes`.
5. Hand off: start `workflows/review-commit/` with `map-update.md` as its optional input.

## Outputs

- `map-update.md` -> `output/`: cards changed, defect removed, citations refreshed, one-line
  summary for the commit message.

## Check

Type: Script

All true: `python3 -I map/_tools/links.py . --skip node_modules dist dev-dist coverage`
reports 0 broken; every `map/` frontmatter block parses with `yaml.safe_load`; `grep` finds
the fixed defect's text in no card. Write `output/check.md`: `pass` or `fail: <which>`.
