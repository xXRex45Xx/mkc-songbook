# 03_resolve — resolve each conflict with reasons

One job: settle every conflicted file so both sides' intent survives, and explain each choice.

## Inputs

- Working (this run): `workflows/merge-branches/01_prepare/output/merge-plan.md`
- Working (this run): `workflows/merge-branches/02_merge/output/conflicts.md`
- Reference (every run): `workflows/merge-branches/references/resolve-rules.md`
- Reference (every run): `docs/conventions.md`
- Reference (code or map conflicts): `map/effects/CONTEXT.md`

Do NOT load: files that do not conflict, old runs.

## Process

1. If `conflicts.md` is missing or its check is not `pass`, stop and say which. Create
   `output/` if it does not exist.
2. If `conflicts.md` says `none`, write `no conflicts` to `resolution.md` and go to the check.
3. For each file: read both sides' commits for it, write what each side wanted, then resolve by
   `resolve-rules.md`. Regenerate generated files instead of editing them.
4. If a conflict needs a product decision, stop and ask Esrom; do not guess.
5. `git add <file>` for each file once resolved. Do not commit.

## Outputs

- `resolution.md` -> `output/`: per file, each side's intent, the result chosen, and what (if
  anything) one side loses.

## Check

Type: Person (Agent when `conflicts.md` says `none`)

Esrom reads `resolution.md` and approves each file's resolution. With no conflicts, the agent
confirms `resolution.md` says `no conflicts` and writes `pass`. Write `output/check.md`:
`pass — approved by Esrom`, `pass`, or `fail: <reason given>`.
