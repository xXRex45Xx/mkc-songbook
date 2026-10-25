---
type: object
cluster: data-model
universe: live
status: verified
verified: 2026-10-25 @ 88be3c5+uncommitted
entity: backend/models/login-attempt.model.js
code-name: LoginAttempt
description: Failed password attempts per account or client key; five in 15 minutes makes the next login need a captcha.
---

# LoginAttempt

A counter of failed password logins for one client. Model `LoginAttemptModel`, collection
`loginattempts`.

## Why this shape

Counters live in MongoDB, not process memory, so they survive a restart and are shared by every
API instance. The window is a TTL index on `createdAt` (15 minutes from the first failure), so
there is no cleanup job. A login attempt has up to three keys: `account:<email>`, so guesses
spread over many clients still add up; `anon:<ip>:<user-agent hash>`, always; and
`device:<token hash>` when it sends a device cookie. Counting the anon key too means clearing the
cookie does not reset the count. The account key never locks anyone out: it only demands a
captcha, and a known device skips it.

## Shape

- `key` String, required, unique. `backend/models/login-attempt.model.js:15`
- `count` Number, default 0. `:16`
- `createdAt` Date, `expires: 900` seconds (TTL), set on the first failure. `:17`

## Connected to

- **read-by:** [auth](../../processes/auth.md): `assessLoginRisk` reads the larger count of the
  client's keys; `recordLoginFailure` increments; `recordLoginSuccess` deletes them.

## If you change this

- **Hits:** `backend/middlewares/login-risk.middleware.js` (`CAPTCHA_AFTER_FAILURES`, key
  builder), `backend/__tests__/routes/user.route.login-risk.test.js`.
- **Does not hit:** [User](user.md); a counter holds the email, not an account id, so it also
  covers emails that do not exist.

## Surfaces

| Surface | Role |
|---|---|
| Password login (`POST /api/user/login`) | read, write |

## See

- Source: `backend/models/login-attempt.model.js`
