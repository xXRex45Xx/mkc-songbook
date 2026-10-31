# PWA Architecture — MKC Songbook

status: live, partly stale — §5.1, §7.2 and §12 lag the code ([audit-report.md](audit-report.md) B20). Code wins.

This document explains how the Progressive Web App (PWA) system works in the MKC Songbook codebase, as implemented on the `pwa-and-responsiveness` branch. It covers the backend delta-sync support, the IndexedDB local data layer, the service-worker runtime caching strategy, the sync orchestration, the offline audio feature, and the way route loaders integrate with it all.

> Companion to [plan.md](plan.md), which was the design brief. This document describes what was *actually* implemented (including a few deviations from the plan), not just what was planned.

---

## 1. Design Principles

The PWA layer is built around four decisions stated in the plan and reflected throughout the code:

1. **`updatedAt` delta sync** — Instead of re-fetching the full catalog on every sync, the client tracks the most recent `updatedAt` it has seen and asks the server only for records changed since then. Song `createdAt` is a String (a year like `"2024"`), so it is unsuitable for delta sync; `updatedAt` (a real Date) is used instead.
2. **IndexedDB-first page loading** — Route loaders return data from the local IndexedDB store immediately so the UI renders instantly, then trigger a background sync to refresh.
3. **Audio is NOT cached by the service worker** — Streaming endpoints stay network-only. Offline audio is an explicit, user-initiated action that stores the decoded `Blob` in IndexedDB.
4. **`registerType: "autoUpdate"`** — New service-worker versions activate automatically on the next navigation; no refresh prompt is shown.

---

## 2. Backend: Delta-Sync Support

The backend changes are small and additive. Their only job is to let the client ask "what changed since timestamp X?".

### 2.1 `updatedAt` on the Album model

`backend/models/album.model.js` gains a new field:

```js
updatedAt: { type: Date, default: Date.now },
```

The Song model already had an `updatedAt` field (set on every save). The Album model did not, so this adds it. To make the field meaningful, `updateAlbum` in `backend/controllers/album.controller.js` now explicitly sets `albumInDb.updatedAt = new Date()` on the in-place update path, and passes `updatedAt: new Date()` when the album's `_id` changes and a new document is created via `AlbumModel({ ... })`. Without this, edits would not bump `updatedAt` and delta sync would never see album changes.

(Note: the create-album path was not modified, so newly created albums rely on the schema `default: Date.now` for their initial `updatedAt`. That is fine because the initial `initializePwaData` full-fetch captures them.)

### 2.2 The `?syncSince` query parameter

Both list controllers now accept an optional `syncSince` ISO-date query param and translate it into a MongoDB `updatedAt: { $gte: new Date(syncSince) }` filter.

**Albums** (`backend/controllers/album.controller.js` — `getAllOrSearchAlbums`):
```js
const { names, q, syncSince } = req.query;
let regex;
if (q) regex = new RegExp(regexBuilder(q), "i");
const filter = {};
if (q) filter.name = { $regex: regex };
if (syncSince) filter.updatedAt = { $gte: new Date(syncSince) };
let albums = await AlbumModel.find(filter, names ? { name: true } : null);
```
The previous ternary (`q ? { name: {...} } : {}`) was replaced by an accumulated `filter` object so that `q` (search) and `syncSince` (sync) can be combined.

**Songs** (`backend/controllers/song.controller.js` — `getAllOrSearchSongs`):
```js
const { q, page = 1, all, type, sortBy, syncSince } = req.query;
const projection = "title songFilePath";
let filter = {};
if (syncSince) filter.updatedAt = { $gte: new Date(syncSince) };
if (all) songs = await SongModel.find(filter);
```
`syncSince` only applies on the `all=true` path (the full-catalog fetch the PWA uses). The paginated/search path is unchanged.

### 2.3 Validation schemas

`syncSince` was added as an optional ISO-date field to both query schemas:
- `backend/models/validation-schemas/album.validation-schema.js` → `getAllAlbumsQuerySchema`
- `backend/models/validation-schemas/song.validation-shcema.js` → `getAllSongsQuerySchema`

For songs, `syncSince` coexists with the existing `.oxor("q", "all")` and `.and("q", "type")` rules. Because the PWA only ever sends `syncSince` together with `all=true` (never with `q`), the `oxor` constraint is not violated.

