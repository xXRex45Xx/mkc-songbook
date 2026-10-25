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

1. If an input is missing or empty, stop and say which.
2. {The transform. A step that is code names its command, run from the repo root:
   Run `cd backend && npm test`.}
3. {Hard limits worth restating: length, count, format.}

## Outputs

- `{artifact}.md` -> `output/`

## Check

{One concrete act: a person reads X / `{command}` passes / a script confirms Y. A check that is
not a person writes `output/check.md`, first line `pass` or `fail: <why>`.}
