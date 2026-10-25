---
type: process
status: verified
verified: 2026-10-25 @ b7f940a
description: Sign-up by emailed code, password or Google sign-in, 30-day JWT on every request.
consumes: [../objects/data-model/user.md, ../objects/data-model/otp.md, ../objects/data-model/device.md, ../objects/data-model/login-attempt.md]
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
   (`backend/controllers/user.controller.js:45`, `backend/models/otp.model.js:108`).
2. `POST /api/user/verify-otp` — checks the code only; nothing is created
   (`backend/controllers/user.controller.js:81`).
3. `POST /api/user` — checks the code again (`backend/middlewares/validate-otp.middleware.js:26`),
   hashes the password with bcrypt cost 10, creates the [User](../objects/data-model/user.md)
   with role `public`, returns user + token, deletes the OTP
   (`backend/controllers/user.controller.js:114`).

Password login: `POST /api/user/login` — risk check (below), then Passport local strategy; a user with no password
(Google-only) always fails (`backend/config/passport.config.js:49`); token signed in
`backend/middlewares/local-auth.middleware.js:36`.

Google: the browser gets a Google access token; `POST /api/user/google/callback` asks Google
`tokeninfo` and refuses a token whose `aud`/`azp` is not `GOOGLE_CLIENT_ID`, then calls `userinfo`
and refuses an email that is not `email_verified`, finds or creates the user by email, returns a
token (`backend/controllers/user.controller.js:188`).

Guess limits:

- Every `/api` request passes a per-address limiter (`RATE_LIMIT_MAX`, default 600 per 15
  minutes; `backend/middlewares/rate-limit.middleware.js`, mounted in `backend/index.js`).
  Audio streaming (`GET /api/song/:id/audio`, many 500 KB range requests per song) is counted
  instead by its own limiter (`AUDIO_RATE_LIMIT_MAX`, default 6000). Counters are in process
  memory, so they reset on restart and are not shared between instances. Behind a proxy set
  `TRUST_PROXY` (hop count), or all clients share one address. A throttled `POST
  /api/user/login` gets the same 400 "Invalid username or password." as a wrong password, and
  every login response carries no `RateLimit`, `RateLimit-Policy` or `Retry-After` header, so a
  throttled attacker cannot tell the two apart; every other throttled request gets 429.
- A code gets 5 wrong guesses, then it is deleted ([OTP](../objects/data-model/otp.md)).
- Password login runs `assessLoginRisk` before the password is tried
  (`backend/middlewares/login-risk.middleware.js:76`). A browser whose `mkc_did` cookie matches a
  [Device](../objects/data-model/device.md) of that account skips every check. Anyone else needs
  a Turnstile captcha (`captchaToken` in the body; the server answers 403 with `code:
  "CAPTCHA_REQUIRED"`) when the request looks scripted (`backend/utils/bot-signal.util.js`: no
  User-Agent, a tool User-Agent, or no Accept-Language) or the client (device cookie, or
  address plus User-Agent) or the account (from any client) has 5 failed attempts in 15 minutes
  ([LoginAttempt](../objects/data-model/login-attempt.md)). The captcha never locks an account. A success clears the counters and,
  for an unknown browser, stores a Device and sets the cookie. Outside production without
  `TURNSTILE_SECRET_KEY` the captcha is off; in production without it, a required captcha always
  fails.

Password reset: `POST /api/user/otp?forgotPassword=true` (requires a known email), then
`PUT /api/user/reset-password` with the code (`backend/routes/user.route.js:296`).

Every protected request: `passport.authenticate("jwt")` loads the user by `payload.id`
(`backend/config/passport.config.js:77`); `roleBasedAuthorization` gates admin routes
(`backend/routes/user.route.js:75`).

Frontend: forms save the token (`frontend/src/components/login-form.component.jsx:195`,
`create-password-form.component.jsx:197`, `google-link.component.jsx:29`). The root loader calls
`GET /api/user/current-user`, fills the [user slice](../objects/app-state/user-slice.md) and the
[users store](../objects/local-db/users-store.md); on 401 it clears both and the token
(`frontend/src/App.jsx:94`).

## Known defects

- No TLS-fingerprint (JA3/JA4) check: Node cannot see the handshake, so script detection is
  header-based and a script can copy browser headers. A proxy-supplied score would fix this.
- The device cookie is cross-site when the frontend and API are on different registrable domains;
  Safari and some Chrome modes drop it, so those users look like unknown devices.
- Nothing limits `/api/user/otp` per email, so one address can be mailed codes up to the generic
  per-address limit.
- Google sign-in does not register a Device or count failures.

- Login returns no `favorites`, unlike sign-up and Google sign-in.
  `backend/middlewares/local-auth.middleware.js:44`

## If you change this

- **Hits:** [User](../objects/data-model/user.md), [OTP](../objects/data-model/otp.md),
  `backend/config/passport.config.js`, `backend/middlewares/local-auth.middleware.js`,
  `validate-otp.middleware.js`, `check-user-exists.middleware.js`, `login-risk.middleware.js`,
  `frontend/src/utils/api/user-api.util.js`, the auth form components, `frontend/src/App.jsx`,
  `backend/__tests__/routes/user.route.login-risk.test.js` (needs `TURNSTILE_SECRET_KEY` set to
  test captchas; other route tests run with limiters and captchas off, see `backend/TESTING.md`).
  Changing the token claim or secret signs every user out.
- **Frontend:** the login form shows the Turnstile widget only after a `CAPTCHA_REQUIRED` answer
  (`frontend/src/components/login-form.component.jsx`) and the login call sends cookies
  (`credentials: "include"`); CORS must keep `credentials: true`.
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
