# 02_implement — build it, lint and build clean

One job: make the change `spec.md` plans, and nothing more.

## Inputs

- Working (this run): `workflows/add-frontend-feature/01_spec-and-plan/output/{run}/spec.md`
- Reference (every run): `docs/conventions.md`
- Reference (every run): `frontend/STYLE_GUIDE.md` and `frontend/TEMPLATES.md`
- Reference (every run): `workflows/add-frontend-feature/references/docs-lookup.md`
- Reference (UI or visual stages only): `.claude/skills/impeccable/SKILL.md` — run the skill

Do NOT load: `map/` cards (stage 04's job), backend source, earlier runs.

## Process

1. If `spec.md` is missing or its check is not `pass`, stop and say which. Create `output/{run}/`.
2. Change only the files "Files to change, in order" names, in that order. If the feature needs
   another file, stop and ask Esrom to amend `spec.md`.
3. For every component, page, style or theme edit, run the `impeccable` skill: its new-work playbook
   for a new surface or screen, and the matching command (`layout`, `clarify`, `adapt`, `harden`,
   `polish`) for a change inside an existing surface. Honor its craft floor. Build the
   whole feature, then one batched inspection of desktop and mobile; fix everything it shows in one
   batch; at most one more round. Use the Flowbite theme files in `frontend/src/config/` and the
   Tailwind palette before adding new styles.
4. Follow `docs/conventions.md`. Every new or changed public function and component carries JSDoc
   per `frontend/STYLE_GUIDE.md`. Add new environment variables to `frontend/.env.example`.
5. Before you write each library call the code adds or changes, fetch its current docs with the
   `context7-mcp` skill as `references/docs-lookup.md` says, for the version in
   `frontend/package.json`.
6. Do not touch the backend. Do not run the `impeccable` live mode.

## Outputs

- `implement.md` -> `output/{run}/`: files changed and why each, the impeccable commands run, new
  environment variables, anything left out of scope, and `## Docs consulted`.

## Check

Type: Script

All exit 0, in order:

1. `cd frontend && npm run lint`
2. `cd frontend && npm run build`
3. `{ git diff HEAD --name-only; git ls-files -o --exclude-standard; } | sort -u`: every path listed is in
   the spec's "Files to change" list or is `frontend/.env.example`. Any other path fails the check.
4. `grep -q "## Docs consulted" output/{run}/implement.md` (a table, or "none" with its reason).

Write `output/{run}/check.md`: each command with its exit code, then `pass` or `fail: <which>`.