### 2.4 Tests

`backend/__tests__/controllers/{album,song}.controller.test.js` add a `... with syncSince` describe block covering: absent `syncSince` returns all records, `syncSince` filters by `updatedAt >= date`, a future `syncSince` returns an empty array, and (albums) `syncSince` can be combined with a `q` search. The existing `all: true` song test was updated from `toHaveBeenCalledWith()` to `toHaveBeenCalledWith({})` to match the new `filter = {}` default.

---

## 3. IndexedDB: Local Data Layer

All offline data lives in one IndexedDB database, `mkc-songbook-db`, managed by `frontend/src/utils/db/indexed-db.util.js` via the `idb` library.

### 3.1 Schema version bump & migration-safe upgrade

`DB_VERSION` was bumped from `1` to `2`. The `upgrade()` handler is migration-safe: it iterates `STORE_SCHEMAS` and **skips any store that already exists** (`if (db.objectStoreNames.contains(storeName)) continue`) before creating it. This means an existing v1 database (which only had `localPlaylists` + its `remoteId` index) is upgraded in place — the four new stores are added without touching existing data.

Four new object stores were added:

| Store | keyPath | Indexes | Purpose |
|-------|---------|---------|---------|
| `songs` | `_id` | `updatedAt`, `hasAudio`, `title` | Mirrors the song catalog |
| `albums` | `_id` | `updatedAt`, `name` | Mirrors the album catalog |
| `syncMeta` | `key` | — | Key-value store for sync timestamps |
| `audioFiles` | `_id` | — | Stores audio `Blob`s keyed by song id |

The `_id` keyPath is used because the server documents already carry MongoDB `_id` strings, so upserts are identity-stable.

### 3.2 IDB service modules

Each store gets a thin service module exposing CRUD helpers. They all follow the same pattern: open the shared DB via `getDB()`, run an `idb` operation, and return.

- **`song-idb-service.util.js`** / **`album-idb-service.util.js`** — `getAll()`, `getById(id)`, `bulkPut(items)` (a single `readwrite` transaction with one `put` per item, awaited via `tx.done`), `deleteById(id)`, and `getMaxUpdatedAt()`. `getMaxUpdatedAt()` loads all records and reduces over `new Date(updatedAt)`; it returns an ISO string or `null`. (Note: it scans the whole store rather than using the `updatedAt` index — correct, just not optimally indexed.)
- **`sync-meta-idb-service.util.js`** — a true key-value store. Each entry is `{ key, value }`. `get(key)` returns `entry.value` or `null`; `set(key, value)` does `db.put`. Used to persist `lastSongSync` and `lastAlbumSync` timestamps.
- **`audio-idb-service.util.js`** — `store(songId, blob)` writes `{ _id: songId, blob }`, `get(songId)` returns the `Blob`, plus `delete`, `exists`, and `getAllIds` (via `getAllKeys`).

---

## 4. Frontend API Layer: Sync + Download Functions

`frontend/src/utils/api/` gained three new fetchers, all plain `fetch` + JSON (the song and album readers send no credentials; authenticated calls go through `apiFetch` in `api-client.util.js`, which sends the HttpOnly session cookies):

- **`songs-api.util.js`**
  - `getAllSongs()` → `GET /api/song?all=true` (initial full fetch)
  - `getSongsSince(timestamp)` → `GET /api/song?all=true&syncSince=<iso>`
- **`album-api.util.js`**
  - `getAlbumsSince(timestamp)` → `GET /api/album?syncSince=<iso>`
  - (Note: `initializePwaData` reuses the pre-existing `getAllAlbums()` rather than a new `getAllAlbumsSince` for the initial full fetch.)

All return the parsed JSON body, throwing `{ message, status }` on a non-OK response.

- **`audio-download.util.js`** — the offline-audio helper, described in §7.

---

## 5. Service Worker & Runtime Caching

The PWA shell is built by `vite-plugin-pwa`, configured in `frontend/vite.config.js`.

### 5.1 devOptions

