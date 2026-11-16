---
type: area
cluster: backend-api
universe: live
status: verified
owns: [backend/routes/user.route.js, backend/controllers/user.controller.js, backend/middlewares/user-validation.middleware.js, backend/middlewares/check-user-exists.middleware.js, backend/middlewares/validate-otp.middleware.js, backend/middlewares/local-auth.middleware.js, backend/middlewares/login-risk.middleware.js, backend/models/validation-schemas/user.validaton-schema.js]
description: "/api/user: sign-up by OTP, login, Google sign-in, session cookies, favorites, roles."
verified: 2026-11-15 @ b2fce7d
---

# User API

Everything under `/api/user`: registration, login, session refresh and logout, favorites, and admin role changes.

## Files

| File | Role | Key exports |
|---|---|---|
| `backend/routes/user.route.js` | Router for `/api/user`; declares each chain | default `userRouter` |
| `backend/controllers/user.controller.js` | Business logic | `registerOTP` :55, `verifyOTP` :95, `registerUser` :129, `getCurrentUser` :167, `googleOAuthLogin` :201, `resetPassword` :291, `refreshSession` :321, `logout` :341, `logoutAll` :363, `upgradeSession` :390, `getAllOrSearchUsers` :426, `updateUserRole` :494, `updateFavorites` :529, `getFavorites` :563 |
| `backend/middlewares/user-validation.middleware.js` | Joi checks per route | `validateRegisterUser` :35, `validateRegisterOTP` :52, `validateLogin` :70, `validateVerifyOTP` :87, `validateResetPassword` :104, `validateGetAllUsers` :138, `validateUpdateUserRole` :155, `validateUpdateFavorites` :173 |
| `backend/models/validation-schemas/user.validaton-schema.js` | Joi schemas (filename typo is real) | `registerUserBodySchema` :22, `loginBodySchema` :84, `getAllUsersQuerySchema` :180, `updateFavoritesBodySchema` :222 |
| `backend/middlewares/check-user-exists.middleware.js` | Duplicate check on register, existence check on reset | default `checkUserExists` :24 |
| `backend/middlewares/validate-otp.middleware.js` | Verifies the emailed code | default `validateOtp` :24 |
| `backend/middlewares/login-risk.middleware.js` | Captcha and attempt counting before the password check | `assessLoginRisk` :124, `recordLoginSuccess` :179, `releaseLoginAttempt` :98 |
| `backend/middlewares/local-auth.middleware.js` | Password check, then session cookies | default `localAuth` :26 |

## Entry points

All routes sit behind the global `/api` chain (rate limit, CSRF): see [middlewares](middlewares.md).

| Route | Chain | Handler |
|---|---|---|
| GET `/api/user` | jwt, role admin, `validateGetAllUsers` | `getAllOrSearchUsers` |
| POST `/api/user` | `validateRegisterUser`, `checkUserExists`, `validateOtp` | `registerUser` |
| POST `/api/user/otp` | `validateRegisterOTP`, `checkUserExists` (`?forgotPassword=true` flips it) | `registerOTP` |
| POST `/api/user/verify-otp` | `validateVerifyOTP` | `verifyOTP` |
| POST `/api/user/login` | `validateLogin`, `assessLoginRisk`, `localAuth` | none (`localAuth` replies) |
| GET `/api/user/current-user` | jwt | `getCurrentUser` |
| POST `/api/user/google/callback` | none | `googleOAuthLogin` |
| PUT `/api/user/reset-password` | `validateResetPassword`, `validateOtp` | `resetPassword` |
| GET `/api/user/favorites` | jwt | `getFavorites` |
| PATCH `/api/user/update-favorites` | jwt, `validateUpdateFavorites` | `updateFavorites` |
| POST `/api/user/session/refresh` | cookie only | `refreshSession` |
| POST `/api/user/session/logout` | cookie only | `logout` |
| POST `/api/user/session/logout-all` | jwt | `logoutAll` (no frontend caller) |
| POST `/api/user/session/upgrade` | jwt | `upgradeSession` |
| PATCH `/api/user/:id` | jwt, role admin, `validateUpdateUserRole` | `updateUserRole` |

Frontend callers: `frontend/src/utils/api/user-api.util.js` (see [api clients](../frontend-core/api-clients.md)) and `api-client.util.js:27` for refresh.

## Connected to

- **objects:** [User](../../objects/data-model/user.md), [OTP](../../objects/data-model/otp.md), [OTPLimit](../../objects/data-model/otp-limit.md), [RefreshToken](../../objects/data-model/refresh-token.md), [Device](../../objects/data-model/device.md), [LoginAttempt](../../objects/data-model/login-attempt.md)
- **processes:** [auth](../../processes/auth.md)
- **areas:** [middlewares](middlewares.md), [bootstrap](../backend-core/bootstrap-and-utils.md) (`session.util.js`, `device.util.js`, `captcha.util.js`), [frontend auth forms](../frontend-ui/components-collections-auth-shell.md)

## Known defects

- `getAllUsersQuerySchema` requires `q` and `type` together (`backend/models/validation-schemas/user.validaton-schema.js:185`), but the frontend sends them independently (`frontend/src/utils/api/user-api.util.js:262`): a lone `q` gets 400.
- `totalPages = Math.floor(total/100) + 1` (`backend/controllers/user.controller.js:435`, `:461`) adds an empty page on exact multiples.
- `validateGoogleOAuthLogin` (`backend/middlewares/user-validation.middleware.js:121`) is not wired; POST `/google/callback` has no body check.
- `getAllOrSearchUsers(searchQuery = null)` reads `searchQuery.q` unguarded (`frontend/src/utils/api/user-api.util.js:263`).

- `PATCH /:id` (`backend/routes/user.route.js:475`) catches any `PATCH /api/user/<x>`; declare new PATCH routes above it.
- The JWT strategy loads only `email`, `name`, `role`, `favorites`, `passwordChangedAt` (`backend/config/passport.config.js:90`); a new user field is absent from `req.user` until added there. Five replies build the user object by hand (see [effects](../../effects/CONTEXT.md)).

- The login captcha widget renders only when the server asks for it and `VITE_TURNSTILE_SITE_KEY` was set at build time (`frontend/src/components/login-form.component.jsx:130`); without the key the user sees the message and no widget. The test file `backend/__tests__/routes/user.route.login-risk.test.js` hard-codes the threshold 5 in about eight places, and the header comments of `login-risk.middleware.js` say "five".
- The header menu items "My Profile" and "Account Settings" (`frontend/src/components/header.component.jsx:183`) have no handler; there is no profile page.

## If you change this

- **Hits:** [User](../../objects/data-model/user.md) fields or roles; [auth](../../processes/auth.md); [user slice](../../objects/app-state/user-slice.md); every frontend form that calls `user-api.util.js`; tests `backend/__tests__/routes/user.route*.test.js`, `controllers/user.controller.test.js`.
- **Does not hit:** playlists, songs, albums. Favorites hold song ids as strings: a song id rename rewrites them from `song.controller.js` ([song-api](song-api.md)).

## See

- Source: `backend/routes/user.route.js`
- Tests (under `backend/__tests__/`): routes `user.route*.test.js`, `backend/__tests__/controllers/user.controller.test.js`, `backend/__tests__/middlewares/user-validation.middleware.test.js`, `backend/__tests__/models/validation-schemas/user.validaton-schema.test.js`, `backend/__tests__/models/user.model.test.js`; full list in [backend tests](../tests/backend-tests.md)
