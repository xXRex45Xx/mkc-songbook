# PWA Implementation Plan — MKC Songbook

## Overview

Modify the existing frontend application to support full PWA functionality including offline data access, incremental sync, and audio file downloads.

**Key Decisions:**
- **Album `updatedAt`**: Add `updatedAt` field to Album model for efficient delta sync
- **Sync strategy**: `updatedAt` delta sync — track max `updatedAt` from last sync, fetch only changed records
- **Page loading**: IndexedDB-first — serve from local store immediately, sync in background
- **Audio streaming**: NOT cached by service worker — explicit download button for offline access
- **Audio offline**: Downloaded audio stored in IndexedDB as Blobs for offline playback within the app

---

## Phase 1: Backend — Add `updatedAt` to Album + Delta Sync Endpoints

### 1.1 Add `updatedAt` field to Album model

**File:** `backend/models/album.model.js`

Add to schema:
```js
updatedAt: { type: Date, default: Date.now }
```

Update `updateAlbum` controller to set `updatedAt` on every save.

### 1.2 Add `?syncSince` query param to album controller

**File:** `backend/controllers/album.controller.js`

Modify `getAllOrSearchAlbums`:
- When `syncSince` is present, filter: `AlbumModel.find({ updatedAt: { $gte: new Date(syncSince) } })`
- When absent, return all albums (existing behavior unchanged)

### 1.3 Add `?syncSince` query param to song controller

**File:** `backend/controllers/song.controller.js`

Modify `getAllOrSearchSongs`:
- When `all=true` AND `syncSince` present, filter: `SongModel.find({ updatedAt: { $gte: new Date(syncSince) } })`
- When `all=true` without `syncSince`, return all songs (existing behavior unchanged)

### 1.4 Update album validation schema

**File:** `backend/models/validation-schemas/album.validation-schema.js`

Add `syncSince` to `getAllAlbumsQuerySchema`:
```js
syncSince: Joi.string().isoDate().optional()
```

### 1.5 Update song validation schema

**File:** `backend/models/validation-schemas/song.validation-shcema.js`

Add `syncSince` to `getAllSongsQuerySchema`:
```js
syncSince: Joi.string().isoDate().optional()
```

Ensure `syncSince` is allowed alongside `all` (not mutually exclusive).

---

## Phase 2: IndexedDB — New Object Stores & Services

### 2.1 Update `indexed-db.util.js`

**File:** `frontend/src/utils/db/indexed-db.util.js`

- Bump `DB_VERSION` from `1` to `2`
- Add new object stores to `STORE_SCHEMAS`:

| Store | keyPath | Indexes |
|-------|---------|---------|
| `songs` | `"_id"` | `"updatedAt"`, `"hasAudio"`, `"title"` |
| `albums` | `"_id"` | `"updatedAt"`, `"name"` |
| `syncMeta` | `"key"` | none (simple key-value store) |
| `audioFiles` | `"_id"` | none (stores audio Blobs) |

- Update `upgrade` handler to use `db.objectStoreNames.contains()` check before creating stores (migration-safe)

### 2.2 Create `song-idb-service.util.js`

**File:** `frontend/src/utils/db/song-idb-service.util.js`

Pattern matching `playlist-idb-service.util.js`:

| Method | Description |
|--------|-------------|
| `getAll()` | Returns all songs from IndexedDB |
| `getById(id)` | Returns single song by `_id` |
| `bulkPut(songs)` | Upserts an array of songs |
| `deleteById(id)` | Removes a song by `_id` |
| `getMaxUpdatedAt()` | Returns the maximum `updatedAt` value across all stored songs |

### 2.3 Create `album-idb-service.util.js`

**File:** `frontend/src/utils/db/album-idb-service.util.js`

Same pattern as song service:

| Method | Description |
|--------|-------------|
| `getAll()` | Returns all albums from IndexedDB |
| `getById(id)` | Returns single album by `_id` |
| `bulkPut(albums)` | Upserts an array of albums |
| `deleteById(id)` | Removes an album by `_id` |
| `getMaxUpdatedAt()` | Returns the maximum `updatedAt` value across all stored albums |

### 2.4 Create `sync-meta-idb-service.util.js`

**File:** `frontend/src/utils/db/sync-meta-idb-service.util.js`

Simple key-value store for sync timestamps:

| Method | Description |
|--------|-------------|
| `get(key)` | Returns value for key (e.g., `"lastSongSync"`, `"lastAlbumSync"`) |
| `set(key, value)` | Stores ISO timestamp string |

### 2.5 Create `audio-idb-service.util.js`

**File:** `frontend/src/utils/db/audio-idb-service.util.js`

Stores audio Blobs for offline playback:

