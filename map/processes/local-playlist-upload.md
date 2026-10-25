---
type: process
status: verified
verified: 2026-10-24 @ c8aefb1
description: After sign-in, device-only playlists are uploaded once as private server playlists.
consumes: [../objects/local-db/local-playlists-store.md]
produces: [../objects/data-model/playlist.md, ../objects/local-db/local-playlists-store.md, ../objects/app-state/local-playlists-slice.md]
---

# local-playlist-upload

Moves playlists made on the device, possibly before the user had an account, onto the server.

## Input → Movement → Output

Every record in the [localPlaylists store](../objects/local-db/local-playlists-store.md) with
`synced: false` is posted to `POST /api/playlist`. On success the server id is saved as
`remoteId`, the record is marked `synced: true`, and the
[localPlaylists slice](../objects/app-state/local-playlists-slice.md) is told with
`markAsSynced`. The result is a new [Playlist](../objects/data-model/playlist.md).

## Why this shape

Visitors can build playlists without an account. Uploading on the first signed-in sync keeps
their work. Uploads are always `private`, so nothing becomes visible to others without the user
choosing it.

## Steps

1. Runs in every sync, after the write queue and before data sync, only when a token exists
   (`frontend/src/utils/pwa/pwa-register.util.js:106`).
2. `syncAllUnsyncedPlaylists` loops the unsynced records one by one; a failure is recorded and
   the loop continues (`frontend/src/utils/api/local-playlist-api.util.js:214`).
3. `syncPlaylistToServer` builds `FormData` with `name`, `visibility: "private"` and each
   song `_id`, then calls `addOrEditPlaylist` (`local-playlist-api.util.js:183`).
4. If the response has `insertedId`: `markSynced` in IndexedDB and `markAsSynced` in Redux
   (`local-playlist-api.util.js:194`, `frontend/src/utils/db/playlist-idb-service.util.js:138`).

## Known defects

- Duplicate upload: `addOrEditPlaylist` goes through `sendMutation`, so a network failure
  queues the POST and returns no `insertedId`. The record stays unsynced; on the next sync the
  queue creates the playlist, then this step uploads it again.
  `frontend/src/utils/api/local-playlist-api.util.js:192`
- One-shot: editing a playlist after upload does not reset `synced`, so later changes never
  reach the server copy. `frontend/src/utils/db/playlist-idb-service.util.js:97`

## If you change this

- **Hits:** [localPlaylists store](../objects/local-db/local-playlists-store.md),
  [localPlaylists slice](../objects/app-state/local-playlists-slice.md),
  `frontend/src/utils/api/playlist-api.util.js`, `backend/controllers/playlist.controller.js`
  (`createPlaylist` response shape), [offline-writes](offline-writes.md).
- **Does not hit:** the [playlist slice](../objects/app-state/playlist-slice.md) (audio queue).

## Surfaces

| Surface | Role |
|---|---|
| Signed-in sync run | triggers |
| Local playlists page | shows synced state |

## See

- Objects: [localPlaylists store](../objects/local-db/local-playlists-store.md),
  [Playlist](../objects/data-model/playlist.md)
- Source: `frontend/src/utils/api/local-playlist-api.util.js`
