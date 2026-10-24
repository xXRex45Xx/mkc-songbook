---
type: object
cluster: local-db
universe: live
status: verified
verified: 2026-10-24 @ 9db0d0c
entity: frontend/src/utils/db/indexed-db.util.js:67
code-name: audioFiles
description: Audio blobs saved explicitly for offline playback, keyed by song id.
---

# audioFiles store

Song recordings the user chose to save offline. Store name `audioFiles`.

## Why this shape

The service worker never caches audio: the stream route is `NetworkOnly`
(`frontend/vite.config.js:104`). A recording is saved whole, only when the user asks ("Save
offline"). `_id` equals the song id, so one song has at most one saved file.

## Shape

- keyPath `_id`; indexes `songId`, `updatedAt`. `frontend/src/utils/db/indexed-db.util.js:67`
- Record: `{ _id, songId, blob, updatedAt, size, mimeType }`.
  `frontend/src/utils/db/audio-idb-service.util.js:33`
- Version 3 backfilled `songId` and `updatedAt` onto older records; unknown `updatedAt` is
  `null`. `frontend/src/utils/db/indexed-db.util.js:191`

## Connected to

- **joins:** [songs store](songs-store.md) and [Song](../data-model/song.md) by id. Deletion
  reconcile drops saved audio when its song disappears from the server
  (`frontend/src/utils/pwa/sync-service.util.js:208`).
- **looks-like-but-is-not:** `Song.hasAudio` — that flag means the server has a file.

## If you change this

- **Hits:** `frontend/src/utils/api/audio-download.util.js`,
  `frontend/src/components/download-audio.component.jsx`,
  `frontend/src/utils/pwa/sync-service.util.js`, `frontend/src/components/audio-player.component.jsx`.
- **Does not hit:** `backend/` — the stream endpoint `GET /api/song/:id/audio` is unchanged.

## Surfaces

| Surface | Role |
|---|---|
| "Save offline" button | writes |
| Audio player | reads |

## See

- Source: `frontend/src/utils/db/audio-idb-service.util.js`
