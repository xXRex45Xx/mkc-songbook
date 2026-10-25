# 04_commit — commit and push the change

One job: commit exactly the inventoried files and push the branch.

## Inputs

- Working (this run): `workflows/review-commit/01_inventory/output/changes.md`
- Working (this run): `workflows/review-commit/03_review/output/review.md`
- Reference (every run): the session's commit attribution rule (Co-Authored-By line)

Do NOT load: source files, `map/`, other workflows.

## Process

1. If `changes.md` or `03_review/output/check.md` is missing or not `pass`, stop and say
   which. Create `output/` if it does not exist.
2. If the current branch is `main`, stop and ask Esrom which branch to use.
3. Stage only the commit list: `git add -- <paths>`. Never `git add -A`.
4. Write the message: a conventional prefix (`fix:`, `feat:`, `docs:`, `chore:`, `refactor:`,
   `test:`), a subject under 72 characters, a body saying what changed and why (from
   `changes.md`), any should-fix findings left open (from `review.md`), then the attribution
   line.
5. Commit with that message, then `git push origin HEAD`.

## Outputs

- `commit.md` -> `output/`: the hash, the message, the files committed.

## Check

Type: Script

All true: `git diff --cached --quiet` exits 0; `git log -1 --name-only` lists the commit list;
`git status -sb` shows no `ahead` or `behind`. Write `output/check.md`: `pass` or
`fail: <which>`.
