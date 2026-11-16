---
type: area
cluster: backend-api
universe: live
status: verified
owns: [backend/middlewares/authorization.middleware.js, backend/middlewares/base-version.middleware.js, backend/middlewares/csrf.middleware.js, backend/middlewares/file-upload.middleware.js, backend/middlewares/rate-limit.middleware.js]
description: "Cross-cutting Express middlewares: role gate, base-version 409, CSRF, uploads, rate limits."
verified: 2026-11-15 @ b2fce7d
---

# Cross-cutting middlewares

Middlewares shared by several routes. Per-resource validators live in their resource's area card.

## Files

| File | Role | Key exports |
|---|---|---|
| `backend/middlewares/authorization.middleware.js` | Role gate and soft auth | default `roleBasedAuthorization(roles)` :22, `optionalAuth` :48 |
| `backend/middlewares/base-version.middleware.js` | 409 when the stored `updatedAt` is newer than header `x-base-updated-at` | `checkBaseVersion(Model)` :27 |
| `backend/middlewares/csrf.middleware.js` | Origin check and `X-Requested-With: mkc` header when a session cookie exists | `csrfProtection` :30 |
| `backend/middlewares/file-upload.middleware.js` | Multer instances | `userImageUpload` :25 (unused by routes), `albumImageUpload` :38, `audioUpload` :51 |
| `backend/middlewares/rate-limit.middleware.js` | Per-IP limits, 15-minute window | `apiRateLimiter` :85, `audioRateLimiter` :95, `isAudioRequest` :17, `isLoginRequest` :28 |

Login, OTP and per-resource validators are in [user-api](user-api.md), [song-api](song-api.md), [album-api](album-api.md), [playlist-and-logbook-api](playlist-and-logbook-api.md).

## Entry points

- Global: `backend/index.js:255` mounts `apiRateLimiter`, `audioRateLimiter`, `csrfProtection`, then the API router on `/api`.
- `roleBasedAuthorization(["admin","super-admin"])`: user GET and PATCH `/:id`; song POST, PUT, PATCH, DELETE; album POST, PUT, DELETE; logbook POST. Member and up: logbook GET. Always after `passport.authenticate("jwt")`.
- `optionalAuth`: playlist GET list and GET `/:id`.
- `checkBaseVersion`: PUT, PATCH, DELETE on songs, albums and playlists. Not on POST.
- `albumImageUpload`: album POST, PUT. `audioUpload`: song POST, PUT, PATCH.

## Connected to

- **objects:** [RefreshToken](../../objects/data-model/refresh-token.md) (cookie names via `session.util.js`)
- **processes:** [auth](../../processes/auth.md), [offline-writes](../../processes/offline-writes.md) (the frontend sends the base-version header from `write-queue.util.js`), [offline-audio](../../processes/offline-audio.md) (audio has its own limiter)
- **areas:** [bootstrap](../backend-core/bootstrap-and-utils.md) (`origin.util.js`, `multer.config.js`, `session.util.js`)

## Known defects

- Origin check is skipped when `ALLOWED_ORIGINS` is empty (`backend/middlewares/csrf.middleware.js:35`). Production boot throws on empty, so this only affects non-production.
- `checkBaseVersion` checks and writes in separate steps; two concurrent writes can both pass (`backend/middlewares/base-version.middleware.js:27`).
- Upload filters trust the client mimetype (`backend/middlewares/file-upload.middleware.js`).
- Rate-limit store is in memory: per process.

## If you change this

- **Hits:** every route that lists the middleware; [offline-writes](../../processes/offline-writes.md) for `checkBaseVersion`; `frontend/src/utils/api/api-client.util.js` for the CSRF header.
- **Does not hit:** controllers' own logic.

## See

- Source: `backend/middlewares/`
- Tests: `backend/__tests__/middlewares/`, [backend tests](../tests/backend-tests.md)