```js
devOptions: { enabled: true, type: "module" }
```
This enables the service worker during `vite dev`; the generated SW is served from `/dev-sw.js?dev-sw` and the manifest from `/manifest.webmanifest`. `type: "module"` matches the project's ESM setup. In production the plugin forces `classic` registration for browser compatibility.

### 5.2 Workbox runtime caching

Three runtime-caching rules are layered on top of the precache:

| URL pattern | Handler | Cache | Why |
|-------------|---------|-------|-----|
| `/api/song/*/audio` | **NetworkOnly** | — | Audio streaming must never be served from a stale cache; offline audio is handled separately via IndexedDB Blobs (§7). |
| `/api/song*` | NetworkFirst (10s timeout) | `api-songs` | Song JSON: try network, fall back to cache when offline/slow. |
| `/api/album*` | NetworkFirst (10s timeout) | `api-albums` | Album JSON: same strategy. |

`navigateFallbackDenylist: [/^\/api/]` prevents API navigation requests from falling back to the app shell.

This is a belt-and-suspenders layer: the *primary* offline data source is IndexedDB (§6), but the SW's NetworkFirst caches provide a fast fallback for API responses the app hasn't explicitly stored.

### 5.3 Registration (`pwa-register.util.js`)

`frontend/src/main.jsx` imports and calls `registerPwa()` at startup (before `createRoot`). `registerPwa` wraps `registerSW` from `virtual:pwa-register` and wires its callbacks into the Redux store:

| Callback | Behavior |
|----------|----------|
| `onOfflineReady` | Dispatch `setSyncing(true)`; if no `lastSongSync` in syncMeta → `initializePwaData()` (first run), else → `syncAll()`; on success dispatch `setSyncComplete(...)`, on error `setSyncError(...)`; finally `setOfflineReady(true)`. |
| `onNeedRefresh` | `setNeedRefresh(true)` → UI shows the "Update available" prompt. |
| `onRegisteredSW` | `setInterval(() => registration.update(), 3600000)` — polls for a new SW every hour. |
| `onRegisterError` | Log + `setSyncError(...)`. |

`updateSW()` (exported) calls the captured `updateSwCallback(true)` to activate a waiting SW and reload — invoked by the "Reload" button in the status UI.

---

## 6. Sync Orchestration (`sync-service.util.js`)

This is the heart of the data-sync logic. It coordinates the API fetchers, the IDB services, and the syncMeta timestamps.

### 6.1 `initializePwaData()` — first run

```js
const [songResponse, albums] = await Promise.all([getAllSongs(), getAllAlbums()]);
const songs = songResponse.songs || songResponse;   // normalize either {songs:[]} or []
await songIdbService.bulkPut(songs);
await albumIdbService.bulkPut(albums);
const maxSongUpdatedAt = await songIdbService.getMaxUpdatedAt();
const maxAlbumUpdatedAt = await albumIdbService.getMaxUpdatedAt();
if (maxSongUpdatedAt) await syncMetaIdbService.set("lastSongSync", maxSongUpdatedAt);
if (maxAlbumUpdatedAt) await syncMetaIdbService.set("lastAlbumSync", maxAlbumUpdatedAt);
```
Fetches the full catalog in parallel, bulk-upserts it, and seeds both sync cursors from the max `updatedAt` of the stored data. The `songResponse.songs || songResponse` guard handles the song endpoint returning `{ songs, totalPages }` while the album endpoint returns a bare array.

### 6.2 `syncSongs()` / `syncAlbums()` — incremental delta sync

Both follow the same shape:

1. Read the last-sync cursor from syncMeta. **If none exists, fall back to `initializePwaData()`** and return the local count — a self-healing path that ensures a missing cursor never leaves the client stuck.
2. Otherwise call `getSongsSince(lastSync)` / `getAlbumsSince(lastSync)`.
3. If the response is non-empty, `bulkPut` the changed records, then compute the new max `updatedAt` **by reducing over the fetched batch** (not by re-scanning the whole store) and persist it as the new cursor.

The cursor is only advanced when changed records arrive. If a sync returns `[]`, the cursor is left untouched — correct, since nothing newer exists.

### 6.3 `syncAll()`

```js
const [songsSynced, albumsSynced] = await Promise.all([syncSongs(), syncAlbums()]);
return { songsSynced, albumsSynced };
```
Runs both entity syncs concurrently.

