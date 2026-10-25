---
type: process
status: verified
verified: 2026-10-25 @ 7d5d104
description: Pull songs and albums into IndexedDB, then only records changed since the last marker.
consumes: [../objects/data-model/song.md, ../objects/data-model/album.md, ../objects/local-db/sync-meta-store.md]
produces: [../objects/local-db/songs-store.md, ../objects/local-db/albums-store.md, ../objects/local-db/sync-meta-store.md, ../objects/app-state/pwa-slice.md]
---

# delta-sync

Keeps the device's song and album copies current so pages work offline.

## Input → Movement → Output

The server's songs and albums, filtered by `?syncSince=<marker>`, flow into the
[songs store](../objects/local-db/songs-store.md) and
[albums store](../objects/local-db/albums-store.md). Each run moves the
[syncMeta](../objects/local-db/sync-meta-store.md) markers to the newest `updatedAt` received.
Status is reported into the [pwa slice](../objects/app-state/pwa-slice.md).

## Why this shape

Page loaders read IndexedDB first and render at once (`frontend/src/pages/songs.page.jsx:68`,
`frontend/src/pages/albums.page.jsx:70`); the network only tops the stores up. `?syncSince`
cannot see deletions, so a separate pass compares id lists.

## Steps

1. Triggers: app start (`frontend/src/main.jsx:20` → `registerPwa`,
   `frontend/src/utils/pwa/pwa-register.util.js:227`), service worker ready (`:232`), and the
   `online` event (`:172`). One run at a time (`:112`). No timer.
2. `performSync`: flush the [write queue](offline-writes.md) first, then
   [upload local playlists](local-playlist-upload.md), then sync data
   (`frontend/src/utils/pwa/pwa-register.util.js:67`).
3. No `lastFullSync` → `initializePwaData`: `GET /api/song?all=true` and `GET /api/album`,
   `bulkPut` both, set `lastSongSync` / `lastAlbumSync`
   (`frontend/src/utils/pwa/sync-service.util.js:65`).
4. Otherwise `syncAll`: `syncSongs` and `syncAlbums` in parallel, each
   `GET ...?syncSince=<marker>`, `bulkPut`, move the marker (`sync-service.util.js:241`).
   Server side: `updatedAt >= syncSince` (`backend/controllers/song.controller.js:43`,
   `backend/controllers/album.controller.js:45`).
5. If both succeeded: `reconcileDeletions` fetches all ids (`?idsOnly`) and deletes local songs,
   their saved audio, and albums the server no longer has (`sync-service.util.js:190`).
6. Write `lastFullSync` = now (`sync-service.util.js:283`).

The manual "sync now" button in `frontend/src/components/pwa-status.component.jsx:70` calls
`syncAll` directly.

## Known defects

- The automatic path never writes `lastFullSync`: `initializePwaData` (step 3) sets only the
  song and album markers, and step 6 lives in `syncAll`. So every online start re-downloads the
  whole catalog and never reconciles deletions, until a user presses manual sync.
  `frontend/src/utils/pwa/pwa-register.util.js:74`, `frontend/src/utils/pwa/sync-service.util.js:85`

## If you change this

- **Hits:** [songs store](../objects/local-db/songs-store.md),
  [albums store](../objects/local-db/albums-store.md),
  [syncMeta store](../objects/local-db/sync-meta-store.md),
  [audioFiles store](../objects/local-db/audio-files-store.md) (reconcile deletes audio),
  [pwa slice](../objects/app-state/pwa-slice.md), `?syncSince` / `?idsOnly` handling in the
  song and album controllers, `frontend/src/utils/api/songs-api.util.js`, `album-api.util.js`.
- **Does not hit:** [Playlist](../objects/data-model/playlist.md),
  [Service logbook](../objects/data-model/service-logbook.md) — neither is synced to the device.

## Surfaces

| Surface | Role |
|---|---|
| App start, reconnect | trigger |
| PWA status "sync now" | trigger |
| Songs, albums, lyrics pages | read the result |

## See

- Objects: [Song](../objects/data-model/song.md), [Album](../objects/data-model/album.md),
  [syncMeta store](../objects/local-db/sync-meta-store.md)
- Source: `frontend/src/utils/pwa/sync-service.util.js`
