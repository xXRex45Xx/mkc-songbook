# 02_merge — start the merge, list conflicts

One job: run the merge without committing, and record exactly which files conflict.

## Inputs

- Working (this run): `workflows/merge-branches/01_prepare/output/merge-plan.md`

Do NOT load: conflicted file contents (stage 03's job), `map/`, references.

## Process

1. If `merge-plan.md` is missing or its check is not `pass`, stop and say which. Create
   `output/` if it does not exist.
2. `git checkout <target>` and `git pull --ff-only origin <target>`; confirm the tip matches
   `merge-plan.md`. If it moved, stop and re-run stage 01.
3. `git merge --no-ff --no-commit <source>`.
4. List conflicts: `git diff --name-only --diff-filter=U`.

## Outputs

- `conflicts.md` -> `output/`: each conflicted file, or `none`; and any predicted conflict from
  `merge-plan.md` that did not appear (or the reverse).

## Check

Type: Script

The file list in `conflicts.md` equals the output of `git diff --name-only --diff-filter=U`, and
`git rev-parse -q --verify MERGE_HEAD` succeeds (a merge is in progress). Write
`output/check.md`: `pass` or `fail: <why>`.
