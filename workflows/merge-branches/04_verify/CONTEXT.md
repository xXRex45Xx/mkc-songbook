# 04_verify — prove the merge is clean

One job: confirm nothing is left unresolved, then hand the merge to `review-commit`.

## Inputs

- Working (this run): `workflows/merge-branches/01_prepare/output/merge-plan.md`
- Working (this run): `workflows/merge-branches/03_resolve/output/resolution.md`

Do NOT load: source files, `map/`, references.

## Process

1. If `resolution.md` is missing or its check is not `pass`, stop and say which. Create
   `output/` if it does not exist.
2. Run the three commands in the check and record their output.
3. Hand off: start `workflows/review-commit/`. Its `04_commit` makes the merge commit, with a
   `merge:` subject naming source and target and a body taken from `merge-plan.md` and
   `resolution.md`.

## Outputs

- `verify.md` -> `output/`: each command and what it printed.

## Check

Type: Script

All true: `git diff --name-only --diff-filter=U` prints nothing; `git diff --cached --check`
prints nothing; `git grep -nE '^(<{7}|={7}|>{7})( |$)' -- $(git diff --cached --name-only)`
prints nothing. Write `output/check.md`: `pass` or `fail: <which>`.
