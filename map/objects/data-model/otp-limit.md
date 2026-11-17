---
type: object
cluster: data-model
universe: live
status: verified
entity: backend/models/otp-limit.model.js
code-name: OTPLimit
description: Code requests and wrong guesses per email over one hour; outlives any single OTP so a new code never resets the guess count.
verified: 2026-11-15 @ a949c43
---

# OTPLimit

A counter of code requests and wrong guesses for one email. Model `OTPLimitModel`, collection
`otplimits`.

## Why this shape

An [OTP](otp.md) lives 5 minutes and dies after five wrong guesses, so nothing about an email
survived a re-sent code and a guesser got five fresh tries per request. This document is created
by the first code request of a window and deleted by a TTL index one hour later, so it outlives
every code. The limits are `MAX_OTP_REQUESTS` = 5 and `MAX_OTP_FAILURES` = 10 per window
(`backend/models/otp-limit.model.js:17`, `:20`): about 10 guesses in 900000 per email per hour.
The limit holds per email, not per client, so it also bounds the mail sent to one address. The
price is that anyone can lock a known email out of sign-up and password reset until the window
ends; there is no per-client exception.

## Shape

- `email` String, required, unique, lowercase. `backend/models/otp-limit.model.js:26`
- `requests` Number, default 0: codes requested in the window. `:27`
- `failures` Number, default 0: wrong guesses over every code of the window. `:28`
- `createdAt` Date, `expires: 3600` seconds (TTL), set on the first request. `:29`
- `claimRequest(email)` static: one atomic upsert guarded by both limits; false when the unique
  index refuses it. It first deletes a window that has run out, because Mongo's TTL monitor
  lags by up to a minute. `:43`
- `recordFailure(email)` static: counts a wrong guess, true when the email is now locked. `:78`

## Connected to

- **owns:** none.
- **joins:** [OTP](otp.md) by email; `registerOTP` calls `claimRequest`, `OTPModel.verifyCode`
  calls `recordFailure`.
- **looks-like-but-is-not:** [LoginAttempt](login-attempt.md): that counter only demands a captcha
  and never refuses; this one answers 429.

## If you change this

- **Hits:** [OTP](otp.md), `backend/controllers/user.controller.js` (`registerOTP`, the 429),
  `backend/__tests__/models/otp-limit.model.test.js`,
  `backend/__tests__/routes/user.route.otp-attempts.test.js`,
  `backend/jest/helpers/integration.helper.js` (`resetDatabase` clears it by model name).
  `claimRequest` relies on MongoDB 4.2+ retrying a duplicate-key error on upsert.
- **Does not hit:** [User](user.md); the counter holds an email, so it also covers emails with
  no account.

## Surfaces

| Surface | Role |
|---|---|
| Sign-up and forgot-password forms (`POST /api/user/otp`, `/verify-otp`) | write |

## See

- Source: `backend/models/otp-limit.model.js`
