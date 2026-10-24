---
type: object
cluster: data-model
universe: live
status: verified
verified: 2026-10-24 @ 9db0d0c
entity: backend/models/album.model.js:37
code-name: Album
description: A named album grouping songs, with cover image and updatedAt for delta sync.
---

# Album

A named recording or collection that groups songs. Model `AlbumModel`, collection `albums`.

## Why this shape

Like [Song](song.md), `_id` is a human-chosen string, so it can be renamed; a rename deletes and
recreates the document. `updatedAt` is indexed for `?syncSince` delta sync, and unlike Song,
`updateAlbum` does bump it.

## Shape

- `_id` String, required. `backend/models/album.model.js:38`
- `name` String, required. `:39` — the API body calls it `title`
  (`backend/controllers/album.controller.js:215`).
- `createdAt` String year, not a Date. `:40`
- `updatedAt` Date, indexed. `:46`
- `photoPath` server disk path; `photoLink` public URL under `/static/albums/images/`. `:47`
- `songs` [String ref Song]. `:49`

API: `/api/album` (`backend/routes/album.route.js:44`). `GET ?syncSince=` filters on
`updatedAt`; `?idsOnly` returns ids so clients can detect deletions
(`backend/controllers/album.controller.js:45`).

## Connected to

- **owns:** the cover image file at `photoPath`.
- **joins:** [Song](song.md) both ways. `updateAlbum` and `deleteAlbum` keep `Song.albums` in
  step with `$pull` / `$push` (`backend/controllers/album.controller.js:238`, `:295`).
- **looks-like-but-is-not:** [albums store](../local-db/albums-store.md), the offline copy.

## If you change this

- **Hits:** `backend/models/validation-schemas/album.validation-schema.js`,
  `backend/middlewares/pre-add-album.middleware.js` (id-collision checks),
  `backend/controllers/album.controller.js`, `backend/controllers/song.controller.js`
  (edits `album.songs` on song update/delete), `frontend/src/utils/api/album-api.util.js`,
  the [albums store](../local-db/albums-store.md).
- **Does not hit:** [Playlist](playlist.md) — playlists hold song ids, never album ids.

## Surfaces

| Surface | Role |
|---|---|
| Admin (upload/edit album pages) | writes |
| Everyone, online or offline | reads |

## See

- Source: `backend/models/album.model.js`