### 6.4 Redux state (`pwa.slice.js`)

State: `{ offlineReady, needRefresh, lastSyncTime, isSyncing, syncError }`.
Reducers: `setOfflineReady`, `setNeedRefresh`, `setSyncing`, `setSyncComplete` (clears `isSyncing`, stamps `lastSyncTime = now`, clears error), `setSyncError`. Registered in `store.js` as `pwa`.

A subtlety: `setSyncComplete` ignores its payload and always sets `lastSyncTime` to "now". The counts returned by `syncAll` are therefore not surfaced through Redux (the `onOfflineReady` path even dispatches `setSyncComplete({ songsSynced: 0, albumsSynced: 0 })` regardless of actual counts). The counts are only meaningful as the resolved return value of `syncAll()`.

---

## 7. Offline Audio

Audio gets special treatment because streaming and offline storage are deliberately separate.

### 7.1 Download (`audio-download.util.js`)

- `saveAudioOffline(songId, onProgress)` — fetches `/api/song/:id/audio` as a stream (progress against `Content-Length`) and stores the Blob in the `audioFiles` IDB store for in-app offline playback. Nothing is written to the device's files. Wired to the download button in `download-audio.component.jsx`, which publishes progress to `state.pwa.audioDownloads` for the table row's progress bar.
- `saveAudioForOffline(songIds, onProgress)` / `saveAllAudioForOffline(onProgress)` — bulk save for an album, a playlist, the queue, or the whole catalog. Skips cached songs, checks `navigator.storage.estimate()` before each fetch, and reports progress to the UI.
- `getOfflineAudioBlob(songId)` — returns the cached Blob or `null`.

### 7.2 The download button (`download-audio.component.jsx`)

A small Flowbite `Button` rendering the `download.svg` icon. It shows a `CustomTailSpin` while a download is in flight and renders a disabled, low-opacity button when `hasAudio` is false. `e.stopPropagation()` keeps the click from bubbling (it lives inside row/list item click targets).

It is surfaced in three places:
- `song-tools.component.jsx` — next to the play/favorite controls on each song row.
- `lyric-viewer.component.jsx` — in the lyric header bar, only when `song.hasAudio`.
- `audio-player-toolbox.component.jsx` — for the currently-playing track (desktop layout), only when that track `hasAudio`.

### 7.3 Offline playback (`audio-player.component.jsx`)

The player used to derive its `<audio src>` inline from the streaming URL. It now maintains an `audioSrc` state populated by a `useEffect` that runs on `currentSongIdx`/`queue` changes:

```js
if (!navigator.onLine) {
  const offlineBlob = await getOfflineAudioBlob(songId);
  if (offlineBlob) { setAudioSrc(URL.createObjectURL(offlineBlob)); return; }
}
setAudioSrc(`${backendURL}/api/song/${songId}/audio`);
```

When online, it streams as before. When offline, it falls back to a cached Blob URL. If offline with no cached blob, it sets the streaming URL (which will simply fail to load — there is no explicit "audio not available offline" message in this implementation, a deviation from the plan).

Note: the created blob URL is never explicitly revoked in this effect, which is a minor leak across track changes.

---

## 8. Route Loaders: IndexedDB-First

The four content pages were converted from network-only loaders to IndexedDB-first loaders. The shared pattern: try the local store, return it immediately via `defer(...)` if present, and kick off a background sync/refresh; otherwise fall back to the network.

| Page | Local source | Background action | Network fallback |
|------|-------------|--------------------|------------------|
| `songs.page.jsx` | `songIdbService.getAll()` | `syncSongs()` | `getAllOrSearchSongs(...)` |
| `albums.page.jsx` | `albumIdbService.getAll()` | `syncAlbums()` | `getAllAlbums(false, {q})` |
| `lyrics.page.jsx` | `songIdbService.getById(songId)` | `getSong(songId)` → `bulkPut([fresh])` | `getSong(songId)` (deferred) |
| `album.page.jsx` | `albumIdbService.getById(albumId)` | `getAlbum(albumId)` → `bulkPut([fresh])` | `getAlbum(albumId)` (deferred) |

