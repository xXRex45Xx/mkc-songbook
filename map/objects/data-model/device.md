---
type: object
cluster: data-model
universe: live
status: verified
verified: 2026-10-25 @ b7f940a
entity: backend/models/device.model.js
code-name: Device
description: A browser that signed in to an account before; its login skips the captcha checks.
---

# Device

A browser a user has signed in from. Model `DeviceModel`, collection `devices`.

## Why this shape

The browser holds a random 256-bit token in the HttpOnly cookie `mkc_did`; the database holds only
its SHA-256 hash, so a database leak does not yield usable cookies. A device is tied to one user:
a cookie known to one account means nothing for another. A TTL index removes a device 180 days
after `lastUsedAt`.

## Shape

- `user` ObjectId ref User, required. `backend/models/device.model.js:15`
- `tokenHash` String, required; unique together with `user`. `:16`, `:24`
- `lastUsedAt` Date, `expires` 180 days (TTL). `:17`

## Connected to

- **owned-by:** [User](user.md) by `user`. Nothing deletes a user's devices when the user is removed.
- **read-by:** [auth](../../processes/auth.md): `assessLoginRisk` looks a device up;
  `recordLoginSuccess` creates it (cap 20 per user, least recently used dropped first).

## If you change this

- **Hits:** `backend/middlewares/login-risk.middleware.js`, `backend/utils/device.util.js` (cookie
  name, flags), `backend/__tests__/routes/user.route.login-risk.test.js`,
  `backend/jest/helpers/integration.helper.js` (`resetDatabase` clears devices by model name).
- **Does not hit:** the frontend stores; the cookie is HttpOnly and never read by JavaScript.

## Surfaces

| Surface | Role |
|---|---|
| Password login (`POST /api/user/login`) | read, write |

## See

- Source: `backend/models/device.model.js`
