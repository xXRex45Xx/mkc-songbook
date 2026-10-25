---
type: object
cluster: local-db
universe: live
status: verified
verified: 2026-10-24 @ 9db0d0c
entity: frontend/src/utils/db/indexed-db.util.js:64
code-name: users
description: Offline cache of the signed-in user (shape of GET /api/user/current-user).
---

# users store

Holds one record: the signed-in user, so a logged-in member can open the app offline.
Store name `users`.

## Why this shape

Despite the plural name, it stores a single fixed-key entry `{ _id: CURRENT_KEY, user }`
(`frontend/src/utils/db/user-idb-service.util.js:43`). Without it, an offline reload loses the
session and protected routes show the error page.

## Shape

- keyPath `_id`. `frontend/src/utils/db/indexed-db.util.js:64`
- `user` is `{ id, name, email, role, favorites }` from `GET /api/user/current-user`.
  `frontend/src/utils/db/user-idb-service.util.js:4`
- Access: `userIdbService` (get, set, clear). `frontend/src/utils/db/user-idb-service.util.js:21`

## Connected to

- **joins:** [user slice](../app-state/user-slice.md) — the slice is filled from here offline.
- **looks-like-but-is-not:** [User](../data-model/user.md) — no password, no searchHistory;
  it is not a list of users.

## If you change this

- **Hits:** `frontend/src/App.jsx` root loader (caches the user `:85`, clears `:97`, reads
  offline `:108`), `frontend/src/components/header.component.jsx:133` (clears on logout),
  [user slice](../app-state/user-slice.md).
- **Does not hit:** the users admin page, which always reads from the API.

## Surfaces

| Surface | Role |
|---|---|
| Root loader, logout | write, clear |

## See

- Source: `frontend/src/utils/db/user-idb-service.util.js`