| Method | Description |
|--------|-------------|
| `store(songId, blob)` | Stores audio Blob for a song |
| `get(songId)` | Returns audio Blob or null |
| `delete(songId)` | Removes cached audio |
| `exists(songId)` | Returns boolean |
| `getAllIds()` | Returns array of song IDs with cached audio |

---

## Phase 3: Frontend API — New Sync & Download Functions

### 3.1 Update `songs-api.util.js`

**File:** `frontend/src/utils/api/songs-api.util.js`

Add two new functions:

```js
getAllSongs()           // GET /api/song?all=true
getSongsSince(timestamp) // GET /api/song?all=true&syncSince=<iso>
```

### 3.2 Update `album-api.util.js`

**File:** `frontend/src/utils/api/album-api.util.js`

Add:

```js
getAlbumsSince(timestamp) // GET /api/album?syncSince=<iso>
```

### 3.3 Create `audio-download.util.js`

**File:** `frontend/src/utils/api/audio-download.util.js`

| Function | Description |
|----------|-------------|
| `downloadAudioFile(songId, songTitle)` | Fetches audio blob, triggers device download via `<a download>` attribute. Uses File System Access API (`showSaveFilePicker`) when available for better UX. Falls back to blob URL + click for other browsers. |
| `cacheAudioForOffline(songId)` | Fetches audio blob from `/api/song/{id}/audio`, stores in IndexedDB via `audioIdbService` |
| `getOfflineAudioBlob(songId)` | Returns audio Blob from IndexedDB or null if not cached |

---

## Phase 4: PWA Service Worker — Runtime Caching (No Audio Streaming)

### 4.1 Update `vite.config.js`

**File:** `frontend/vite.config.js`

Add `workbox` configuration to the existing `VitePWA` plugin:

```js
workbox: {
  runtimeCaching: [
    // Audio streaming — NOT cached, always network
    {
      urlPattern: /\/api\/song\/.*\/audio/i,
      handler: 'NetworkOnly',
    },
    // Song API responses — NetworkFirst with timeout
    {
      urlPattern: /\/api\/song.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-songs',
        networkTimeoutSeconds: 10,
      },
    },
    // Album API responses — NetworkFirst with timeout
    {
      urlPattern: /\/api\/album.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-albums',
        networkTimeoutSeconds: 10,
      },
    },
  ],
  navigateFallbackDenylist: [/^\/api/],
}
```

---

## Phase 5: PWA Initialization & Sync Orchestration

### 5.1 Create `sync-service.util.js`

**File:** `frontend/src/utils/pwa/sync-service.util.js`

| Function | Description |
|----------|-------------|
| `initializePwaData()` | First-time setup. Fetches all songs via `getAllSongs()` and all albums via `getAllAlbums()`. Bulk-puts into IndexedDB. Sets `lastSongSync` and `lastAlbumSync` to the max `updatedAt` from each response. |
| `syncSongs()` | Reads `lastSongSync` from syncMeta. Calls `getSongsSince(timestamp)`. Upserts changed records via `bulkPut()`. Updates `lastSongSync` to max `updatedAt` from response. Returns count of synced songs. |
| `syncAlbums()` | Same pattern for albums. Returns count of synced albums. |
| `syncAll()` | Runs `syncSongs()` and `syncAlbums()` in parallel. Returns `{ songsSynced, albumsSynced }`. |

### 5.2 Create `pwa-register.util.js`

**File:** `frontend/src/utils/pwa/pwa-register.util.js`

Uses `registerSW` from `virtual:pwa-register`:

| Callback | Behavior |
|----------|----------|
| `onOfflineReady` | If no `lastSongSync` exists in syncMeta → call `initializePwaData()`. Otherwise → call `syncAll()`. Dispatch Redux `setOfflineReady(true)`. |
| `onNeedRefresh` | Dispatch Redux `setNeedRefresh(true)`. UI shows "Update available" prompt. |
| `onRegisteredSW(swUrl, registration)` | Set `setInterval(() => registration.update(), 3600000)` — checks for SW updates every 1 hour. |
| `onRegisterError(error)` | Log error, dispatch Redux `setSyncError(error.message)`. |

Export `updateSW` function for manual page reload when new content is available.

### 5.3 Integrate into `main.jsx`

**File:** `frontend/src/main.jsx`

Import and call the PWA registration utility at app startup, before `createRoot()`:

```js
import { registerPwa } from './utils/pwa/pwa-register.util.js';
registerPwa();
```

---

## Phase 6: Redux Sync State + UI Components

### 6.1 Create `pwa.slice.js`

**File:** `frontend/src/store/slices/pwa.slice.js`

State shape:
```js
{
  offlineReady: false,
  needRefresh: false,
  lastSyncTime: null,    // ISO timestamp of last successful sync
  isSyncing: false,
  syncError: null,
}
```

