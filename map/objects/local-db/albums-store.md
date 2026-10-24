---
type: object
cluster: local-db
universe: live
status: verified
verified: 2026-10-24 @ 9db0d0c
entity: frontend/src/utils/db/indexed-db.util.js:51
code-name: albums
description: IndexedDB copy of Album records, keyed by _id.
---

# albums store

The device's copy of the [Album](../data-model/album.md) collection. Store name `albums`.

## Why this shape

Same local-first pattern as the [songs store](songs-store.md): pages read here first, sync
fills it in the background.

## Shape

- keyPath `_id`; indexes `updatedAt`, `name`. `frontend/src/utils/db/indexed-db.util.js:51`
- Access: `albumIdbService`. `frontend/src/utils/db/album-idb-service.util.js:17`

## Connected to

- **joins:** [syncMeta store](sync-meta-store.md) holds `lastAlbumSync`.
- **looks-like-but-is-not:** [Album](../data-model/album.md) — server shape, cached as returned.

## If you change this

- **Hits:** `frontend/src/utils/pwa/sync-service.util.js`, `frontend/src/pages/albums.page.jsx`,
  `frontend/src/pages/album.page.jsx`. A new index needs a `DB_VERSION` bump.
- **Does not hit:** the [songs store](songs-store.md).

## Surfaces

| Surface | Role |
|---|---|
| `sync-service.util.js` | writes |
| Album pages | read |

## See

- Source: `frontend/src/utils/db/album-idb-service.util.js`