Key behaviors:
- **Search/sort queries bypass the cache.** The songs/albums loaders detect an active `q` (and, for songs, a `sortBy`) and go straight to the network, since IndexedDB can't reproduce the server's search/sort semantics. Plain listing → IndexedDB.
- **`songFilePath` is stripped** from songs returned to the UI (`songFilePath: undefined`). The list pages and lyrics page both do this, so the local file path (a server-side detail, irrelevant and potentially leaky client-side) never reaches components.
- **`defer()` is always used** so the existing `<Await>`/`<Suspense>` rendering in each page component keeps working unchanged — when the loader returns a plain local value, `defer` just resolves it immediately.
- **Detail pages self-heal the cache.** `lyrics.page.jsx` and `album.page.jsx` fire a background `getSong`/`getAlbum` and `bulkPut` the fresh result, so visiting a song refreshes that record in IDB even outside a full sync. These background promises `.catch(() => {})` so an offline failure never breaks the local render.

### ⚠️ Bug introduced in `songs.page.jsx`

The loader changed:
```js
- sortBy: searchParams.get("sortby"),
+ sortBy: searchParams.get("allby"),
```
This reads the `allby` query param instead of `sortby`. Since the UI almost certainly still navigates with `?sortby=`, **server-side sort will no longer take effect from the songs page**, and any `sortBy` value will always be `undefined`, pushing the loader onto the IndexedDB-first path even when the user intended to sort. This looks like an accidental typo and is the most significant correctness issue in the diff. (All the other loaders and the plan itself use `sortby`.)

---

## 9. PWA Status UI (`pwa-status.component.jsx`)

Mounted in `App.jsx` between `<Header />` and `<Outlet />`. It reads `state.pwa` and renders up to two stacked banners:

1. **Offline-ready banner** (green) — shown when `offlineReady && showOfflineBanner` (local dismiss state).
2. **Failed-writes banner** (warning) — shown when `failedWrites > 0`. "Discard" calls `clearFailedWrites()`.

The sync status bar (last sync time, pending changes, offline marker, sync error, upload-pending playlists, and the "Sync Now" button) was removed. Sync is therefore triggered only automatically through `registerPwa`: app start, service worker ready, the `online` event, and the app returning to the foreground (`visibilitychange`, at most once every five minutes, together with a service worker update check). Sync state still lives in `state.pwa`; nothing renders it.

---

## 10. End-to-End Data Flow

### First install / first run
```
SW registers (registerType: "autoUpdate")
  → onOfflineReady fires
  → no lastSongSync in syncMeta → initializePwaData()
      GET /api/song?all=true   ─► bulkPut songs  ─► set lastSongSync = max(updatedAt)
      GET /api/album           ─► bulkPut albums ─► set lastAlbumSync = max(updatedAt)
  → setOfflineReady(true) → UI shows "App ready for offline use"
```

### Subsequent visits
```
Route loader (e.g. songs.page)
  → songIdbService.getAll() ─► defer({ songData }) rendered instantly
  → background syncSongs()
      GET /api/song?all=true&syncSince=<lastSongSync>
      ─► bulkPut changed songs ─► advance lastSongSync
User sees refreshed data on next navigation.
```

### Offline
```
List/detail pages: served from IndexedDB (instant).
Audio player:
  navigator.onLine === false
    → getOfflineAudioBlob(songId)
    → cached? createObjectURL(blob) → <audio src>
    → not cached? streaming URL set (will fail; no explicit offline message)
Service worker:
  /api/song* & /api/album* → NetworkFirst falls back to api-songs/api-albums cache
  /api/song/*/audio       → NetworkOnly (never cached)
```

### Audio download (online)
```
Click DownloadAudio ─► saveAudioOffline(songId, onProgress)
  ─► fetch /api/song/:id/audio as a stream (progress → state.pwa.audioDownloads)
  ─► store Blob in the audioFiles IDB store
```

---

## 11. File Inventory

