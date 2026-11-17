# {workflow-name} — {the job in five words}

Trigger: {when to run this, in one sentence}.

## Stages

| Stage | Job |
|---|---|
| `01_{name}` | {five words} |
| `02_{name}` | {five words} |
| `03_{name}` | {five words} |

Each stage's own `CONTEXT.md` holds its inputs, outputs and check. Nothing moves to the next
stage until the current check passes.

## Done

{What exists when the run is finished: a merged change, a pushed tag, a file.}

## Factory

Every stage may read these; none copies them:

- `docs/conventions.md`
- `map/effects/CONTEXT.md`
- {workflow-only rules: `workflows/{workflow-name}/references/{file}.md`}

Status is whatever exists: a stage is done for a run when its `output/{run}/` holds an artifact and
its `check.md`, if any, says `pass`.
