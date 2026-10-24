---
type: object
cluster: local-db
universe: live
status: verified
verified: 2026-10-24 @ 9db0d0c
entity: frontend/src/utils/db/indexed-db.util.js:42
code-name: songs
description: IndexedDB copy of Song records, keyed by _id; pages read it first.
---

# songs store

The device's copy of the [Song](../data-model/song.md) collection, in IndexedDB database
`mkc-songbook-db` (version 4). Store name `songs`.

## Why this shape

Pages read local data first and sync in the background, so the songbook works with no network.
Records are the API shape from `GET /api/song?all=true`: `hasAudio` instead of `songFilePath`
(`backend/controllers/song.controller.js:145`).

## Shape

- keyPath `_id`. `frontend/src/utils/db/indexed-db.util.js:43`
- indexes `updatedAt`, `hasAudio`, `title`, `createdAt`. `:44`
- Access: `songIdbService` (`getAll`, `get`, `bulkPut`, `deleteById`, `getMaxUpdatedAt`).
  `frontend/src/utils/db/song-idb-service.util.js:17`

Upgrades only add stores and missing indexes; they never drop data
(`frontend/src/utils/db/indexed-db.util.js:166`).

## Connected to

- **joins:** [syncMeta store](sync-meta-store.md) holds `lastSongSync`, the max `updatedAt`
  seen; [audioFiles store](audio-files-store.md) by song id.
- **looks-like-but-is-not:** [Song](../data-model/song.md) — `hasAudio` means the server has
  audio, not that the device saved it. Device audio lives in `audioFiles`.

## If you change this

- **Hits:** `frontend/src/utils/pwa/sync-service.util.js` (initial sync, delta sync, deletion
  reconcile), `frontend/src/pages/songs.page.jsx`, `frontend/src/pages/lyrics.page.jsx`,
  `frontend/src/utils/api/audio-download.util.js`.
  A new index needs a `DB_VERSION` bump.
- **Does not hit:** the backend.

## Surfaces

| Surface | Role |
|---|---|
| `sync-service.util.js` | writes |
| Songs and lyrics pages, offline search | read |

## See

- Source: `frontend/src/utils/db/song-idb-service.util.js`
