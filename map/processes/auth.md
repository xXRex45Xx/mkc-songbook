---
type: process
status: verified
verified: 2026-10-31 @ 53dd641
description: Sign-up by emailed code, password or Google sign-in, then an HttpOnly cookie session (15-minute access JWT, rotating 30-day refresh token).
consumes: [../objects/data-model/user.md, ../objects/data-model/otp.md, ../objects/data-model/device.md, ../objects/data-model/login-attempt.md, ../objects/data-model/refresh-token.md]
produces: [../objects/data-model/user.md, ../objects/local-db/users-store.md, ../objects/app-state/user-slice.md]
---

# auth

How a visitor gets an account and proves who they are on each request.

## Input → Movement → Output

An email (plus a code, a password, or a Google access token) goes to `/api/user`. The backend
checks it and sets two HttpOnly cookies: `mkc_at`, a JWT `{ id, sid }` valid 15 minutes, and
`mkc_rt`, an opaque refresh token valid 30 days (a [RefreshToken](../objects/data-model/refresh-token.md)
row holds its hash). Page scripts never see either. The frontend sends cookies on every API call
(`credentials: "include"`) and, on a 401, trades the refresh cookie for a new pair and retries once.

## Why this shape

Sign-up proves the email first with an [OTP](../objects/data-model/otp.md), so accounts are
never created for addresses nobody controls. The access token is short so a stolen one dies
quickly; the refresh token rotates on every use, so a copied one is caught when both copies are
used, and the server can end a session (logout, password reset). HttpOnly keeps both out of reach
of an XSS script. The frontend and API must share a registrable domain (sibling subdomains), so
`SameSite=Lax` cookies are sent.

## Steps

Sign-up:

1. `POST /api/user/otp` — refuses a known email (`backend/middlewares/check-user-exists.middleware.js:28`),
   then creates or refreshes the OTP; saving it sends the email
   (`backend/controllers/user.controller.js:51`, `backend/models/otp.model.js:108`).
2. `POST /api/user/verify-otp` — checks the code only; nothing is created
   (`backend/controllers/user.controller.js:87`).
3. `POST /api/user` — checks the code again (`backend/middlewares/validate-otp.middleware.js:26`),
   hashes the password with bcrypt cost 10, creates the [User](../objects/data-model/user.md)
   with role `public`, starts a session (cookies), returns the user, deletes the OTP
   (`backend/controllers/user.controller.js:120`).

Password login: `POST /api/user/login` — risk check (below), then Passport local strategy; a user with no password
(Google-only) always fails (`backend/config/passport.config.js:49`); the session starts in
`backend/middlewares/local-auth.middleware.js` through `issueSession`.

Google: the browser gets a Google access token; `POST /api/user/google/callback` asks Google
`tokeninfo` and refuses a token whose `aud`/`azp` is not `GOOGLE_CLIENT_ID`, then calls `userinfo`
and refuses an email that is not `email_verified`, finds or creates the user by email, starts a
session (`backend/controllers/user.controller.js:191`).

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
`PUT /api/user/reset-password` with the code. It deletes every refresh token of the account, so
every browser is signed out. It also stamps `passwordChangedAt` on the [User](../objects/data-model/user.md):
the JWT strategy rejects any token issued before it, so access cookies and legacy Bearer tokens
stop at once and `/session/upgrade` cannot turn an old token into a new session.

Session (all in `backend/utils/session.util.js`, routes under `/api/user/session`):

- `POST /session/refresh` — needs only the `mkc_rt` cookie. Marks that token used, inserts the
  next one in the same family, sets both cookies. A used token presented again is served like a
  normal refresh when it is a second tab racing the first (within 10 seconds) or a retry after a
  lost response (within 1 hour, and none of the tokens issued after it has been used; the unused
  ones are then deleted). Any other
  replay deletes the whole family and answers 401. Unknown, expired or malformed tokens, and a
  user who no longer exists, also answer 401 and clear both cookies. Each rotation deletes used
  tokens of the family older than 1 hour, and a sign-in ends `REFRESH_MAX_AGE_DAYS` (default 90)
  after it began, however often it refreshes. Refresh has no limiter of its own; it counts
  against the generic per-address limit.
- `POST /session/logout` — deletes the family named by `mkc_rt`, clears both cookies, works with
  no session.
- `POST /session/logout-all` — needs a valid access cookie; deletes every refresh token of the user.
- `POST /session/upgrade` — transition only. Trades a legacy `Authorization: Bearer` token (the
  old 30-day JWT) for a cookie session. Remove it, the Bearer extractor in
  `backend/config/passport.config.js` and the Bearer exemption in `csrf.middleware.js` once
  legacy tokens have expired (30 days after the release).

Every protected request: `passport.authenticate("jwt")` reads `mkc_at` (or, for legacy clients,
the Bearer header), verifies HS256, and loads the user by `payload.id`
(`backend/config/passport.config.js`); `roleBasedAuthorization` gates admin routes. The role is
read from the database each time, not from the token. Logout does not revoke an access token that
was already issued: it works until its 15 minutes end.

