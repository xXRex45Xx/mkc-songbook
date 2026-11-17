---
type: area
cluster: backend-core
universe: live
status: verified
owns: [backend/index.js, backend/config/*.js, backend/utils/*.js, backend/scripts/*.js, backend/init-db/init-db.js, backend/Dockerfile, backend/.dockerignore, backend/.env.example, backend/package.json]
description: "Server entry and startup order, config modules, shared utils, env vars, Docker and seeding."
verified: 2026-11-15 @ b2fce7d
---

# Backend bootstrap and utils

Server entry, config, shared helpers, and deploy files.

## Files

| File | Role | Key exports |
|---|---|---|
| `backend/index.js` | Builds the app, mounts middleware, connects, listens | default `app` :42, `shouldCompress` :81 |
| `backend/config/db.js` | Mongoose connect | `connect` :28 |
| `backend/config/multer.config.js` | Disk storage and filters for user images, album covers, audio | `userImageOpts` :42, `albumImageOpts` :75, `audioOpts` :110 |
| `backend/config/nodemailer.config.js` | SMTP transport | default `sendEmail` :55 |
| `backend/config/passport.config.js` | `local` and `jwt` strategies (cookie `mkc_at`, Bearer fallback) | side effects only |
| `backend/utils/session.util.js` | Cookie sessions, refresh rotation | `issueSession` :129, `rotateSession` :222, `revokeAllSessions` :151, `ACCESS_COOKIE`, `REFRESH_COOKIE` |
| `backend/utils/device.util.js` | Device cookie `mkc_did` | `createDeviceToken` :46, `setDeviceCookie` :55 |
| `backend/utils/captcha.util.js` | Cloudflare Turnstile check | `verifyCaptcha` :27 |
| `backend/utils/bot-signal.util.js` | Header-based script-client check | `isScriptLike` :20 |
| `backend/utils/origin.util.js` | `ALLOWED_ORIGINS` list | `isAllowedOrigin` :54 |
| `backend/utils/error.util.js` | Error classes and `wrapAsync` | `ClientFaultError` :37, `ForbiddenError` :77, `wrapAsync` :22 |
| `backend/utils/validator.util.js` | Joi wrapper | default `validateSchema` :31 |
| `backend/utils/otp.util.js` | Six-digit code | default `generateOtp` :24 |
| `backend/utils/amharic-map.util.js` | Amharic search regex | `regexBuilder` :110 |
| `backend/utils/mime-type-to-ext.util.js` | MIME to extension maps | `IMAGE_MIMETYPE_MAP`, `AUDIO_MIMETYPE_MAP` |
| `backend/scripts/dns-fix.js` | Dev only: DNS for Atlas SRV; not in scripts or Dockerfile | none |
| `backend/init-db/init-db.js` | Seeds songs from `final_songs.json` when empty; upserts the default super-admin | default `initDb` :26 |
| `backend/Dockerfile` | `node:22-alpine`, `EXPOSE 8080`, `node index.js` | none |

## Entry points

Startup order in `backend/index.js`: dev `.env` load (:27), trust proxy (:37), helmet (:114), morgan (:116), CORS (:144), compression (:160), static album covers (:199), `express.json` (:238), `cookieParser` (:239), `/api` chain (:255), error handler (:297), then `connect` plus `initDb` plus `listen` unless `NODE_ENV=test` (:342).

Env vars (`backend/.env.example`): `PORT`, `NODE_ENV`, `DB_URI`, `JWT_SECRET`, `ACCESS_TOKEN_TTL_MINUTES`, `REFRESH_TOKEN_TTL_DAYS`, `REFRESH_MAX_AGE_DAYS`, `TRUST_PROXY`, `RATE_LIMIT_MAX`, `AUDIO_RATE_LIMIT_MAX`, `RATE_LIMIT_IN_TEST`, `TURNSTILE_SECRET_KEY`, `ALLOWED_ORIGINS`, `DEFAULT_ADMIN_EMAIL`, `DEFAULT_ADMIN_NAME`, `DEFAULT_ADMIN_PHOTO_LINK`, `GOOGLE_CLIENT_ID`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `IMAGE_STORAGE`, `AUDIO_STORAGE`.

## Connected to

- **objects:** [RefreshToken](../../objects/data-model/refresh-token.md), [Device](../../objects/data-model/device.md), [OTP](../../objects/data-model/otp.md)
- **processes:** [auth](../../processes/auth.md), [publish-content](../../processes/publish-content.md)
- **areas:** [middlewares](../backend-api/middlewares.md), [user-api](../backend-api/user-api.md); outside consumers in [effects](../../effects/CONTEXT.md#outside-consumers)

## Known defects

- `backend/index.js:349` passes `photoLink`; `backend/init-db/init-db.js:56` reads `photo`: the admin photo is never saved.
- Image ships without a `.env` and sets no `NODE_ENV` or `PORT`: dev mode throws on missing `.env` (`backend/index.js:27`); `app.listen(undefined)` picks a random port (`:351`).
- `IMAGE_MIMETYPE_MAP["constructor"]` is truthy, so the file filter accepts prototype keys (`backend/config/multer.config.js:53`, `:88`, `:120`).
- `secure: true` is hard-coded for SMTP (`backend/config/nodemailer.config.js:33`) while `.env.example` uses port 587.
- Session cookies use `SameSite=lax` (`session.util.js:44`); the device cookie uses `none` in production (`device.util.js:58`).
- Static covers are served from `uploads/images/albums` (`backend/index.js:219`) while multer writes to `IMAGE_STORAGE/albums`.
- CORS rejection returns 500 (`backend/index.js:154`). DB connect has no `.catch` (`:343`).

## If you change this

- **Hits:** an env var rename hits `.env.example`, the Dockerfile, and [effects outside consumers](../../effects/CONTEXT.md#outside-consumers); a new middleware mount goes between `:239` and `:255`; a new utils export may need a test in `backend/__tests__/utils/`.
- **Does not hit:** frontend code, except the cookie names and CSRF header the client relies on.

## See

- Source: `backend/index.js`
- Tests: `backend/__tests__/config/`, `backend/__tests__/utils/`