Actions:
| Action | Payload |
|--------|---------|
| `setOfflineReady` | boolean |
| `setNeedRefresh` | boolean |
| `setSyncing` | boolean |
| `setSyncComplete` | `{ songsSynced, albumsSynced }` |
| `setSyncError` | string or null |

Register reducer in `store.js`.

### 6.2 Create `pwa-status.component.jsx`

**File:** `frontend/src/components/pwa-status.component.jsx`

Displays:
- **"App ready for offline use"** banner — shown when `offlineReady === true`, dismissable
- **"Update available — reload?"** toast — shown when `needRefresh === true`, has reload button that calls `updateSW()`
- **Sync status bar** — shows last sync time, "Sync Now" button that calls `syncAll()`, loading spinner during sync

### 6.3 Integrate into `App.jsx`

**File:** `frontend/src/App.jsx`

Add `<PwaStatus />` component to layout, rendered below `<Header />` and above `<Outlet />`.

---

## Phase 7: Pages — IndexedDB-First with Network Sync

### 7.1 Update `songs.page.jsx` loader

**File:** `frontend/src/pages/songs.page.jsx`

New loader behavior:
1. Read songs from IndexedDB first via `songIdbService.getAll()` — instant load
2. In background, trigger `syncSongs()` to fetch updates
3. Return IndexedDB data immediately
4. For search/sort queries (URL has `?q=`, `?sortby=`) that IndexedDB can't handle efficiently, fall back to network-only via existing `getAllOrSearchSongs()`

Component remains the same — still uses `defer()`/`Await`/`Suspense`.

### 7.2 Update `albums.page.jsx` loader

**File:** `frontend/src/pages/albums.page.jsx`

Same pattern:
1. Read albums from IndexedDB first via `albumIdbService.getAll()`
2. Background sync via `syncAlbums()`
3. For `?q=` search queries, fall back to network

### 7.3 Update `lyrics.page.jsx` loader

**File:** `frontend/src/pages/lyrics.page.jsx`

1. Try `songIdbService.getById(params.songId)` first
2. In background, fetch fresh data via `getSong()` and update IndexedDB
3. If not found in IndexedDB and offline, show offline error

### 7.4 Update `album.page.jsx` loader

**File:** `frontend/src/pages/album.page.jsx`

Same pattern as lyrics page:
1. Try `albumIdbService.getById(params.albumId)` first
2. Background fetch via `getAlbum()` and update IndexedDB

---

## Phase 8: Download Button + Offline Audio

### 8.1 Create `download-audio.component.jsx`

**File:** `frontend/src/components/download-audio.component.jsx`

Props:
| Prop | Type | Description |
|------|------|-------------|
| `songId` | string | Song identifier |
| `songTitle` | string | Song title (used for filename) |
| `hasAudio` | boolean | Whether song has an audio file |
| `size` | string | Button size (default: `"xxs"`) |

Behavior:
- On click: calls `downloadAudioFile(songId, songTitle)` — fetches audio blob, triggers device download
- Uses File System Access API (`showSaveFilePicker`) when available
- Falls back to `<a download>` with blob URL for other browsers
- Shows loading spinner during fetch
- Disabled when `hasAudio === false`

### 8.2 Update `song-tools.component.jsx`

**File:** `frontend/src/components/song-tools.component.jsx`

Add download button alongside existing play/edit/delete buttons:
- Import `DownloadSvg` from `../assets/download.svg?react`
- Add `<DownloadAudio songId={song._id} songTitle={song.title} hasAudio={song.hasAudio} />`
- Only show for non-admin users or when `showDownload` prop is true

### 8.3 Update `lyric-viewer.component.jsx`

**File:** `frontend/src/components/lyric-viewer.component.jsx`

Add download button to the header bar (near fullscreen/font-size buttons):
- Only show if `song.hasAudio === true`
- Uses existing `download.svg` icon

### 8.4 Update `audio-player.component.jsx`

**File:** `frontend/src/components/audio-player.component.jsx`

Modify audio source logic:
- When online: use streaming URL `${backendURL}/api/song/${id}/audio` (existing behavior)
- When offline: check `getOfflineAudioBlob(songId)`, create blob URL, use as src
- Add download button to `AudioPlayerToolbox` for currently playing song

---

## Phase 9: Backend Tests

### 9.1 Add tests for `?syncSince` param

**Files:**
- `backend/__tests__/controllers/album.controller.test.js`
- `backend/__tests__/controllers/song.controller.test.js`

Test cases:
- Returns only records with `updatedAt >= syncSince`
- Returns all records when `syncSince` is absent
- Returns empty array when `syncSince` is in the future
- Validation rejects invalid `syncSince` format