### New files
| File | Role |
|------|------|
| `frontend/src/utils/db/song-idb-service.util.js` | Song IndexedDB CRUD + `getMaxUpdatedAt` |
| `frontend/src/utils/db/album-idb-service.util.js` | Album IndexedDB CRUD + `getMaxUpdatedAt` |
| `frontend/src/utils/db/sync-meta-idb-service.util.js` | Key-value store for sync cursors |
| `frontend/src/utils/db/audio-idb-service.util.js` | Audio Blob storage |
| `frontend/src/utils/pwa/sync-service.util.js` | `initializePwaData` / `syncSongs` / `syncAlbums` / `syncAll` |
| `frontend/src/utils/pwa/pwa-register.util.js` | `registerSW` wrapper → Redux + `updateSW` |
| `frontend/src/utils/api/audio-download.util.js` | `saveAudioOffline` / `getOfflineAudioBlob` |
| `frontend/src/store/slices/pwa.slice.js` | PWA Redux slice |
| `frontend/src/components/pwa-status.component.jsx` | Offline-ready / update / sync-status UI |
| `frontend/src/components/download-audio.component.jsx` | Download button |

### Modified files
| File | Change |
|------|--------|
| `backend/models/album.model.js` | `updatedAt` field |
| `backend/controllers/album.controller.js` | `syncSince` filter; `updatedAt` set on update |
| `backend/controllers/song.controller.js` | `syncSince` filter on `all=true` path |
| `backend/models/validation-schemas/album.validation-schema.js` | `syncSince` allowed |
| `backend/models/validation-schemas/song.validation-shcema.js` | `syncSince` allowed |
| `backend/__tests__/controllers/{album,song}.controller.test.js` | `syncSince` tests |
| `frontend/vite.config.js` | `devOptions` + Workbox `runtimeCaching` |
| `frontend/src/utils/db/indexed-db.util.js` | DB version 2 + 4 stores, migration-safe upgrade |
| `frontend/src/utils/api/songs-api.util.js` | `getAllSongs`, `getSongsSince` |
| `frontend/src/utils/api/album-api.util.js` | `getAlbumsSince` |
| `frontend/src/main.jsx` | `registerPwa()` at startup |
| `frontend/src/store/store.js` | `pwa` reducer |
| `frontend/src/App.jsx` | `<PwaStatus />` in layout |
| `frontend/src/pages/{songs,albums,lyrics,album}.page.jsx` | IndexedDB-first loaders |
| `frontend/src/components/{audio-player,audio-player-toolbox,lyric-viewer,song-tools}.component.jsx` | Offline audio src + download buttons |

---

## 12. Observations & Deviations from the Plan

These are worth flagging for whoever next touches this code:

1. **`cacheAudioForOffline` is wired to the "Save offline" button** in `download-audio.component.jsx`, so the `audioFiles` IDB store is written by the current UI. Offline audio playback has a real source. (§7)
2. **`setSyncComplete` stores its payload** — the `songsSynced`/`albumsSynced`/`songsRemoved`/`albumsRemoved` counts from `syncAll()` are persisted to Redux and shown in the status bar. (§6.4)
3. **`getMaxUpdatedAt` uses the `updatedAt` index** in descending order, so it reads a single entry instead of scanning the whole store. (§3.2)
4. **Blob URLs are revoked after the new source loads** — the previous track's URL is held alive in `pendingBlobUrlRef` until `onCanPlay` fires, so a fast track change cannot revoke a URL the element is still playing. (§7.3)
5. **Offline audio surfaces a message** — the player sets `audioUnavailable` and renders "Audio not saved for offline playback" when a stream fails and no local copy exists. (§7.3)
6. **Local playlists upload automatically** — `createLocalPlaylist` enqueues the id and `performSync` drains unsynced playlists before the delta sync, so a playlist created on a train reaches the server when the connection returns. (§6.3)
7. **Installation is offered explicitly** — `beforeinstallprompt`/`appinstalled` are captured in `install.util.js`, an Install button renders in the header, and iOS Safari gets a static "Add to Home Screen" line since it has no install event. (§5)
8. **The manifest is complete** — `id`, `display_override`, `orientation`, `categories`, `shortcuts`, `?source=pwa`, separate `any`/`maskable` 192+512 icons, and ICO/PNG favicon links. (§5)

Items 1, 2, 4, 5 and 6 above were defects at the time this document was written and have since been fixed; the remaining items describe behaviour that is intentional or out of scope.
7. **Create-album path doesn't set `updatedAt` explicitly** — relies on the schema `default: Date.now`. Fine for initial fetch, but worth noting if the create flow is ever used as a sync source. (§2.1)