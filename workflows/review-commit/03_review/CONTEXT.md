# 03_review — review the diff for defects

One job: find bugs and rule breaks in the change before it is committed.

## Inputs

- Working (this run): `workflows/review-commit/01_inventory/output/{run}/changes.md`
- Working (this run): `git diff HEAD -- <commit list from changes.md>`
- Reference (every run): the harness's built-in `code-review` skill (not stored in this repo)
- Reference (every run): `docs/conventions.md`
- Reference (code changes only): `map/effects/CONTEXT.md`

Do NOT load: files outside the commit list, old runs, all of `map/`.

## Process

1. If `changes.md` or `02_checks/output/{run}/check.md` is missing or not `pass`, stop and say
   which. Create `output/{run}/`.
2. Run the harness's `code-review` skill on the diff of the commit list. If the harness has no
   such skill, review the diff by hand in the same buckets and say so in `review.md`.
3. Add the repo-specific items the skill does not know:
   - code follows `docs/conventions.md` (tabs, double quotes, relative imports, naming);
   - new or changed public functions carry JSDoc;
   - a code change updated every map card it made untrue (`map/effects/CONTEXT.md`), per
     `workflows/CONTEXT.md` §7.
4. Sort every finding as **blocking**, **should-fix** or **note**, each with `path:line`.

## Outputs

- `review.md` -> `output/{run}/`: findings by bucket, and which reviewer produced them.

## Check

Type: Agent, escalating to Person

Rubric: (a) the skill ran or the fallback is stated; (b) all three repo items were checked;
(c) zero blocking findings. All three true: write `pass`. Any blocking finding: show
`review.md` to Esrom and write `pass — approved by Esrom` or `fail: <reason given>`.
