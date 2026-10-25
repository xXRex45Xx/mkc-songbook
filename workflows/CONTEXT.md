# Workflow Rules — how to write a workflow (pipeline) here

Read this before adding or changing anything under `workflows/`. It follows ICM (Interpretable
Context Methodology): the folder structure is the process, and every file is plain markdown a
person can open and edit.

## 1. Build one only when it pays

- Build a workflow for a job that has already repeated and has a point where someone stops to
  check before going on.
- A job done once stays in chat. A job with no checks between steps is one saved prompt or a
  skill, not a folder.
- Three real stages beat seven imagined ones. Never create a stage folder for a step that does
  not exist yet.

## 2. Shape

```
workflows/<workflow-name>/
├─ CONTEXT.md            the workflow in one screen (copy _templates/workflow-CONTEXT.md)
├─ references/           optional: rules only this workflow uses
├─ 01_<stage-name>/
│  ├─ CONTEXT.md         the stage contract (copy _templates/stage-CONTEXT.md)
│  ├─ examples/          optional: one real input and one good output
│  └─ output/            this run's artifacts and check.md
└─ 02_<stage-name>/ …
```

- Folder names: workflows `kebab-case`; stages `NN_kebab-case` (`01_locate`). The number is
  the order.
- The workflow's `CONTEXT.md` is its entry file. It does not get its own `AGENTS.md`, because
  [AGENTS.md](AGENTS.md) in this folder is the one catalog for all workflows.
- First line of every file is a `# ` heading naming the file and its job.

## 3. The workflow `CONTEXT.md`

It holds four things and nothing else:

1. **Trigger:** when to run it, in one sentence.
2. **Stages:** a table, one row per stage folder: name and its job in five words.
3. **Done:** what exists when the run is finished (a merged change, a pushed tag, a file).
4. **Factory:** the reference files every stage may read, as links.

## 4. The stage contract

Every stage `CONTEXT.md` has these sections, in this order:

- **Inputs.** Exact backticked paths from the repo root, split into *Working (this run)* (the
  previous stage's `output/`) and *Reference (every run)*.
- **Do NOT load.** What an eager agent would wrongly pull in: other stages, old runs, all of
  `map/`.
- **Process.** Numbered and short. Step 1 is always "If an input is missing or empty, stop and
  say which." A step that is code names its command, run from the repo root.
- **Outputs.** Each file and where it goes, normally `output/`.
- **Check.** Exactly one, as a concrete act: a person reads X, `npm test` passes, a script
  confirms Y. A check that is not a person writes `output/check.md`; its first line is `pass`
  or `fail: <why>`.

Rules live in reference files. A contract points at them; it never restates them.

## 5. Handoff, stop and status

- One stage's `output/` is the next stage's working input. A person can edit any output file
  before the next stage reads it.
- A `fail` stops the run at that stage. Fix the output or the code, then re-run that check.
- Status is what exists on disk: which `output/` folders hold artifacts, and what each
  `check.md` says. Never keep status in a separate tracker.
- A new run overwrites `output/`. A run's outputs are committed with the change they produced,
  so git history keeps old runs.

## 6. Factory and product

- **Factory (stable, every run):** `docs/conventions.md`, `map/` (cards and
  `map/effects/CONTEXT.md`), `backend/TESTING.md`, `PRODUCT.md`, `DESIGN.md`, the
  `STYLE_GUIDE.md` and `TEMPLATES.md` files, and the `impeccable` skill
  (`.claude/skills/impeccable/SKILL.md`). Link to them; never copy them into a workflow.
- **Workflow-only rules** go in `<workflow>/references/`.
- **Product (new every run):** the files in each stage's `output/`, and the code change itself.

## 7. Repo rules every workflow obeys

- **Before the first stage changes anything,** the working tree is committed and pushed.
- **A workflow that changes code** has a stage or step that opens `map/effects/CONTEXT.md` for
  what the change hits, then updates every map card it made untrue: fix or remove the Known
  defect, refresh citations, set `verified` to today and the new commit.
- **A stage that changes UI or visual design** (components, pages, styling, themes) runs the
  `impeccable` skill for that work and lists `.claude/skills/impeccable/SKILL.md` under its
  Reference inputs.
- **Commits and pushes** happen only at the stage that says so, and only after its check passes.

## 8. Size

One stage's full load (this repo's root `AGENTS.md`, the stage contract, its references and its
inputs) stays under about 8,000 tokens. If it grows, split the stage or narrow its Inputs.

## 9. Let it harden

- A check that never fails becomes a script. A stage nobody edits folds into the next one.
- A contract that keeps growing splits into two stages.
- Keep `examples/` current: one input and one output from a run worth copying.

## 10. Add or change a workflow

1. Copy `workflows/_templates/workflow-CONTEXT.md` to `workflows/<name>/CONTEXT.md`, and
   `workflows/_templates/stage-CONTEXT.md` into each stage folder. Fill every `{…}`.
2. Add one row to the Workflows table in [AGENTS.md](AGENTS.md).
3. Walk test: open the root `AGENTS.md` cold. Can you reach the workflow's stage 01 contract
   through `workflows/AGENTS.md` and the workflow's `CONTEXT.md`, with no other reads? Does each
   contract name exact inputs, one job, outputs and one check?
4. Run `python3 -I map/_tools/links.py . --skip node_modules dist dev-dist coverage`. It must
   report 0 broken.
