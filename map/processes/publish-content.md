---
type: process
status: verified
verified: 2026-10-25 @ 3515b77
description: Admin uploads a song (with audio) or an album (with cover); both sides of the link are written.
consumes: [../objects/data-model/user.md]
produces: [../objects/data-model/song.md, ../objects/data-model/album.md]
---

# publish-content

How an admin adds a song or an album to the catalog.

## Input → Movement → Output

A multipart form from the upload page goes to `POST /api/song` (field `audio-file`) or
`POST /api/album` (field `cover`). The backend checks role, saves the file to disk, validates,
checks the id is free and the linked records exist, then creates the record and adds the
reverse link on each linked [Song](../objects/data-model/song.md) or
[Album](../objects/data-model/album.md).

## Why this shape

The song–album link is stored on both sides, so every write must update both. The file is
saved by Multer before validation, so the global error handler deletes it when any later step
fails (`backend/index.js:296`).

## Steps

Song (`backend/routes/song.route.js:107`):

1. JWT, then `roleBasedAuthorization(["admin", "super-admin"])`.
2. `audioUpload.single("audio-file")` — Multer, 50 MB max, to `AUDIO_STORAGE`
   (`backend/config/multer.config.js:110`).
3. `validateCreateSong` (Joi), `checkSongNumberExists` — the `id` must be free
   (`backend/middlewares/pre-add-song.middleware.js:22`).
4. `checkAlbumExists` — splits the comma list and swaps ids for album documents
   (`pre-add-song.middleware.js:43`, `:63`).
5. `addSong` creates the song and pushes it onto each album's `songs`
   (`backend/controllers/song.controller.js:175`).

Album (`backend/routes/album.route.js:89`): same guard; `albumImageUpload.single("cover")`
(30 MB, `backend/config/multer.config.js:75`); `checkAlbumExists`, `checkSongExists`; `addAlbum`
sets `photoLink` under `/static/albums/images/` and pushes the album id onto each song
(`backend/controllers/album.controller.js:104`).

Frontend: `frontend/src/pages/upload-song.page.jsx`, `upload-album.page.jsx`, through
`addOrEditSong` / `addOrEditAlbum`, which may [queue offline](offline-writes.md).

## Known defects

None known. `addSong`, `updateSong`, `addAlbum` and `updateAlbum` set `updatedAt` on both sides of
a song–album link, so [delta-sync](delta-sync.md) sees the new link from either side.

## If you change this

- **Hits:** [Song](../objects/data-model/song.md), [Album](../objects/data-model/album.md),
  `backend/config/multer.config.js`, `backend/middlewares/file-upload.middleware.js`,
  `pre-add-song.middleware.js`, `pre-add-album.middleware.js`, the song and album Joi schemas,
  the upload pages, [offline-writes](offline-writes.md).
- **Does not hit:** [Playlist](../objects/data-model/playlist.md) or
  [Service logbook](../objects/data-model/service-logbook.md).

## Surfaces

| Surface | Role |
|---|---|
| Admin, upload song / upload album pages | starts it |

## See

- Objects: [Song](../objects/data-model/song.md), [Album](../objects/data-model/album.md)
- Source: `backend/routes/song.route.js`, `backend/routes/album.route.js`
