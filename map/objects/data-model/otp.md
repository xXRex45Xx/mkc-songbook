---
type: object
cluster: data-model
universe: live
status: verified
verified: 2026-11-15 @ a949c43
entity: backend/models/otp.model.js
code-name: OTP
description: One-time password for email verification and password reset; expires after 5 minutes or five wrong guesses; a per-email limiter caps requests and guesses across codes.
---

# OTP

A short-lived code emailed to verify an address. Model `OTPModel`, collection `otps`.

## Why this shape

One document per email (`unique`), with a TTL index so MongoDB deletes it 5 minutes after
`createdAt`. Five wrong guesses delete it too, so a 6-digit code cannot be brute-forced inside its
5 minutes: `OTPModel.verifyCode` counts a wrong guess with one atomic update (parallel guesses
cannot pass the limit) and deletes the entry on the fifth. Saving it sends the email: the `pre("save")` hook calls `sendEmail`, so creating an
OTP and mailing it are one step. `registerOTP` awaits the save, so a mail failure reaches the client as an error, not `success: true`.

The five-guess limit is per code, and a code dies in 5 minutes, so on its own it would give an
attacker a fresh five guesses with every new code. [OTPLimit](otp-limit.md) counts per email
across codes: `registerOTP` asks `OTPLimitModel.claimRequest` first (at most 5 codes and at
most 10 wrong guesses per email per hour, else 429), and `verifyCode` reports every wrong guess to
it. A re-sent code keeps the wrong guesses already made, and the entry also dies when the email
reaches the guess cap. `email` is lowercased, so case variants of one address share an entry and
a counter.

## Shape

- `email` String, required, unique, lowercase. `backend/models/otp.model.js:39`
- `otp` Number, required. `:47`
- `attempts` Number, default 0: wrong guesses on this code; a re-sent code keeps them. `:51`
- `createdAt` Date, `expires: 300` seconds (TTL). `:55`
- `verifyCode(email, code)` static: true only for a matching code with attempts left; a wrong guess is also counted in [OTPLimit](otp-limit.md). `:78`
- `pre("save")` hook emails the code. `:113`

## Connected to

- **joins:** [User](user.md) by email. Deleted after signup (`user.controller.js:149`) and
  after password reset (`:302`).
- **owned-by:** none; [OTPLimit](otp-limit.md) is its sibling and outlives it (1 hour vs 5 minutes).

## If you change this

- **Hits:** [OTPLimit](otp-limit.md), `backend/config/nodemailer.config.js` (SMTP), `backend/utils/otp.util.js`,
  `backend/middlewares/validate-otp.middleware.js`, `backend/controllers/user.controller.js`
  (`verifyOTP`, `registerOTP`),
  `backend/__tests__/models/otp.model.test.js`, `backend/jest/helpers/integration.helper.js`
  (`resetDatabase` clears OTPs and waits for the unique-email index).
- **Does not hit:** the frontend stores — no OTP is cached on the device.

## Surfaces

| Surface | Role |
|---|---|
| Sign-up and forgot-password forms | write (request), read (verify) |

## See

- Source: `backend/models/otp.model.js`
