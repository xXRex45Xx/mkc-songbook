---
type: object
cluster: local-db
universe: live
status: verified
verified: 2026-10-25 @ aacc93d
entity: frontend/src/utils/db/indexed-db.util.js:58
code-name: syncMeta
description: Key-value markers (lastSongSync, lastAlbumSync, lastFullSync) for ?syncSince delta sync.
---

# syncMeta store

Remembers how far the device has synced. Store name `syncMeta`.

## Why this shape

Delta sync asks the server for records with `updatedAt >= lastSync`. `lastSongSync` and `lastAlbumSync` are the highest
`updatedAt` the device holds, not clock time, so client and server clocks need not agree.
`lastFullSync` is device clock time, written by the first-time load (`frontend/src/utils/pwa/sync-service.util.js:88`)
and by `syncAll` (`:288`); when it is missing, the next sync is a full sync.

## Shape

- keyPath `key`; records `{ key, value }`. `frontend/src/utils/db/indexed-db.util.js:58`
- Keys: `lastSongSync`, `lastAlbumSync`, `lastFullSync`.
  `frontend/src/utils/pwa/sync-service.util.js:30`
- Access: `syncMetaIdbService` (get, set). `frontend/src/utils/db/sync-meta-idb-service.util.js:17`

## Connected to

- **joins:** [songs store](songs-store.md), [albums store](albums-store.md).

## If you change this

- **Hits:** `frontend/src/utils/pwa/sync-service.util.js`,
  `frontend/src/utils/pwa/pwa-register.util.js` (picks full vs delta sync from
  `lastFullSync`, `:74`).
- **Does not hit:** the backend — it only reads `?syncSince`.

## Surfaces

| Surface | Role |
|---|---|
| `sync-service.util.js` | writes, reads |

## See

- Source: `frontend/src/utils/db/sync-meta-idb-service.util.js`
