# MKC Songbook Workflows — catalog

Repeatable jobs on this repo (fix a bug, release, add content), each written as a pipeline of
numbered, checked stages. This file routes only. Rules for writing one: [CONTEXT.md](CONTEXT.md).

## Where things live

| Path | Holds |
|---|---|
| `<workflow>/CONTEXT.md` | That workflow in one screen: trigger, stages, done |
| `<workflow>/NN_<stage>/CONTEXT.md` | One stage's contract: inputs, process, outputs, check |
| `<workflow>/NN_<stage>/output/<run>/` | One run's artifacts and `check.md`; `<run>` = `<YYYYMMDD-HHMM>-<task-slug>` |
| `<workflow>/references/` | Rules only that workflow uses |
| [_templates/](_templates/) | `workflow-CONTEXT.md`, `stage-CONTEXT.md`: copy to start |
| `_tools/` | Scripts stage checks call, e.g. `inventory_check.py` |

Repo-wide reference files every workflow may read are listed in
[CONTEXT.md §6](CONTEXT.md#6-factory-and-product); they live outside this folder.

## Workflows

| Workflow | Use it when |
|---|---|
| [fix-defect](fix-defect/CONTEXT.md) | A bug, security issue or map Known defect needs fixing |
| [review-commit](review-commit/CONTEXT.md) | Esrom says commit, or another workflow hands off |
| [merge-branches](merge-branches/CONTEXT.md) | One branch must be merged into another |

Add one row here when a workflow is added.

## Route by what just happened

| If | Go to | Then stop at |
|---|---|---|
| starting a run | the workflow's `CONTEXT.md`, then `01_*/CONTEXT.md`; name a new `{run}` | stage 01's check |
| `output/{run}/check.md` says `pass` | the next numbered stage, same `{run}` | that stage's check |
| `output/{run}/check.md` says `fail: …` | fix that stage's output, re-run its check | the same check |
| asked for status | each stage's `output/{run}/` and its `check.md`, in order | report what exists |
| writing or changing a workflow | [CONTEXT.md](CONTEXT.md) | the walk test there |

## The one rule

Nothing moves to the next stage until the current stage's check passes.