CSRF (`backend/middlewares/csrf.middleware.js`, mounted on `/api` in `backend/index.js`): a
state-changing request (not GET, HEAD, OPTIONS) that carries a session cookie must also send
`X-Requested-With: mkc`, and an `Origin` header, when present, must be in `ALLOWED_ORIGINS`. The
custom header forces a CORS preflight that only allowed origins pass. A request with an
`Authorization` header skips the header check (a browser never adds that header on its own).
`ALLOWED_ORIGINS` is required in production: the process refuses to start without it, because
CORS runs with `credentials: true`.

Frontend:

- `frontend/src/utils/api/api-client.util.js` (`apiFetch`) is the only fetch wrapper for
  authenticated calls: sends cookies, adds the CSRF header on state-changing requests, and on a
  401 from a signed-in browser refreshes once (single flight in the tab, Web Locks across tabs)
  and retries once. If the server refuses the refresh (401) it ends the session on this device;
  a network or server failure keeps it.
- `frontend/src/utils/session.util.js` keeps `localStorage["mkc:signed-in"]`, a non-secret hint
  that decides whether the root loader asks the server for the user. `startSession` (login,
  sign-up, Google forms) sets it, fills the [user slice](../objects/app-state/user-slice.md) and
  the [users store](../objects/local-db/users-store.md); `endSession` clears the hint, the slice,
  the store and the service worker caches `api-user`, `api-favorites`, `api-playlists`.
- Logout (`signOut` in `frontend/src/utils/api/user-api.util.js`, called from the header) tells
  the server and ends the session. If the server cannot be reached, a `mkc:logout-pending` flag
  makes the next sync retry it, unless someone signed in meanwhile.
- The root loader (`frontend/src/App.jsx`) first trades a leftover `localStorage._s` token for a
  cookie session (`migrateLegacyToken` in `user-api.util.js`, also run by every sync), then calls
  `GET /api/user/current-user` when the hint is set. If the migration cannot reach the server it
  keeps the token and sets the hint, so an offline start uses the cached user. If a request
  needs a session refresh that cannot reach the server or is refused for a reason other than an
  expired session, `apiFetch` throws a network-style error, so a mutation is queued, not lost.

## Known defects

- No TLS-fingerprint (JA3/JA4) check: Node cannot see the handshake, so script detection is
  header-based and a script can copy browser headers. A proxy-supplied score would fix this.
- The device cookie is cross-site when the frontend and API are on different registrable domains;
  Safari and some Chrome modes drop it, so those users look like unknown devices.
- Nothing limits `/api/user/otp` per email, so one address can be mailed codes up to the generic
  per-address limit.
- Google sign-in does not register a Device or count failures.
- An access token cannot be revoked: after logout or reuse detection it still works until its
  15 minutes end (a password reset does cut it at once), because the JWT strategy never looks up
  `sid`. `backend/config/passport.config.js:88`
- A retry after a lost refresh response is accepted for 1 hour; a thief who rotates a copied
  token first can make the owner's retry look benign. Shortening `REFRESH_RETRY_MS` narrows it.
  `backend/utils/session.util.js:206`
- A compromised sibling subdomain can send the `SameSite=Lax` cookies; the CSRF header and the
  Origin check are the only defense. `backend/middlewares/csrf.middleware.js:30`
- The signed-in hint can be set by hand; it only decides whether the app asks the server, so the
  worst case is a request answered with 401. `frontend/src/utils/session.util.js:66`

## If you change this

- **Hits:** [User](../objects/data-model/user.md), [OTP](../objects/data-model/otp.md),
  `backend/config/passport.config.js`, `backend/middlewares/local-auth.middleware.js`,
  `validate-otp.middleware.js`, `check-user-exists.middleware.js`, `login-risk.middleware.js`,
  `frontend/src/utils/api/user-api.util.js`, the auth form components, `frontend/src/App.jsx`,
  `backend/utils/session.util.js`, `backend/middlewares/csrf.middleware.js`,
  [RefreshToken](../objects/data-model/refresh-token.md),
  `backend/__tests__/routes/user.route.login-risk.test.js` (needs `TURNSTILE_SECRET_KEY` set to
  test captchas; other route tests run with limiters and captchas off, see `backend/TESTING.md`),
  `backend/__tests__/routes/user.route.session.test.js`. Changing the JWT secret or claims signs
  every user out at the next access expiry; they stay signed in through refresh only if the
  refresh tokens are kept.
- **Frontend:** every authenticated call goes through `apiFetch`; the login form shows the
  Turnstile widget only after a `CAPTCHA_REQUIRED` answer
  (`frontend/src/components/login-form.component.jsx`). CORS must keep `credentials: true`, and
  `ALLOWED_ORIGINS` must list the exact frontend origin.
- **Test helpers:** `authHeader(loginResponse)` in `backend/jest/helpers/integration.helper.js`
  builds the `Cookie` and `X-Requested-With` headers from a login response.
- **Does not hit:** [pendingWrites store](../objects/local-db/pending-writes-store.md) logic —
  queued writes carry no token; they are sent with whatever session is current at replay.

## Surfaces

| Surface | Role |
|---|---|
| Visitor (sign-up, login, Google, forgot password) | starts it |
| Every protected API route | checks the access cookie |

## See

- Objects: [User](../objects/data-model/user.md), [OTP](../objects/data-model/otp.md),
  [RefreshToken](../objects/data-model/refresh-token.md),
  [user slice](../objects/app-state/user-slice.md), [users store](../objects/local-db/users-store.md)
- Source: `backend/routes/user.route.js`
