---
type: object
cluster: data-model
universe: live
status: verified
verified: 2026-10-31 @ 53dd641
entity: backend/models/user.model.js:41
code-name: User
description: An account with role public, member, admin or super-admin.
---

# User

A person with an account. Model `UserModel`, collection `users`.

## Why this shape

`password` is optional because Google sign-in creates users without one
(`backend/controllers/user.controller.js:240`), and the seeded super-admin is upserted with no
password (`backend/init-db/init-db.js:52`). `role` drives every permission check; new accounts
start as `public`.

## Shape

- `email` String, required, lowercase, unique. `backend/models/user.model.js:42`
- `name` String, required. `:50`
- `password` String, bcrypt hash, optional. `:51`
- `searchHistory` [ObjectId ref SearchHistory] — nothing writes it. `:52`
- `favorites` [String ref Song]. `:55`
- `photo` String URL. `:56`
- `passwordChangedAt` Date, set by password reset; tokens issued before it are rejected. `:57`
- `role` `public` | `member` | `admin` | `super-admin`, default `public`. `:58`

Role rules (`backend/controllers/user.controller.js:483`): `super-admin` cannot be changed; only
a `super-admin` may change an `admin`.

API: `/api/user` (`backend/routes/user.route.js:55`): register, `otp`, `verify-otp`, `login`,
`current-user`, `google/callback`, `reset-password`, favorites, role.

## Connected to

- **owns:** [Playlist](playlist.md) via `Playlist.creator`; favorites as Song ids.
- **joins:** [OTP](otp.md) by email during signup and reset; [SearchHistory](search-history.md)
  in schema only.
- **looks-like-but-is-not:** [users store](../local-db/users-store.md) (offline cache of the
  current user); [user slice](../app-state/user-slice.md) (in-memory session).

## If you change this

- **Hits:** `backend/config/passport.config.js` (local + JWT strategies),
  `backend/middlewares/authorization.middleware.js`, `user-validation.middleware.js`,
  `check-user-exists.middleware.js`, `backend/controllers/user.controller.js`,
  `backend/init-db/init-db.js`, `frontend/src/utils/api/user-api.util.js`,
  [users store](../local-db/users-store.md), [user slice](../app-state/user-slice.md).
- **Does not hit:** [Song](song.md) — favorites live on the user, not the song.

## Surfaces

| Surface | Role |
|---|---|
| Sign-up, login, Google OAuth | writes |
| Users page (admin) | reads, changes role |
| Every authorized request (Passport JWT from the `mkc_at` cookie) | reads |

## See

- Source: `backend/models/user.model.js`