### 9.2 Run test suite

```bash
cd backend && npm test
```

Verify coverage stays above 80% across branches, functions, lines, statements.

---

## File Summary

### Modified Files

| File | Changes |
|------|---------|
| `backend/models/album.model.js` | Add `updatedAt` field |
| `backend/controllers/album.controller.js` | Add `syncSince` filtering |
| `backend/controllers/song.controller.js` | Add `syncSince` filtering alongside `all` |
| `backend/models/validation-schemas/album.validation-schema.js` | Add `syncSince` to schema |
| `backend/models/validation-schemas/song.validation-shcema.js` | Add `syncSince` to schema |
| `frontend/vite.config.js` | Add `workbox.runtimeCaching` config |
| `frontend/src/utils/db/indexed-db.util.js` | Bump version, add 4 new stores |
| `frontend/src/utils/api/songs-api.util.js` | Add `getAllSongs`, `getSongsSince` |
| `frontend/src/utils/api/album-api.util.js` | Add `getAlbumsSince` |
| `frontend/src/pages/songs.page.jsx` | IndexedDB-first loader |
| `frontend/src/pages/albums.page.jsx` | IndexedDB-first loader |
| `frontend/src/pages/lyrics.page.jsx` | IndexedDB-first loader |
| `frontend/src/pages/album.page.jsx` | IndexedDB-first loader |
| `frontend/src/main.jsx` | Import and call PWA registration |
| `frontend/src/App.jsx` | Add `<PwaStatus />` to layout |
| `frontend/src/components/song-tools.component.jsx` | Add download button |
| `frontend/src/components/lyric-viewer.component.jsx` | Add download button to header |
| `frontend/src/components/audio-player.component.jsx` | Offline audio source logic |

### New Files

| File | Purpose |
|------|---------|
| `frontend/src/utils/db/song-idb-service.util.js` | Song IndexedDB CRUD service |
| `frontend/src/utils/db/album-idb-service.util.js` | Album IndexedDB CRUD service |
| `frontend/src/utils/db/sync-meta-idb-service.util.js` | Sync metadata key-value store |
| `frontend/src/utils/db/audio-idb-service.util.js` | Audio Blob storage service |
| `frontend/src/utils/pwa/sync-service.util.js` | Sync orchestration logic |
| `frontend/src/utils/pwa/pwa-register.util.js` | Service worker registration wrapper |
| `frontend/src/utils/api/audio-download.util.js` | Audio download + offline cache |
| `frontend/src/store/slices/pwa.slice.js` | PWA sync state Redux slice |
| `frontend/src/components/pwa-status.component.jsx` | PWA status UI (offline ready, update prompt, sync button) |
| `frontend/src/components/download-audio.component.jsx` | Download audio button component |

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      PWA Install / First Run                 │
│                                                              │
│  1. Service Worker registers (registerType: "prompt")        │
│  2. onOfflineReady fires                                     │
│  3. initializePwaData() called                               │
│     ├── GET /api/song?all=true ──► bulkPut songs to IDB     │
│     ├── GET /api/album       ──► bulkPut albums to IDB      │
│     └── Set syncMeta timestamps                              │
│  4. App loads from IndexedDB instantly                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     Subsequent Visits / Sync                 │
│                                                              │
│  1. App loads songs/albums from IndexedDB (instant)          │
│  2. Background syncAll() triggered                           │
│     ├── GET /api/song?all=true&syncSince=<ts>               │
│     │   ──► upsert changed songs, update lastSongSync       │
│     ├── GET /api/album?syncSince=<ts>                       │
│     │   ──► upsert changed albums, update lastAlbumSync     │
│     └── Redux updated with sync status                       │
│  3. User sees updated data on next navigation                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     Audio Download / Offline                 │
│                                                              │
│  Online:                                                     │
│    - Click download button ──► fetch blob ──► device DL      │
│    - Audio player streams from /api/song/:id/audio           │
│                                                              │
│  Offline:                                                    │
│    - Audio player checks audioFiles IDB store                │
│    - If cached: creates blob URL, plays from IDB             │
│    - If not cached: shows "audio not available offline"      │
│    - Download button disabled offline                         │
└─────────────────────────────────────────────────────────────┘
```

## Notes

- Song `createdAt` is a String (year like `"2024"`) — unsuitable for delta sync. Using `updatedAt` (Date) instead.
- Album model currently has no `updatedAt` — Phase 1.1 adds it.
- Service worker `NetworkOnly` handler for `/api/song/:id/audio` ensures streaming is never cached by SW.
- Audio files for offline playback are stored explicitly in IndexedDB via user action (download button), not automatically.
- `registerType: "prompt"` means user is asked before activating a new service worker version.
