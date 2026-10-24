---
type: object
cluster: app-state
universe: live
status: verified
verified: 2026-10-24 @ 9db0d0c
entity: frontend/src/store/slices/user.slice.js:13
code-name: user
description: In-memory session (current user, admin type) plus sign-up and reset form state.
---

# user slice

Redux state for who is signed in, plus the email and OTP carried between auth form steps.

## Why this shape

`adminType` remembers the real admin role so `toggleRole` can switch an admin's view to
`member` and back without a new login. The toggle changes only the client view; the server still
checks the real role from the JWT.

## Shape

State (`frontend/src/store/slices/user.slice.js:15`):

- `authEmail`, `authOtp` — sign-up steps. `forgotEmail` — password-reset step.
- `currentUser` — `{ id, name, email, role, favorites }` or `null`.
- `adminType` — `"admin"`, `"super-admin"` or `null`; set by the root loader
  (`frontend/src/App.jsx:86`).

Actions: `setAuthEmail`, `setAuthOtp`, `resetAuth`, `setCurrentUser`, `resetCurrentUser`,
`setForgotPassEmail`, `setUserFavorites`, `setAdminType`, `toggleRole` (`:108`).

## Connected to

- **joins:** [users store](../local-db/users-store.md) — filled from it when offline.
- **looks-like-but-is-not:** [User](../data-model/user.md) — `currentUser.role` can be
  `member` while toggled, though the database role is `admin`.

## If you change this

- **Hits:** `frontend/src/App.jsx`, `frontend/src/components/header.component.jsx` (role
  toggle), `frontend/src/components/protected-route.component.jsx:27`, the verify-email and
  create-password forms, and the other files that select `state.user` (20 in all).
- **Does not hit:** the backend authorization — it never reads this slice.

## Surfaces

| Surface | Role |
|---|---|
| Root loader, auth forms | write |
| Header, protected routes, role-gated UI | read |

## See

- Source: `frontend/src/store/slices/user.slice.js`
