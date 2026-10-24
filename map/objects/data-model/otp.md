---
type: object
cluster: data-model
universe: live
status: verified
verified: 2026-10-24 @ 9db0d0c
entity: backend/models/otp.model.js:33
code-name: OTP
description: One-time password for email verification and password reset; expires after 5 minutes.
---

# OTP

A short-lived code emailed to verify an address. Model `OTPModel`, collection `otps`.

## Why this shape

One document per email (`unique`), with a TTL index so MongoDB deletes it 5 minutes after
`createdAt`. Saving it sends the email: the `pre("save")` hook calls `sendEmail`, so creating an
OTP and mailing it are one step.

## Shape

- `email` String, required, unique. `backend/models/otp.model.js:34`
- `otp` Number, required. `:41`
- `createdAt` Date, `expires: 300` seconds (TTL). `:45`
- `pre("save")` hook emails the code. `:62`

## Connected to

- **joins:** [User](user.md) by email. Deleted after signup (`user.controller.js:138`) and
  after password reset (`:260`).

## Known defects

- `registerOTP` re-sends by calling `current.save()` without `await`, so a mail failure is not
  caught and the client still gets `success: true`.
  `backend/controllers/user.controller.js:52`

## If you change this

- **Hits:** `backend/config/nodemailer.config.js` (SMTP), `backend/utils/otp.util.js`,
  `backend/middlewares/validate-otp.middleware.js`, `backend/controllers/user.controller.js`,
  `backend/__tests__/models/otp.model.test.js`.
- **Does not hit:** the frontend stores — no OTP is cached on the device.

## Surfaces

| Surface | Role |
|---|---|
| Sign-up and forgot-password forms | write (request), read (verify) |

## See

- Source: `backend/models/otp.model.js`
