---
type: object
cluster: data-model
universe: live
status: verified
verified: 2026-10-25 @ 88be3c5+uncommitted
entity: backend/models/otp.model.js
code-name: OTP
description: One-time password for email verification and password reset; expires after 5 minutes or five wrong guesses.
---

# OTP

A short-lived code emailed to verify an address. Model `OTPModel`, collection `otps`.

## Why this shape

One document per email (`unique`), with a TTL index so MongoDB deletes it 5 minutes after
`createdAt`. Five wrong guesses delete it too, so a 6-digit code cannot be brute-forced inside its
5 minutes: `OTPModel.verifyCode` counts a wrong guess with one atomic update (parallel guesses
cannot pass the limit) and deletes the entry on the fifth. Saving it sends the email: the `pre("save")` hook calls `sendEmail`, so creating an
OTP and mailing it are one step.

## Shape

- `email` String, required, unique. `backend/models/otp.model.js:34`
- `otp` Number, required. `:41`
- `attempts` Number, default 0: wrong guesses so far, reset when the code is re-sent. `:49`
- `createdAt` Date, `expires: 300` seconds (TTL).
- `verifyCode(email, code)` static: true only for a matching code with attempts left. `:73`
- `pre("save")` hook emails the code. `:62`

## Connected to

- **joins:** [User](user.md) by email. Deleted after signup (`user.controller.js:138`) and
  after password reset (`:260`).

## If you change this

- **Hits:** `backend/config/nodemailer.config.js` (SMTP), `backend/utils/otp.util.js`,
  `backend/middlewares/validate-otp.middleware.js`, `backend/controllers/user.controller.js`
  (`verifyOTP`, `registerOTP`),
  `backend/__tests__/models/otp.model.test.js`.
- **Does not hit:** the frontend stores — no OTP is cached on the device.

## Surfaces

| Surface | Role |
|---|---|
| Sign-up and forgot-password forms | write (request), read (verify) |

## See

- Source: `backend/models/otp.model.js`
