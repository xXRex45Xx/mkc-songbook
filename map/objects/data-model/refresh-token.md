---
type: object
cluster: data-model
universe: live
status: verified
verified: 2026-10-31 @ 53dd641
entity: backend/models/refresh-token.model.js:20
code-name: RefreshToken
description: One link in a chain of rotating refresh tokens; one chain per browser sign-in.
---

# RefreshToken

A refresh token a browser holds in the HttpOnly cookie `mkc_rt`. Model `RefreshTokenModel`,
collection `refreshtokens`.

## Why this shape

The database holds only the SHA-256 hash of the token, so a database leak does not yield usable
cookies. Each refresh marks the row used (`usedAt`) and inserts the next row with the same
`family`, so one sign-in is one chain. A row presented again after it was used means two parties
hold the token. A replay within 10 seconds (two tabs racing), or within 1 hour while none of the
later tokens has been used (a lost response), is served like a normal refresh; any other replay
deletes the whole family and signs both parties out. `family` is also the `sid` claim of the access JWT. A TTL index
removes a row when `expiresAt` passes: 30 days after it was issued (`REFRESH_TOKEN_TTL_DAYS`),
but never later than `REFRESH_MAX_AGE_DAYS` (default 90) after `familyStartedAt`. Each rotation
deletes used rows of the family older than 1 hour, so a family holds a handful of rows.

## Shape

- `user` ObjectId ref User, required. `backend/models/refresh-token.model.js:21`
- `family` String (UUID), required; shared by every token in one sign-in. `:22`
- `familyStartedAt` Date, default now; copied to each next token; caps the sign-in's lifetime. `:23`
- `tokenHash` String, required, unique. `:24`
- `expiresAt` Date, required; TTL index (`expires: 0`). `:25`
- `usedAt` Date, default null; set when the token was exchanged. `:26`
- `createdAt` Date, default now. `:27`
- Indexes: `user`, `family`. `:30`, `:31`

## Connected to

- **owned-by:** [User](user.md) by `user`. Nothing deletes a user's tokens when the user is
  removed; `rotateSession` deletes the family when it finds the user gone.
- **written-by:** [auth](../../processes/auth.md): `issueSession` (login, sign-up, Google, legacy
  upgrade) inserts a family; `rotateSession` (`POST /api/user/session/refresh`) marks one used and
  inserts the next.
- **deleted-by:** logout (one family), logout-all and password reset (every family of the user),
  reuse detection (one family), TTL expiry.

## If you change this

- **Hits:** `backend/utils/session.util.js` (the only code that reads or writes it),
  `backend/controllers/user.controller.js`, `backend/__tests__/routes/user.route.session.test.js`,
  `backend/__tests__/utils/session.util.test.js`, `backend/jest/helpers/integration.helper.js`
  (`resetDatabase` clears it by model name).
- **Does not hit:** the frontend stores; the cookie is HttpOnly and never read by JavaScript.

## Surfaces

| Surface | Role |
|---|---|
| Login, sign-up, Google sign-in | write |
| `POST /api/user/session/refresh` | read, write |
| `POST /api/user/session/logout`, `logout-all`, password reset | delete |

## See

- Source: `backend/models/refresh-token.model.js`
