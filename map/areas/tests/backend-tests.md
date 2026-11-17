---
type: area
cluster: tests
universe: live
status: verified
owns: [backend/__tests__/**, backend/jest/**, backend/jest.config.js, backend/babel.config.js]
description: "Jest suites mirror the backend tree; helpers, fixtures, setup files, and the untested gaps."
verified: 2026-11-15 @ b2fce7d
---

# Backend tests

Read `backend/TESTING.md` first. No frontend tests exist.

## Files

| Path | Role |
|---|---|
| `backend/__tests__/<folder>/<source>.test.js` | Mirror of `config`, `controllers`, `middlewares`, `models`, `models/validation-schemas`, `routes`, `utils`, `init-db` |
| `backend/__tests__/routes/*.route.test.js` | Supertest through `backend/index.js`; scenario suffixes `.session`, `.otp-attempts`, `.login-risk`, plus `song-sync`, `song-audio-download`, `song-references`, `api-rate-limit`, `base-version` |
| `backend/jest/helpers/integration.helper.js` | In-memory MongoDB, `resetDatabase`, `seedAuthUsers`, `loginUser`, `authHeader`, `createSong`, `createAlbum`, `createPlaylist`, `createOtp` |
| `backend/jest/fixtures/{users,songs,albums,playlists}.js` | Constant test data |
| `backend/jest/jest.setup.js`, `jest.env.js` | Global mocks (dotenv, bcrypt, fs, nodemailer, multer) and env defaults |
| `backend/jest/jest.sequencer.js` | Order: utils, middlewares, models, controllers, routes |
| `backend/jest/jest.config.js` | Config; global 80% threshold; root `backend/jest.config.js` re-exports it |

## Tests to touch per change

Every change needs the unit tests, not just the route test. Paths are full from the repo root; `*` stands for a scenario suffix.

| You change | Tests that cover it |
|---|---|
| User routes or controller | `backend/__tests__/routes/user.route.test.js` (+ `.session`, `.otp-attempts`, `.login-risk`), `backend/__tests__/controllers/user.controller.test.js` |
| User fields | `backend/__tests__/models/user.model.test.js`, `backend/__tests__/models/validation-schemas/user.validaton-schema.test.js`, `backend/__tests__/middlewares/user-validation.middleware.test.js`, plus the two above |
| Login risk, captcha threshold | `backend/__tests__/routes/user.route.login-risk.test.js` (no unit test for `login-risk.middleware.js`); also `backend/README.md:168` says "five" |
| Song routes, search, fields | `backend/__tests__/routes/song.route.test.js` (+ `backend/__tests__/routes/song-sync.route.test.js`, `song-audio-download.route.test.js`, `song-references.route.test.js`), `backend/__tests__/controllers/song.controller.test.js` (search tests from :396), `backend/__tests__/models/song.model.test.js`, `backend/__tests__/models/validation-schemas/song.validation-shcema.test.js`, `backend/__tests__/middlewares/song-validation.middleware.test.js`, `backend/__tests__/middlewares/pre-add-song.middleware.test.js`, `backend/__tests__/middlewares/pre-update-song.middleware.test.js`, `backend/__tests__/middlewares/song-map-sortby.middleware.test.js` |
| Album | `backend/__tests__/routes/album.route.test.js`, `backend/__tests__/controllers/album.controller.test.js`, `backend/__tests__/models/album.model.test.js`, `backend/__tests__/models/validation-schemas/album.validation-schema.test.js`, `backend/__tests__/middlewares/album-validation.middleware.test.js`, `pre-add-album.middleware.test.js` |
| Playlist | `backend/__tests__/routes/playlist.route.test.js`, `backend/__tests__/controllers/playlist.controller.test.js`, `backend/__tests__/models/playlist.model.test.js`, `backend/__tests__/models/validation-schemas/playlist.validation-schema.test.js`, `backend/__tests__/middlewares/playlist-validation.middleware.test.js` |
| Logbook | `backend/__tests__/routes/service-logbook.route.test.js`, `backend/__tests__/controllers/service-logbook.controller.test.js`, `backend/__tests__/models/service-logbook.model.test.js`, `backend/__tests__/models/validation-schemas/service-logbook.validation-schema.test.js`, `backend/__tests__/middlewares/service-logbook-validation.middleware.test.js` |
| Base version, rate limit, CSRF | `backend/__tests__/routes/base-version.route.test.js`, `backend/__tests__/routes/api-rate-limit.route.test.js`, `backend/__tests__/middlewares/csrf.middleware.test.js`, `backend/__tests__/middlewares/rate-limit.middleware.test.js` |
| Upload limits, multer options | `backend/__tests__/config/multer.config.test.js` (asserts the 30 and 50 MB limits), `backend/__tests__/middlewares/file-upload.middleware.test.js` |
| Config, utils | `backend/__tests__/config/*.test.js`, `backend/__tests__/utils/<name>.test.js` (same basename as the source) |

Fixtures that hold sample records: `jest/fixtures/songs.js`, `albums.js`, `playlists.js`, `users.js`. Add the new field there when a model gains one.

Unused: `jest/factories/*`, `jest/helpers/auth.helper.js`, `jest/helpers/request.helper.js`, `jest/__mocks__/nodemailer.js`.

## Entry points

Scripts in `backend/package.json`: `test`, `test:unit` (utils and middlewares), `test:integration` (controllers and routes), `test:e2e` (no suite). Models, config and init-db match neither unit nor integration.

Route-test pattern: `ensureDbConnection` in `beforeAll`, `resetDatabase` in `beforeEach`, `teardownDb` in `afterAll`.

## Connected to

- **areas:** every `backend-api` and `backend-core` card names its tests under See.
- **docs:** `backend/TESTING.md`

## Known defects

- No direct unit test (route-covered only): `login-risk.middleware.js`, `bot-signal.util.js`, `captcha.util.js`, `device.util.js`, `base-version.middleware.js`, and the `refresh-token`, `device`, `login-attempt` models.
- `resetDatabase` clears each model by name: a new model needs a line in `integration.helper.js`.
- `backend/TESTING.md` lists the factories as reusable; nothing imports them.

## If you change this

- **Hits:** a new model, route or middleware needs its mirrored test file and, for a model, `integration.helper.js`.
- **Does not hit:** production code.

## See

- Source: `backend/jest/`
