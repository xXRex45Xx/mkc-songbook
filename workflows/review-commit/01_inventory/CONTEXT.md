# 01_inventory — list exactly what gets committed

One job: decide which changed files go into this commit, and catch anything that must not.

## Inputs

- Working (this run): the git working tree (`git status`)
- Working (optional): the handing-off workflow's last output, e.g.
  `workflows/fix-defect/04_update-map/output/{run}/map-update.md`
- Reference (every run): `docs/conventions.md`

Do NOT load: file contents beyond the diff, `map/` cards, other workflows' stages.

## Process

1. If the working tree has no changes, stop and say so. If another workflow handed off, use
   its `{run}`; otherwise name a new one (`workflows/CONTEXT.md` §5) and say it in chat.
   Create `output/{run}/`.
2. Run `git status --short` and `git diff HEAD --stat`, and list untracked files with
   `git ls-files -o --exclude-standard`.
3. Sort every path into **commit** or **leave out**, with a reason for each left-out path.
   Group commit paths by area: backend, frontend, map, docs, workflows, other.
4. If another session or person may own a change (it is not part of this task), list it under
   **leave out** and name it in the summary.

## Outputs

- `changes.md` -> `output/{run}/`: areas touched, the commit list, the leave-out list with reasons,
  and a one-paragraph summary of the change.

## Check

Type: Script

Run `python3 -I workflows/_tools/inventory_check.py --run {run} <commit list>`. It fails on a tracked
`.env`, a secret pattern in the diff, or a file over 5 MB, and writes `output/{run}/check.md` itself.
Exit 0 is `pass`.
