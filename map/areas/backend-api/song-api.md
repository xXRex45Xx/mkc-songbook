---
type: area
cluster: backend-api
universe: live
status: verified
owns: [backend/routes/song.route.js, backend/controllers/song.controller.js, backend/middlewares/song-validation.middleware.js, backend/middlewares/song-map-sortby.middleware.js, backend/middlewares/pre-add-song.middleware.js, backend/middlewares/pre-update-song.middleware.js, backend/models/validation-schemas/song.validation-shcema.js]
description: "/api/song: list and search, CRUD with audio upload, audio streaming, id rename."
verified: 2026-11-15 @ b2fce7d
---

# Song API

Everything under `/api/song`, including the audio stream.

## Files

| File | Role | Key exports |
|---|---|---|
| `backend/routes/song.route.js` | Router; `/` chain :46 (GET :68, POST :109), `/:id` chain :124 (GET :142, PUT :180, PATCH :216, DELETE :245), audio :271 | default router |
| `backend/controllers/song.controller.js` | CRUD, search, stream, reference cleanup | `getAllOrSearchSongs` :84, `addSong` :228, `getSong` :267, `updateSong` :298, `patchSong` :375, `deleteSong` :413, `streamSongAudio` :443; internal `removeSongFromReferences` :36, `replaceSongIdInReferences` :54 |
| `backend/middlewares/song-validation.middleware.js` | Joi wrappers | `validateGetAllSongs` :26, `validateGetSong` :42, `validateCreateSong` :58, `validatePatchSong` :74 |
| `backend/middlewares/song-map-sortby.middleware.js` | Maps `sortBy` to a Mongo field | default `mapSongSortBy` :22 |
| `backend/middlewares/pre-add-song.middleware.js` | Duplicate id check; resolves album ids to docs | `checkSongNumberExists` :22, `checkAlbumExists` :43 |
| `backend/middlewares/pre-update-song.middleware.js` | Id-change conflict check | `checkSongNumberConflict` :26 |
| `backend/models/validation-schemas/song.validation-shcema.js` | Joi schemas (typo is real) | `getAllSongsQuerySchema` :25, `createSongBodyValidationSchema` :67, `patchSongBodyValidationSchema` :93 |

## Entry points

| Route | Chain |
|---|---|
| GET `/api/song` | `validateGetAllSongs`, `mapSongSortBy`, `getAllOrSearchSongs` (`?all=true`, `?syncSince=`, `?idsOnly=true` serve [delta-sync](../../processes/delta-sync.md)) |
| POST `/api/song` | jwt, role admin, `audioUpload.single("audio-file")`, `validateCreateSong`, `checkSongNumberExists`, `checkAlbumExists`, `addSong` |
| GET `/api/song/:id` | `validateGetSong`, `getSong` |
| PUT `/api/song/:id` | jwt, role admin, `audioUpload`, `validateGetSong`, `checkBaseVersion(SongModel)`, `validateCreateSong`, `checkSongNumberConflict`, `checkAlbumExists`, `updateSong` |
| PATCH `/api/song/:id` | jwt, role admin, `audioUpload`, `validateGetSong`, `checkBaseVersion`, `validatePatchSong`, `patchSong` |
| DELETE `/api/song/:id` | jwt, role admin, `validateGetSong`, `checkBaseVersion`, `deleteSong` |
| GET `/api/song/:id/audio` | `streamSongAudio` (no auth; own rate limiter) |

Frontend callers: `frontend/src/utils/api/songs-api.util.js`; audio is fetched directly by `audio-download.util.js:90` and `audio-player.component.jsx:95`. See [api clients](../frontend-core/api-clients.md).

## Connected to

- **objects:** [Song](../../objects/data-model/song.md), [Album](../../objects/data-model/album.md), [Playlist](../../objects/data-model/playlist.md), [User](../../objects/data-model/user.md) favorites, [Service logbook](../../objects/data-model/service-logbook.md)
- **processes:** [publish-content](../../processes/publish-content.md), [delta-sync](../../processes/delta-sync.md), [offline-audio](../../processes/offline-audio.md), [offline-writes](../../processes/offline-writes.md)
- **areas:** [album-api](album-api.md), [middlewares](middlewares.md) (`file-upload`, `base-version`), [bootstrap](../backend-core/bootstrap-and-utils.md) (`multer.config.js`, `amharic-map.util.js`)

- Search: with no `q` the list is a plain array. With `q`, `type` is required (`.and("q","type")`); `type=all` gives `{songs:{titleMatch,lyricsMatch},totalPages}`, other types give a flat array (`backend/README.md:89-90`). The flat list projects only `title songFilePath` (`song.controller.js:87`), so a new field appears only in `?all=true` responses. The query schema requires `q` and `type` together and allow-lists `type`. Offline matching also includes `_id` in a combined search (`frontend/src/utils/offline-search.util.js:72`); the server does not.

## Known defects

- PUT and PATCH assign `youtubeLink = song["video-link"]` unconditionally (`backend/controllers/song.controller.js:314`, `:391`): omitting the field wipes the stored link.
- Stream errors are unhandled: `fs.createReadStream` at `backend/controllers/song.controller.js:467` and `:514` has no error listener, and `writeHead` has already run.
- `checkAlbumExists` exists in two modules with different meaning: `pre-add-song.middleware.js:43` and `pre-add-album.middleware.js:65`.
- `frontend/src/utils/api/songs-api.util.js:87`: `parseInt(formData.get("tempo") < 30)` puts the `<` inside `parseInt`, so the tempo check never fires.

## If you change this

- **Hits:** [Song](../../objects/data-model/song.md), [songs store](../../objects/local-db/songs-store.md), delta-sync, [album-api](album-api.md) (both sides of the song–album link), song id rename touches Album, Playlist, LogBook, User favorites, tests `backend/__tests__/routes/song*.test.js`.
- **Does not hit:** the [playlist slice](../../objects/app-state/playlist-slice.md) (audio queue); logbook routes.

## See

- Source: `backend/routes/song.route.js`
- Tests (under `backend/__tests__/`): routes `song*.test.js`, `backend/__tests__/controllers/song.controller.test.js`, `backend/__tests__/models/validation-schemas/song.validation-shcema.test.js`, `backend/__tests__/models/song.model.test.js`, `backend/__tests__/middlewares/song-*` and `pre-*-song` tests; full list in [backend tests](../tests/backend-tests.md)
