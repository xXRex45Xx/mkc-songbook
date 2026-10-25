# 01_prepare — confirm branches, preview conflicts

One job: pin down exactly what merges into what, and predict conflicts without touching any
branch.

## Inputs

- Working (this run): the source and target branch names from Esrom
- Reference (every run): `workflows/merge-branches/references/resolve-rules.md`

Do NOT load: file contents, `map/`, other stages.

## Process

1. If source or target is not named, stop and ask.
   Name the run: `{run}` = `<YYYYMMDD-HHMM>-<task-slug>` (`workflows/CONTEXT.md` §5); say it
   in chat. Create `output/{run}/`.
2. Confirm the working tree is committed and pushed (`git status -sb`). If not, run
   `workflows/review-commit/` first.
3. `git fetch origin`. Record both tips (`git rev-parse <target> <source>`) and the merge base
   (`git merge-base <target> <source>`).
4. If `git merge-base --is-ancestor <source> <target>` exits 0, the target already has the
   source: write that and stop the run as Done.
5. List commits on each side since the base (`git log --oneline <base>..<side>`) and files
   changed on both sides.
6. Preview conflicts read-only: `git merge-tree --write-tree --name-only <target> <source>`.

## Outputs

- `merge-plan.md` -> `output/{run}/`: source → target, both tips, base, commits each side, files
  changed on both sides, predicted conflicts, and the abort command
  (`git merge --abort`, target tip to return to).

## Check

Type: Person

Esrom reads `merge-plan.md` and confirms the direction (source → target) and that pushing the
target afterwards is wanted. Write `output/{run}/check.md`: `pass — approved by Esrom` or
`fail: <reason given>`.
