---
type: area
cluster: frontend-core
universe: live
status: verified
owns: [frontend/src/utils/db/*.js, frontend/src/utils/pwa/*.js, frontend/src/utils/session.util.js, frontend/src/store/store.js, frontend/src/store/slices/*.js, frontend/src/hooks/*.js]
description: "IndexedDB services, PWA runtime (sync, write queue, install), session state, Redux store."
verified: 2026-11-17 @ 94c53c6
---

# PWA and storage

Offline machinery and client state. The nouns are cards in [local-db](../../objects/local-db/_index.md) and [app-state](../../objects/app-state/_index.md); this card says which file does what.

## Files

| File | Role | Key exports |
|---|---|---|
| `frontend/src/utils/db/indexed-db.util.js` | Opens `mkc-songbook-db`, `DB_VERSION` 4, declares `STORE_SCHEMAS` :33 | `getDB`, `resetDatabase` :221 |
| `frontend/src/utils/db/{song,album,audio,playlist,sync-meta,user}-idb-service.util.js` | One service per store (`songIdbService`, `albumIdbService`, `audioIdbService`, `playlistIdbService` for `localPlaylists`, `syncMetaIdbService`, `userIdbService` with key `current`) | `getAll`, `getById`, `put`, `deleteById` |
| `frontend/src/utils/pwa/pwa-register.util.js` | Service worker registration; triggers sync on start, `online` and foreground | `registerPwa` :239 |
| `frontend/src/utils/pwa/sync-service.util.js` | Incremental songs and albums sync, deletion reconcile | `initializePwaData` :114, `syncSongs` :131, `syncAlbums` :164, `reconcileDeletions` :200, `syncAll` :251 |
| `frontend/src/utils/pwa/album-image-cache.util.js` | Background cover prefetch into the Workbox `album-images` cache after the first sync | `prefetchAlbumImages` :48, `ALBUM_IMAGE_CACHE` :14 |
| `frontend/src/utils/pwa/write-queue.util.js` | Offline mutation queue and replay with `X-Base-Updated-At` | `sendMutation` :438, `flushPendingWrites` :317, `clearFailedWrites` :275 |
| `frontend/src/utils/pwa/optimistic-write.util.js` | Patches local caches after a queued write | `applyOptimisticWrite` :176 |
| `frontend/src/utils/pwa/install.util.js` | Install prompt capture | `promptInstall` :53, `setupInstallListeners` :92 |
| `frontend/src/utils/session.util.js` | Signed-in flag (`mkc:signed-in`), logout-pending flag, legacy token, user cache cleanup | `startSession` :113, `endSession` :133, `isSignedIn` :66 |
| `frontend/src/store/store.js` | `configureStore` with `configs`, `user`, `playlist`, `localPlaylists`, `pwa` | default store |
| `frontend/src/store/slices/*.slice.js` | One slice per card in [app-state](../../objects/app-state/_index.md) | actions |
| `frontend/src/hooks/useWindowSize.hook.js` | Writes window width to `configs` | default hook |
| `frontend/src/hooks/use-fresh-result.hook.js` | Shows the local search result and swaps in the server's answer for the same request when it resolves; ignores a late answer to an earlier search | `useFreshResult` :24 |

Service worker caching rules live in `frontend/vite.config.js` ([build and config](build-and-config.md)).

## Entry points

`main.jsx:18` calls `registerPwa`. `App.jsx` loader calls `startSession`, `userIdbService`, `getAllLocalPlaylists`. Pages call `syncSongs` and `syncAlbums` ([routes and pages](../frontend-ui/routes-and-pages.md)). Every write util calls `sendMutation`.

## Connected to

- **objects:** all [local-db](../../objects/local-db/_index.md) and [app-state](../../objects/app-state/_index.md) cards
- **processes:** [delta-sync](../../processes/delta-sync.md), [offline-writes](../../processes/offline-writes.md), [offline-audio](../../processes/offline-audio.md), [auth](../../processes/auth.md), [local-playlist-upload](../../processes/local-playlist-upload.md)
- **areas:** [api clients](api-clients.md), [middlewares](../backend-api/middlewares.md) (`checkBaseVersion`)

- `optimistic-write.util.js` copies song fields into IndexedDB on a queued PUT (`applySongWrite`, rythm at :94) and patches only `name`, `visibility`, `songs` for playlists (:129): a new field must be added there or offline edits do not show until sync.
- `session.util.js` `endSession` clears cached user data; a new per-user store must be cleared there too.

## Known defects

- `frontend/src/store/slices/playlist.slice.js:13` names its slice variable `configsSlice` (copy-paste; works).

## If you change this

- **Hits:** a new IndexedDB store needs `STORE_SCHEMAS`, a `DB_VERSION` bump, a service file, and a card in [local-db](../../objects/local-db/_index.md) (`resetDatabase` deletes the whole database, so it needs no edit); a new queued write route needs `RESOURCE_PATTERN` in `optimistic-write.util.js:16` checked.
- **Does not hit:** backend models, except the `?syncSince` and `?idsOnly` reads in [song-api](../backend-api/song-api.md) and [album-api](../backend-api/album-api.md).

## See

- Source: `frontend/src/utils/db/`, `frontend/src/utils/pwa/`
