# {NN}_{stage-name} — {the job in five words}

One job: {the single thing this stage does}.

## Inputs

- Working (this run): `workflows/{workflow-name}/{prev-stage}/output/{file}`
- Reference (every run): `docs/conventions.md`
- Reference (every run): `{map card or workflows/{workflow-name}/references/{file}.md}`
- Reference (UI or visual stages only): `.claude/skills/impeccable/SKILL.md` — run the skill
- Example (optional): `workflows/{workflow-name}/{NN}_{stage-name}/examples/`

Do NOT load: {other stages' references, earlier runs, all of `map/`}.

## Process

1. If an input is missing or empty, stop and say which. Create `output/{run}/`.
2. {The transform. A step that is code names its command, run from the repo root:
   Run `cd backend && npm test`.}
3. {Hard limits worth restating: length, count, format.}

## Outputs

- `{artifact}.md` -> `output/{run}/`

## Check

Type: {Person | Script | Agent}

{One concrete act: Esrom reads X and approves / `{command}` exits 0 / the agent confirms each
rubric item. Write `output/{run}/check.md`, first line `pass` or `fail: <why>`.}
