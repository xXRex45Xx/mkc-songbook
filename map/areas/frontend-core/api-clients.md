---
type: area
cluster: frontend-core
universe: live
status: verified
owns: [frontend/src/utils/api/*.js, frontend/src/utils/regex.util.js, frontend/src/utils/amharic-map.util.js, frontend/src/utils/offline-search.util.js]
description: "Frontend API clients: which function calls which endpoint, and who imports it."
verified: 2026-11-17 @ aa5e440
---

# API clients

One util per backend resource. Song, album and playlist writes, and `updateFavoriteSongs`, go through `sendMutation` so they queue offline ([offline-writes](../../processes/offline-writes.md)). Everything else (auth, `updateUserRole`, `signOut`, logbook) calls `apiFetch` and does not queue.

## Files

| File | Role | Endpoints |
|---|---|---|
| `frontend/src/utils/api/api-client.util.js` | `apiFetch`: credentials, CSRF header on unsafe methods, one 401 refresh-and-retry under a Web Lock (`:76`) | POST `/api/user/session/refresh` (:27) |
| `frontend/src/utils/api/user-api.util.js` | Auth, OTP, profile, favorites, session (`requestOTP` :28 to `migrateLegacyToken` :419) | see [user-api](../backend-api/user-api.md) |
| `frontend/src/utils/api/songs-api.util.js` | `getAllOrSearchSongs` :19, `getSong` :39, `addOrEditSong` :59, `patchSong` :125, sync reads :157-188, `deleteSong` :201 | [song-api](../backend-api/song-api.md) |
| `frontend/src/utils/api/album-api.util.js` | `getAllAlbums` :17, `getAllAlbumsDetailed` :41 (`?all=true`, first-start load), `addOrEditAlbum` :56, `getAlbum` :108, sync reads :125-143, `deleteAlbum` :156 | [album-api](../backend-api/album-api.md) |
| `frontend/src/utils/api/playlist-api.util.js` | `getAllPlaylists` :19, `addOrEditPlaylist` :50, `patchPlaylist` :91, `getPlaylist` :122, `deletePlaylist` :139 | [playlist-and-logbook-api](../backend-api/playlist-and-logbook-api.md) |
| `frontend/src/utils/api/logbook-api.util.js` | `getAllOrSearchLogBook` :16 (page only) | GET `/api/logbook` |
| `frontend/src/utils/api/local-playlist-api.util.js` | Device-only playlists in IndexedDB; `syncPlaylistToServer` :183 uploads through `addOrEditPlaylist` | none direct |
| `frontend/src/utils/api/audio-download.util.js` | Offline audio with Range resume | GET `/api/song/:id/audio` (:90) |
| `frontend/src/utils/offline-search.util.js` | Client-side filter and sort when offline | none |
| `frontend/src/utils/amharic-map.util.js` | Amharic-aware highlight regex (`regexBuilder` :98); backend has its own copy | none |
| `frontend/src/utils/regex.util.js` | `emailRegex` for `user-api.util.js` | none |

Importers: pages call the resource utils from loaders and actions ([routes and pages](../frontend-ui/routes-and-pages.md)); components call them from handlers ([player and songs](../frontend-ui/components-player-and-songs.md), [collections, auth, shell](../frontend-ui/components-collections-auth-shell.md)). The API origin comes from `frontend/src/config/backend-url.config.js`.

## Connected to

- **objects:** [user slice](../../objects/app-state/user-slice.md), [localPlaylists store](../../objects/local-db/local-playlists-store.md), [audioFiles store](../../objects/local-db/audio-files-store.md)
- **processes:** [offline-writes](../../processes/offline-writes.md), [offline-audio](../../processes/offline-audio.md), [local-playlist-upload](../../processes/local-playlist-upload.md), [auth](../../processes/auth.md)
- **areas:** [pwa and storage](pwa-and-storage.md) (`write-queue.util.js`, `session.util.js`), the four `backend-api` cards

## Known defects

- `songs-api.util.js:87`: `parseInt(formData.get("tempo") < 30)`; the tempo check never fires.
- `user-api.util.js:263`: `searchQuery.q` unguarded when called with no argument.
- No frontend caller for POST `/api/logbook` or `/api/user/session/logout-all`.

## If you change this

- **Hits:** the matching backend route and validator; the loader or component that imports the function; the service worker rules in `frontend/vite.config.js` for any GET read offline.
- **Does not hit:** IndexedDB services unless the function also writes a store.

## See

- Source: `frontend/src/utils/api/`
