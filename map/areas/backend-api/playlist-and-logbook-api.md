---
type: area
cluster: backend-api
universe: live
status: verified
owns: [backend/routes/playlist.route.js, backend/controllers/playlist.controller.js, backend/middlewares/playlist-validation.middleware.js, backend/models/validation-schemas/playlist.validation-schema.js, backend/routes/service-logbook.route.js, backend/controllers/service-logbook.controller.js, backend/middlewares/service-logbook-validation.middleware.js, backend/models/validation-schemas/service-logbook.validation-schema.js, backend/routes/index.js]
description: "/api/playlist and /api/logbook routes, plus the router index that mounts every resource."
verified: 2026-11-15 @ b2fce7d
---

# Playlist and logbook API

Two small resources and the router index. A logbook entry is a "schedule" in the UI.

## Files

| File | Role | Key exports |
|---|---|---|
| `backend/routes/index.js` | Mounts `/song`, `/user`, `/album`, `/logbook`, `/playlist` (:54, :73, :92, :105, :121) | default `apiRouter` |
| `backend/routes/playlist.route.js` | Router for `/api/playlist` | default router |
| `backend/controllers/playlist.controller.js` | CRUD and search | `getAllOrSearchPlaylists` :29, `createPlaylist` :110, `getPlaylist` :141, `updatePlaylist` :195, `patchPlaylist` :229, `deletePlaylist` :260 |
| `backend/middlewares/playlist-validation.middleware.js` | Joi checks and write-access gate | `validateCreatePlaylist` :29, `validateUpdatePlaylist` :46, `validatePatchPlaylist` :66, `checkPlaylistWriteAccess(action)` :114, `validateGetAllPlaylists` :148, `validateGetPlaylist` :164 |
| `backend/routes/service-logbook.route.js` | Router for `/api/logbook` | default router |
| `backend/controllers/service-logbook.controller.js` | List and add | `getAllOrSearchLogBook` :24, `addLog` :85 |
| `backend/middlewares/service-logbook-validation.middleware.js` | Joi wrappers | `validateGetAllLogBooks` :19, `validateCreateLogBook` :35 |
| `backend/models/validation-schemas/playlist.validation-schema.js`, `service-logbook.validation-schema.js` | Joi schemas | see files |

## Entry points

| Route | Chain |
|---|---|
| GET `/api/playlist` | `optionalAuth`, `validateGetAllPlaylists` |
| POST `/api/playlist` | jwt, `validateCreatePlaylist`, `checkSongExists` |
| GET `/api/playlist/:id` | `optionalAuth`, `validateGetPlaylist` |
| PUT `/api/playlist/:id` | jwt, `validateGetPlaylist`, `checkPlaylistWriteAccess("update")`, `checkBaseVersion(PlaylistModel)`, `validateUpdatePlaylist`, `checkSongExists` |
| PATCH `/api/playlist/:id` | jwt, `validateGetPlaylist`, `checkPlaylistWriteAccess("update")`, `checkBaseVersion`, `validatePatchPlaylist` |
| DELETE `/api/playlist/:id` | jwt, `validateGetPlaylist`, `checkPlaylistWriteAccess("delete")`, `checkBaseVersion` |
| GET `/api/logbook` | jwt, role member, admin, super-admin, `validateGetAllLogBooks` |
| POST `/api/logbook` | jwt, role admin or super-admin, `validateCreateLogBook`, `checkSongExists` (no frontend caller) |

`checkPlaylistWriteAccess` must run before `checkBaseVersion` (comment at `playlist-validation.middleware.js:99`).
Frontend callers: `playlist-api.util.js`, `logbook-api.util.js`, `local-playlist-api.util.js` (uploads through `addOrEditPlaylist`). See [api clients](../frontend-core/api-clients.md).

## Connected to

- **objects:** [Playlist](../../objects/data-model/playlist.md), [Service logbook](../../objects/data-model/service-logbook.md), [Song](../../objects/data-model/song.md)
- **processes:** [local-playlist-upload](../../processes/local-playlist-upload.md), [offline-writes](../../processes/offline-writes.md)
- **areas:** [album-api](album-api.md) (`checkSongExists` lives there), [middlewares](middlewares.md)

## Known defects

- `myPlaylists=true` returns a bare array; other GETs return `{playlists, totalPages}` (`backend/controllers/playlist.controller.js:38`, `:82`).
- `totalPages` is off by one on exact multiples (`playlist.controller.js:80`, `service-logbook.controller.js:64`).
- `addLog` replies with the key `inseretedLog` (`backend/controllers/service-logbook.controller.js:93`).
- `PUT` assigns fields wholesale (`backend/controllers/playlist.controller.js:206-209`): a field the client omits is cleared. Joi runs with `abortEarly: false` and no `allowUnknown` (`backend/utils/validator.util.js:33-35`), so a new body field must be added to both the create and update schemas or the request gets 400.
- `checkSongExists` replaces `req.body.songs` with Song documents, not ids (`backend/middlewares/pre-add-album.middleware.js:27`); the controllers store them as-is. Works only if Mongoose casts docs to `_id`. Not verified.

- Playlist body fields are whitelisted by hand in several places: `createPlaylist` builds the doc from explicit fields (`backend/controllers/playlist.controller.js:118`); `patchPlaylistBodySchema` has `.or("visibility","addSongs","removeSongs")` (`playlist.validation-schema.js:70`); `addOrEditPlaylist` sends only name, visibility, songs (`playlist-api.util.js:69`); local create and update take only name and songs (`local-playlist-api.util.js:59`, `:85`; `playlist-idb-service.util.js:66`, `:97`); the form builds a literal for the slice (`playlist-form.component.jsx:170`).

## If you change this

- **Hits:** [Playlist](../../objects/data-model/playlist.md), [local-playlist-upload](../../processes/local-playlist-upload.md), playlist forms in [collections components](../frontend-ui/components-collections-auth-shell.md); the logbook UI is only `frontend/src/pages/schedule.page.jsx` ([routes and pages](../frontend-ui/routes-and-pages.md)), with no confirm-modal helper (inline Flowbite `Modal`, as in `album-viewer.component.jsx:111`); tests `backend/__tests__/routes/playlist.route.test.js`, `service-logbook.route.test.js`.
- **Does not hit:** IndexedDB sync: playlists and logbook are not synced ([delta-sync](../../processes/delta-sync.md)).

## See

- Source: `backend/routes/index.js`
- Tests (under `backend/__tests__/`): routes `playlist.route.test.js`, `service-logbook.route.test.js`, matching `backend/__tests__/controllers/`, `backend/__tests__/middlewares/*-validation` and `backend/__tests__/models/validation-schemas/` tests; full list in [backend tests](../tests/backend-tests.md)
