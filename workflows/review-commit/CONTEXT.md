# review-commit — check, review, commit and push

Trigger: Esrom says to commit, or another workflow hands off its finished change.

## Stages

| Stage | Job |
|---|---|
| `01_inventory` | List exactly what gets committed |
| `02_checks` | Run tests, lint, build, links |
| `03_review` | Review the diff for defects |
| `04_commit` | Commit and push the change |

Each stage's own `CONTEXT.md` holds its inputs, outputs and check. Nothing moves to the next
stage until the current check passes.

## Done

One new commit on the current branch, pushed, and `git status -sb` shows the branch even with
`origin`.

## Factory

Every stage may read these; none copies them:

- `docs/conventions.md`
- `backend/TESTING.md`
- `map/effects/CONTEXT.md`
- The harness's built-in `code-review` skill (stage 03 only; not stored in this repo)

This workflow is Esrom's commit-first rule in action: it never runs another workflow first.

Status is whatever exists: a stage is done for a run when its `output/{run}/` holds an artifact and
its `check.md` says `pass`.
