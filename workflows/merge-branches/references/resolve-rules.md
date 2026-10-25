# Conflict Resolution Rules — how to settle each kind of conflict

Read in `03_resolve` for every conflicted file.

## Regenerate, never hand-merge

| File | Do this |
|---|---|
| `backend/package-lock.json`, `frontend/package-lock.json` | Merge `package.json` first, then `cd backend && npm install` (or `frontend`) |
| `map/**/_index.md` | Take either side, then rerun `python3 -I map/_tools/index.py <folder>` |
| `frontend/dist/`, `frontend/dev-dist/`, `backend/coverage/` | Build output: take neither side's content; rebuild or delete |

## Code

- Keep both sides' intent. Read each side's commits for the file (`git log <base>..<side> -- <file>`)
  and say in one line what each side wanted.
- Never drop a test from either side. If both sides changed one test, keep both cases.
- When both sides changed the same function in incompatible ways, stop and ask Esrom.

## Map cards and docs

- Keep the claim that matches the merged code; re-check its `path:line`.
- `verified:` keeps the newer of the two. If the code under the card changed on both sides,
  re-check every citation against the merged code first.
- A Known defect fixed on one side stays removed.

## Never

- Never resolve with `git checkout --ours` or `--theirs` on a whole file without listing what
  the other side loses.
- Never commit a file that still holds `<<<<<<<`, `=======` or `>>>>>>>` markers.
