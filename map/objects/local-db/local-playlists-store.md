---
type: object
cluster: local-db
universe: live
status: verified
verified: 2026-10-24 @ 9db0d0c
entity: frontend/src/utils/db/indexed-db.util.js:34
code-name: localPlaylists
description: Device-only playlists, optionally uploaded and linked to a server Playlist by remoteId.
---

# localPlaylists store

Playlists that live on the device, so visitors without an account can make them. Store name
`localPlaylists`.

## Why this shape

Ids are `local_<uuid>` so they never collide with server ObjectIds. `synced` and `remoteId`
record whether and where the playlist was uploaded once the user signs in.

## Shape

- keyPath `id`; indexes `synced`, `createdAt`, `remoteId`.
  `frontend/src/utils/db/indexed-db.util.js:34`
- Record: `{ id, name, songs, createdAt, updatedAt, synced: false, remoteId: null }`.
  `frontend/src/utils/db/playlist-idb-service.util.js:70`
- Access: `playlistIdbService` — despite the name, it serves this store only.
  `frontend/src/utils/db/playlist-idb-service.util.js:16`

## Connected to

- **joins:** [Playlist](../data-model/playlist.md) through `remoteId` after upload
  (`frontend/src/utils/api/local-playlist-api.util.js:196`).
- **looks-like-but-is-not:** [localPlaylists slice](../app-state/local-playlists-slice.md),
  the in-memory mirror; [playlist slice](../app-state/playlist-slice.md), the audio queue.

## If you change this

- **Hits:** `frontend/src/utils/api/local-playlist-api.util.js`,
  [localPlaylists slice](../app-state/local-playlists-slice.md),
  `frontend/src/pages/local-playlists.page.jsx`,
  `frontend/src/utils/pwa/pwa-register.util.js` (uploads unsynced playlists after sign-in).
- **Does not hit:** the [songs store](songs-store.md) — songs are referenced by id only.

## Surfaces

| Surface | Role |
|---|---|
| Any visitor, signed in or not | writes, reads |

## See

- Source: `frontend/src/utils/db/playlist-idb-service.util.js`
