---
type: area
cluster: backend-api
universe: live
status: verified
owns: [backend/routes/album.route.js, backend/controllers/album.controller.js, backend/middlewares/album-validation.middleware.js, backend/middlewares/pre-add-album.middleware.js, backend/models/validation-schemas/album.validation-schema.js]
description: "/api/album: list and search, CRUD with cover upload, song–album link."
verified: 2026-11-15 @ b2fce7d
---

# Album API

Everything under `/api/album`.

## Files

| File | Role | Key exports |
|---|---|---|
| `backend/routes/album.route.js` | Router; route defs at :45, :105 | default router |
| `backend/controllers/album.controller.js` | CRUD and search | `getAllOrSearchAlbums` :42, `addAlbum` :111, `getAlbum` :152, `updateAlbum` :199, `deleteAlbum` :297 |
| `backend/middlewares/album-validation.middleware.js` | Joi wrappers | `validateCreateAlbum` :25, `validateGetAlbum` :42, `validateUpdateAlbum` :58, `validateGetAllAlbums` :75 |
| `backend/middlewares/pre-add-album.middleware.js` | Existence checks; `checkSongExists` is also used by playlist and logbook routes | `checkSongExists` :27, `checkAlbumExists` :65, `checkAlbumExistsForUpdate` :91 |
| `backend/models/validation-schemas/album.validation-schema.js` | Joi schemas | `createAlbumBodyValidationSchema` :22, `getAlbumParamsSchema` :44, `getAllAlbumsQuerySchema` :58 |

## Entry points

| Route | Chain |
|---|---|
| GET `/api/album` | `validateGetAllAlbums`, `getAllOrSearchAlbums` (`?syncSince=`, `?idsOnly=true` serve [delta-sync](../../processes/delta-sync.md)) |
| POST `/api/album` | jwt, role admin, `albumImageUpload.single("cover")`, `validateCreateAlbum`, `checkAlbumExists`, `checkSongExists`, `addAlbum` |
| GET `/api/album/:id` | `validateGetAlbum`, `getAlbum` |
| PUT `/api/album/:id` | jwt, role admin, `albumImageUpload`, `validateGetAlbum`, `checkBaseVersion(AlbumModel)`, `validateUpdateAlbum`, `checkAlbumExistsForUpdate`, `checkSongExists`, `updateAlbum` |
| DELETE `/api/album/:id` | jwt, role admin, `validateGetAlbum`, `checkBaseVersion`, `deleteAlbum` |

Frontend callers: `frontend/src/utils/api/album-api.util.js`. See [api clients](../frontend-core/api-clients.md).

## Connected to

- **objects:** [Album](../../objects/data-model/album.md), [Song](../../objects/data-model/song.md)
- **processes:** [publish-content](../../processes/publish-content.md), [delta-sync](../../processes/delta-sync.md)
- **areas:** [song-api](song-api.md), [middlewares](middlewares.md), [playlist-and-logbook-api](playlist-and-logbook-api.md) (reuses `checkSongExists`)

## Known defects

- PUT validates with the create schema but skips the string-to-array step: `validateUpdateAlbum` (`backend/middlewares/album-validation.middleware.js:58`) versus `validateCreateAlbum` (`:26`). A one-track edit may return 400. Not run.
- Id change deletes the old album before creating the new one (`backend/controllers/album.controller.js:230`); the song path creates first. A failed create loses the album.
- Id-change reference update is two non-atomic `updateMany` calls (`backend/controllers/album.controller.js:265, :269`).

- Likely 400 on any album with a playlist link: the form sends `youtube_playlist_link` (`frontend/src/components/album-form.component.jsx:189`), the client checks `playlist-link` (`album-api.util.js:58`, never present, so its YouTube check never runs), and the Joi key is `playlistLink` with no `allowUnknown` (`album.validation-schema.js:25`). Nothing in the backend reads `youtube_playlist_link`. Not run.
- A one-track PUT test needs a multipart request: the existing PUT test sends JSON with an array and cannot reproduce the bug.

## If you change this

- **Hits:** [Album](../../objects/data-model/album.md), [albums store](../../objects/local-db/albums-store.md), [publish-content](../../processes/publish-content.md), [song-api](song-api.md) (song side of the link), static cover serving in `backend/index.js:199`, tests `backend/__tests__/routes/album.route.test.js`.
- **Does not hit:** playlists, user favorites.

## See

- Source: `backend/routes/album.route.js`
- Tests (under `backend/__tests__/`): routes `album.route.test.js`, `backend/__tests__/controllers/album.controller.test.js`, `backend/__tests__/middlewares/album-validation.middleware.test.js`, `backend/__tests__/middlewares/pre-add-album.middleware.test.js`, `backend/__tests__/models/validation-schemas/album.validation-schema.test.js`; full list in [backend tests](../tests/backend-tests.md)
