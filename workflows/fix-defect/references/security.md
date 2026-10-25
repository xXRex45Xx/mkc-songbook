# Security Fix Rules — extra rules when a defect is a security issue

Read when `triage.md` says `security: yes`.

## Severity

| Level | Means | Example |
|---|---|---|
| Critical | Anyone can take over accounts or read private data, no login needed | (hypothetical) a JWT accepted without a valid signature |
| High | A signed-in or partly trusted user gains rights they should not have | Google token audience not checked (`map/processes/auth.md`) |
| Medium | Abuse needs effort or luck | No rate limit on OTP guesses (`map/processes/auth.md`) |
| Low | Leaks detail, no direct harm | An error message names a server path |

Fix Critical and High before any other work.

## Rules

- Never paste a secret, token, password, OTP or real user email into any `output/` file, test,
  fixture or commit message. Use the factories in `backend/jest/factories/`.
- The commit message says what was fixed, not how to exploit it.
- A test proves the fix: it fails before and passes after (stage 02 and 03).
- Dependency issues: run `cd backend && npm audit` and `cd frontend && npm audit`; fix with
  the smallest version bump that clears the advisory, and record the advisory id in `fix.md`.
- If the fix changes how tokens or sessions work, say in `fix.md` whether users must sign in
  again.
