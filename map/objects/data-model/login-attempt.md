---
type: object
cluster: data-model
universe: live
status: verified
verified: 2026-11-15 @ fb6da42
entity: backend/models/login-attempt.model.js
code-name: LoginAttempt
description: Login attempts per account or client key, counted before the password is checked; five in 15 minutes makes the next login need a captcha.
---

# LoginAttempt

A counter of password login attempts for one client or account. An attempt is counted before its
password is checked, so once the checks settle the count is the failed attempts. Model
`LoginAttemptModel`, collection `loginattempts`.

## Why this shape

Counters live in MongoDB, not process memory, so they survive a restart and are shared by every
API instance. The window is a TTL index on `createdAt` (15 minutes from the first counted attempt),
so there is no cleanup job. A login attempt has up to three keys: `account:<email>`, so guesses
spread over many clients still add up; `anon:<ip>:<user-agent hash>`, always; and
`device:<token hash>` when it sends a device cookie. Counting the anon key too means clearing the
cookie does not reset the count. The account key never locks anyone out: it only demands a
captcha, and a known device skips it.

The count moves before the password is tried, in the same atomic step as the read: `assessLoginRisk`
bumps every key with one `findOneAndUpdate` and decides on the number that returns. Reading the
counters first and writing the failure after the slow password check let a burst of parallel
guesses all read a count under the limit and skip the captcha. A request the captcha gate turns
away, or a server error in the password step, gives its attempt back; a success deletes the
counters.

## Shape

- `key` String, required, unique. `backend/models/login-attempt.model.js:17`
- `count` Number, default 0. `:18`
- `createdAt` Date, `expires: 900` seconds (TTL), set on the first counted attempt. `:19`

## Connected to

- **read-by:** [auth](../../processes/auth.md): `assessLoginRisk` (`backend/middlewares/login-risk.middleware.js:124`)
  reserves one attempt on each of the client's keys and uses the largest count that returns;
  `releaseLoginAttempt` (`:98`) gives it back when the password was never checked;
  `recordLoginSuccess` (`:179`) deletes the keys.

## If you change this

- **Hits:** `backend/middlewares/login-risk.middleware.js` (`CAPTCHA_AFTER_FAILURES`, key
  builder, reservation), `backend/middlewares/local-auth.middleware.js` (releases on a server error), `backend/__tests__/routes/user.route.login-risk.test.js`,
  `backend/jest/helpers/integration.helper.js` (`resetDatabase` clears counters by model name).
- **Does not hit:** [User](user.md); a counter holds the email, not an account id, so it also
  covers emails that do not exist.

## Surfaces

| Surface | Role |
|---|---|
| Password login (`POST /api/user/login`) | read, write |

## See

- Source: `backend/models/login-attempt.model.js`
