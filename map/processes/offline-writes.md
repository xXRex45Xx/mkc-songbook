---
type: process
status: verified
verified: 2026-10-24 @ c8aefb1
description: Mutations made offline are queued in IndexedDB and replayed in order on reconnect.
consumes: [../objects/local-db/pending-writes-store.md]
produces: [../objects/local-db/pending-writes-store.md, ../objects/app-state/pwa-slice.md]
---

# offline-writes

How an edit made without network still reaches the server later.

## Input → Movement → Output

An API util calls `sendMutation` with a POST, PUT, PATCH or DELETE. If the device is offline or
the network fails, the request is saved to the
[pendingWrites store](../objects/local-db/pending-writes-store.md) and the caller gets
`{ queued: true }`. On the next sync, `flushPendingWrites` replays the queue in order and
updates the counts in the [pwa slice](../objects/app-state/pwa-slice.md).

## Why this shape

Workbox `backgroundSync` would do nothing on iOS Safari, so the queue lives in the app
(`frontend/src/utils/pwa/write-queue.util.js:6`). A server answer (any HTTP status) is never
queued: only a missing network is.

## Steps

1. `sendMutation`: offline → queue; else send; HTTP error → throw to the caller; network
   exception → queue (`frontend/src/utils/pwa/write-queue.util.js:325`).
2. `queueWrite` stores url, method, headers and body; `FormData` (including audio and image
   files) is serialized so it survives in IndexedDB (`write-queue.util.js:61`, `:149`).
3. Replay runs first in every sync (`frontend/src/utils/pwa/pwa-register.util.js:70`):
   4xx → mark `permanent` and continue; 5xx or network error → stop; success → remove
   (`write-queue.util.js:257`).
4. The PWA status component shows pending and failed counts and can clear failed entries
   (`frontend/src/components/pwa-status.component.jsx`).

Queued callers:

| Util | Function |
|---|---|
| `songs-api.util.js` | `addOrEditSong` `:110`, `patchSong` `:152`, `deleteSong` `:217` |
| `album-api.util.js` | `addOrEditAlbum` `:77`, `deleteAlbum` `:148` |
| `playlist-api.util.js` | `addOrEditPlaylist` `:76`, `patchPlaylist` `:114`, `deletePlaylist` `:170` |
| `user-api.util.js` | `updateFavoriteSongs` `:322` |

All paths are under `frontend/src/utils/api/`.

## Known defects

- Queued edits do not update the local stores, so offline pages show the old data until replay
  and the next sync. `frontend/src/pages/edit-playlist.page.jsx:115`
- Replay is last-write-wins with no conflict check; a stale queued edit overwrites newer server
  data (`write-queue.util.js:12`). A token that expires while queued fails the write for good
  (see [pendingWrites store](../objects/local-db/pending-writes-store.md)).

## If you change this

- **Hits:** [pendingWrites store](../objects/local-db/pending-writes-store.md),
  [pwa slice](../objects/app-state/pwa-slice.md), every util in the table above,
  `frontend/src/components/pwa-status.component.jsx`, [delta-sync](delta-sync.md) step 2.
- **Does not hit:** [local-playlist-upload](local-playlist-upload.md) — device playlists use
  their own path, not this queue.

## Surfaces

| Surface | Role |
|---|---|
| Admin edits songs/albums offline; any user edits playlists or favorites offline | fills the queue |
| Sync run | drains it |

## See

- Objects: [pendingWrites store](../objects/local-db/pending-writes-store.md)
- Source: `frontend/src/utils/pwa/write-queue.util.js`
