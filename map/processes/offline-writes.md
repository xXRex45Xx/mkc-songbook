---
type: process
status: verified
verified: 2026-10-25 @ 3515b77
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
`{ queued: true }`, and the change is applied to the local copy at once
(`frontend/src/utils/pwa/optimistic-write.util.js`). On the next sync, `flushPendingWrites` replays the queue in order and
updates the counts in the [pwa slice](../objects/app-state/pwa-slice.md).

## Why this shape

Workbox `backgroundSync` would do nothing on iOS Safari, so the queue lives in the app
(`frontend/src/utils/pwa/write-queue.util.js:6`). A server answer (any HTTP status) is never
queued: only a missing network is. Replay sends the current login token and, for the first
edit of a record, `X-Base-Updated-At`; the backend answers 409 if the record is newer
(`backend/middlewares/base-version.middleware.js`).

## Steps

1. `sendMutation`: offline → queue; else send; HTTP error → throw to the caller; network
   exception → queue (`frontend/src/utils/pwa/write-queue.util.js:325`).
2. `queueWrite` stores url, method, headers without the token, body and the record version
   (`baseUpdatedAt`); then `applyOptimisticWrite` patches the local copy: IndexedDB songs, albums
   and the current user's favorites, and the cached `api-playlists` response; `FormData` (including audio and image
   files) is serialized so it survives in IndexedDB (`write-queue.util.js:61`, `:149`).
3. Replay runs first in every sync (`frontend/src/utils/pwa/pwa-register.util.js:83`):
   401 → keep and stop (sign in again); 409 → `permanent` with the server version kept, and later
   edits of that record likewise; other 4xx → `permanent`, continue; 5xx or network error →
   stop; success → remove
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

None known. Limits: `sendMutation` with `queueable: false` (local playlist upload) never
queues. Favorites carry no version, so they merge without a conflict check.

## If you change this

- **Hits:** `frontend/src/utils/pwa/optimistic-write.util.js`, the `checkBaseVersion` routes
  (song, album, playlist `PUT`/`PATCH`/`DELETE`), [pendingWrites store](../objects/local-db/pending-writes-store.md),
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
