---
type: process
status: verified
verified: 2026-10-25 @ 3d62afa+uncommitted
description: Sign-up by emailed code, password or Google sign-in, 30-day JWT on every request.
consumes: [../objects/data-model/user.md, ../objects/data-model/otp.md]
produces: [../objects/data-model/user.md, ../objects/local-db/users-store.md, ../objects/app-state/user-slice.md]
---

# auth

How a visitor gets an account and proves who they are on each request.

## Input → Movement → Output

An email (plus a code, a password, or a Google access token) goes to `/api/user`. The backend
checks it and signs a JWT `{ id }` valid for 30 days. The frontend keeps the token in
`localStorage._s` and sends it as `Authorization: Bearer` on every protected call.

## Why this shape

Sign-up proves the email first with an [OTP](../objects/data-model/otp.md), so accounts are
never created for addresses nobody controls. Tokens are stateless JWTs, so there is no session
store and no logout on the server: a token works until it expires.

## Steps

Sign-up:

1. `POST /api/user/otp` — refuses a known email (`backend/middlewares/check-user-exists.middleware.js:28`),
   then creates or refreshes the OTP; saving it sends the email
   (`backend/controllers/user.controller.js:45`, `backend/models/otp.model.js:62`).
2. `POST /api/user/verify-otp` — checks the code only; nothing is created
   (`backend/controllers/user.controller.js:80`).
3. `POST /api/user` — checks the code again (`backend/middlewares/validate-otp.middleware.js:24`),
   hashes the password with bcrypt cost 10, creates the [User](../objects/data-model/user.md)
   with role `public`, returns user + token, deletes the OTP
   (`backend/controllers/user.controller.js:115`).

Password login: `POST /api/user/login` — Passport local strategy; a user with no password
(Google-only) always fails (`backend/config/passport.config.js:48`); token signed in
`backend/middlewares/local-auth.middleware.js:32`.

Google: the browser gets a Google access token; `POST /api/user/google/callback` asks Google
`tokeninfo` and refuses a token whose `aud`/`azp` is not `GOOGLE_CLIENT_ID`, then calls `userinfo`
and refuses an email that is not `email_verified`, finds or creates the user by email, returns a
token (`backend/controllers/user.controller.js:189`).

Rate limits (failed requests only; successes do not count): every route above except
`current-user` passes `authIpLimiter` (30 per 15 minutes per address); code and password routes also pass `authEmailLimiter` (10 per 15 minutes per email) and
`/otp` passes `otpRequestLimiter` (5 per 15 minutes per email), all in
`backend/middlewares/rate-limit.middleware.js`. Counters live in process memory: they reset on
restart and are not shared between instances. Behind a proxy set `TRUST_PROXY` (hop count) in
`backend/index.js`, or all clients share one address.

Password reset: `POST /api/user/otp?forgotPassword=true` (requires a known email), then
`PUT /api/user/reset-password` with the code (`backend/routes/user.route.js:294`).

Every protected request: `passport.authenticate("jwt")` loads the user by `payload.id`
(`backend/config/passport.config.js:77`); `roleBasedAuthorization` gates admin routes
(`backend/routes/user.route.js:74`).

Frontend: forms save the token (`frontend/src/components/login-form.component.jsx:176`,
`create-password-form.component.jsx:197`, `google-link.component.jsx:29`). The root loader calls
`GET /api/user/current-user`, fills the [user slice](../objects/app-state/user-slice.md) and the
[users store](../objects/local-db/users-store.md); on 401 it clears both and the token
(`frontend/src/App.jsx:94`).

## Known defects

- Login returns no `favorites`, unlike sign-up and Google sign-in.
  `backend/middlewares/local-auth.middleware.js:39`

## If you change this

- **Hits:** [User](../objects/data-model/user.md), [OTP](../objects/data-model/otp.md),
  `backend/config/passport.config.js`, `backend/middlewares/local-auth.middleware.js`,
  `validate-otp.middleware.js`, `check-user-exists.middleware.js`,
  `frontend/src/utils/api/user-api.util.js`, the auth form components, `frontend/src/App.jsx`.
  Changing the token claim or secret signs every user out.
- **Does not hit:** [pendingWrites store](../objects/local-db/pending-writes-store.md) logic —
  but queued writes carry the old token in their headers.

## Surfaces

| Surface | Role |
|---|---|
| Visitor (sign-up, login, Google, forgot password) | starts it |
| Every protected API route | checks the token |

## See

- Objects: [User](../objects/data-model/user.md), [OTP](../objects/data-model/otp.md),
  [user slice](../objects/app-state/user-slice.md), [users store](../objects/local-db/users-store.md)
- Source: `backend/routes/user.route.js`
