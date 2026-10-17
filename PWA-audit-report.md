# Comprehensive PWA Audit and Implementation Review

**Project:** MKC Choir Songbook (`mkc-songbook`)
**Scope audited:** `frontend/` (React 18 + Vite 5 + `vite-plugin-pwa` 1.1.0 / Workbox 7.4.0), `backend/` (Express 4 + Mongoose 8), built output in `frontend/dist/`.
**Method:** Static source review of the service worker, manifest, registration, caching, sync, IndexedDB layer, route loaders, and offline playback paths; inspection of the generated `dist/sw.js` and `dist/manifest.webmanifest`; cross-check against `vite-plugin-pwa` and Workbox documentation. No browser was driven, so Lighthouse numbers below are derived from the build output, not measured.
**Date:** audit run against the working tree at commit `fa2f32c`.

---

## 1. Executive Summary

The PWA layer is real and mostly well engineered. The service worker registers, precaches the full app shell, serves an SPA navigation fallback, and caches song and album API responses. A genuine offline data layer exists: songs and albums are mirrored into IndexedDB and route loaders read IndexedDB first, then sync in the background. Delta sync via `?syncSince` is implemented on both the client and the backend, and is tested.

The audit found **12 broken features** and **23 code-level defects**. The three most serious are:

1. **A logged-in user cannot use the app offline.** The root loader in `App.jsx` rethrows any network failure, which rejects the deferred promise, which throws inside `<Await>`, which is caught by the root `errorElement`. The user sees the error page instead of the offline catalog. This defeats the entire IndexedDB-first design for the audience most likely to be logged in.
2. **Album search is broken online and offline.** `getAllAlbums` builds the URL as `/api/albumq=Grace` with no `?` separator, so the request never reaches the album router. Album search returns a 404.
3. **The "New update available" banner is invisible.** It uses Tailwind classes (`bg-primary-100`, `text-primary-800`, `text-success-800`, `hover:bg-neutrals-300`) that are not defined in `tailwind.config.js`, so the update prompt renders with no background. Users are never told an update is waiting, which is the whole point of `registerType: "prompt"`.

Beyond the defects, the PWA has structural gaps: no background sync, no install-prompt UI, no image caching, no playlist offline support, no online/offline event handling, no storage persistence, and no deployment configuration that guarantees HTTPS.

The offline story is strongest for anonymous users browsing songs, albums, and lyrics. It is weakest for logged-in members, who are the primary users.

**Health rating:** shell and caching — solid. Offline data — solid for songs/albums, absent for playlists and images. Install and update UX — weak. Reliability under constrained networks — weak for logged-in users.

---

## 2. Critical Flaws (Broken Features)

### 1. Logged-in users get the error page when offline

`App.jsx:62-99` runs the root loader. When a token exists, it calls `getCurrentLoggedInUser(token)`. Offline, `fetch` rejects with `TypeError: Failed to fetch`; the `catch` at `App.jsx:90-97` only handles `error.status === 401`, so it rethrows. The deferred promise rejects, `<Await resolve={data?.user}>` at `App.jsx:39` throws, and React Router renders the root `errorElement` (`ErrorPage`). Every page under `/` is replaced.

`ErrorPage` prints "Error loading data. Please check your internet connection" — the app is unusable offline for any signed-in user.

**Fix:** treat a network failure as "offline", not as a fatal error. Cache the user in IndexedDB and serve it, and swallow network errors in the root loader:

```js
// App.jsx loader, inside getUser()
const getUser = async () => {
  try {
    const data = await getCurrentLoggedInUser(token);
    store.dispatch(setCurrentUser(data.user));
    await userIdbService.put(data.user);          // new: persist for offline
    await loadLocalPlaylists();
    return null;
  } catch (error) {
    if (error.status === 401) {
      localStorage.removeItem("_s");
      await loadLocalPlaylists();
      return null;
    }
    const cached = await userIdbService.get();     // offline path
    if (cached) store.dispatch(setCurrentUser(cached));
    await loadLocalPlaylists();
    return null;
  }
};
```

Add a `users` object store to `STORE_SCHEMAS` in `indexed-db.util.js` and bump `DB_VERSION` to 3.

### 2. Album search returns 404

`album-api.util.js:14-23` builds:

```js
`${backendURL}/api/album${namesOnly ? "?names=true" : ""}${searchQuery?.q ? "q=" + searchQuery.q : ""}`
```

With `namesOnly = false` and `q = "Grace"`, the URL is `http://host/api/albumq=Grace`. Express mounts the router at `/api/album`, and `albumq=Grace` is not a path boundary match, so the request 404s. `albums.page.jsx:76` calls exactly this path for every search.

**Fix:** build the query with `URLSearchParams`:

```js
export const getAllAlbums = async (namesOnly = false, searchQuery = null) => {
  const params = new URLSearchParams();
  if (namesOnly) params.set("names", "true");
  if (searchQuery?.q) params.set("q", searchQuery.q);
  const qs = params.toString();
  const response = await fetch(`${backendURL}/api/album${qs ? `?${qs}` : ""}`);
  ...
};
```

Apply the same pattern to `songs-api.util.js:18-30`, which hand-builds `&q=`/`&type=`/`&sortBy=` and will break on any value containing `&`, `#`, or `+`.

### 3. The update-available banner renders invisible

`pwa-status.component.jsx:73` uses `bg-primary-100` and `text-primary-800`; `tailwind.config.js:16-22` defines `primary` with `DEFAULT`, `400`, `500`, `600`, `700` only. `bg-primary-100` and `text-primary-800` are not generated, so the banner has a transparent background. `text-success-800` (line 61), `text-success-900` (line 65), `hover:text-primary-900` (line 84), and `hover:bg-neutrals-300` (line 107) are also undefined.

With `registerType: "prompt"`, the service worker stays in `waiting` until the user reloads. If the banner is invisible, the app ships a new version that never activates.

**Fix:** use defined tokens, e.g. `bg-warning-100 text-warning-300`, `text-success-300`, `hover:bg-neutrals-200`. Add the missing shades to `tailwind.config.js` if the design needs them.

### 4. Album cover images are never cached

`albums.page.jsx:48` renders `imgSrc={backendURL + album.photoLink}`, served by `backend/index.js:173-184` from `/static/albums/images`. `vite.config.js:64-85` has no rule for image URLs, so offline the album grid shows broken images. The album JSON is cached; the covers are not.

**Fix:** add a `CacheFirst` rule with expiration for the static image path:

```js
{
  urlPattern: ({ pathname, sameOrigin }) => sameOrigin && pathname.startsWith("/static/albums/images"),
  handler: "CacheFirst",
  options: {
    cacheName: "album-images",
    expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 },
    cacheableResponse: { statuses: [0, 200] },
  },
}
```

### 5. Playlists are not available offline

`vite.config.js` has no rule for `/api/playlist`, and `playlists.page.jsx` / `playlist.page.jsx` fetch from the network for every non-`local_` playlist. `getFavorites()` (`user-api.util.js:345`) is also uncached, so `/playlists/favorites` fails offline.

**Fix:** add `NetworkFirst` for `/api/playlist` and `/api/user/favorites`, and mirror the user's playlists into IndexedDB using the existing `localPlaylists` pattern.

### 6. No background sync, no request queue

`local-playlists.slice.js:30, 100-119` define `syncPromptQueue`, `addToSyncPromptQueue`, `shiftSyncPromptQueue`, `clearSyncPromptQueue`. Nothing dispatches them. `syncAllUnsyncedPlaylists` (`local-playlist-api.util.js:202`) is never called from any component. Unsynced local playlists are uploaded only when the user opens a playlist and presses "Upload".

There is no `sync` tag registration in the service worker, no `BackgroundSyncPlugin`, and no `sync.js` file. A user who creates a playlist on a train, then goes offline, has no automatic path to delivery.

**Fix:** register a background sync in `vite.config.js` and drain the queue in the sync handler:

```js
{
  urlPattern: /\/api\/playlist.*/i,
  method: "POST",
  handler: "NetworkOnly",
  options: {
    backgroundSync: { name: "playlist-queue", options: { maxRetentionTime: 24 * 60 } },
  },
}
```

Then add `sync.js` (Workbox `registerSync` + `addSync`), dispatch `addToSyncPromptQueue` on create/update, and drain it in the `sync` event.

### 7. The service worker is disabled in development

`vite.config.js:23-26` sets `devOptions.enabled: false`. `npm run dev` has no service worker, so no PWA behaviour is testable during development. `frontend/dev-dist/sw.js` is a stale artifact from an earlier config (dated Apr 28) and is not used.

**Fix:** set `devOptions.enabled: true` for local PWA testing, and delete `dev-dist/` from the tree.

### 8. Songs-page sorting is broken

`songs.page.jsx:72` reads `searchParams.get("allby")`. `sort-dropdown.component.jsx:42` writes `sortby`, and `search-bar.component.jsx:54-55` preserves `sortby`. `sortBy` is always `undefined`, so `hasSearchParams` at line 75 is false for a sort action, the loader takes the IndexedDB path, and the server-side sort never runs. The dropdown label updates; the list does not.

**Fix:** read the same key the UI writes:

```js
sortBy: searchParams.get("sortby"),
```

Then sort the IndexedDB result locally for the offline path, and pass `sortBy` to the network path.

### 9. Offline audio is opt-in per song, with no bulk save and no failure message

`cacheAudioForOffline` (`audio-download.util.js:61`) is wired to the "Save offline" button in `download-audio.component.jsx:56-67`, so the `audioFiles` store does get written. But there is no way to save a playlist, an album, or the whole catalog. `audio-player.component.jsx:76-85` falls back to the streaming URL when no blob exists, and the `<audio>` element at line 192 has no `onError` handler, so playback fails silently with no message.

**Fix:** add `onError` on the audio element, set an `audioUnavailable` state, and render "Audio not saved for offline" in the player. Add a bulk-save action that iterates `songIdbService.getAll()` filtered by `hasAudio` and calls `cacheAudioForOffline` with a progress indicator.

### 10. Deleted records never leave IndexedDB

`sync-service.util.js` only upserts. `getSongsSince` / `getAlbumsSince` return records with `updatedAt >= cursor`; a record deleted on the server is simply absent from the response, so the local copy stays forever. A song deleted server-side remains playable offline, and the album detail page will render a song that no longer exists.

**Fix:** have the list endpoints return tombstones (deleted IDs with `updatedAt`) when `syncSince` is present, and `deleteById` them in `syncSongs` / `syncAlbums`.

### 11. No install UI, no install guidance, no iOS instructions

There is no `beforeinstallprompt` listener anywhere in `src/` (grep confirms zero matches), no `appinstalled` listener, and no install button. Chrome shows its own icon in the address bar, but the app never offers an explicit "Install" action, and iOS Safari has no install prompt at all — it needs a Share → Add to Home Screen instruction page, which does not exist.

**Fix:** capture the event, store it, and render an install button:

```js
let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  store.dispatch(setInstallable(true));
});
window.addEventListener("appinstalled", () => store.dispatch(setInstalled(true)));

export const promptInstall = () => deferredPrompt?.prompt();
```

Add a static "Add to Home Screen" help card for iOS (Safari Share menu → Add to Home Screen).

### 12. No deployment configuration that guarantees HTTPS

A PWA requires a secure context. The repo has no frontend Dockerfile, no nginx/Caddy/Vercel/Netlify config, and `frontend/.env` points at `http://localhost:4000`. `backend/Dockerfile` exposes plain HTTP on 8080. `README.md:127` mentions a production domain in prose only. As committed, there is no path to a deployable, installable PWA.

**Fix:** add a frontend Dockerfile that serves `dist/` behind TLS, and put the frontend and backend on the same origin (reverse-proxy `/api` to the backend) so the service worker can precache API responses without CORS.

---

## 3. Logic Errors and Bugs

### L1. `totalPages` is off by one

`backend/controllers/song.controller.js:53` and `:125` compute `Math.floor(totalDocuments / 100) + 1`. With 100 songs, this returns 2 pages; with 200, it returns 3. The last page is empty.

**Fix:** `Math.max(1, Math.ceil(totalDocuments / 100))`.

### L2. Offline pagination is dead

`songs.page.jsx:88-95` returns every local song with `totalPages: 1`, ignoring the `page` param. With a catalog larger than 100, the online view paginates and the offline view does not, so the page control and the offline list disagree.

**Fix:** slice the local array by `page` and compute `totalPages` from `localSongs.length`.

### L3. The sync bar disappears permanently after dismissing the offline banner

`pwa-status.component.jsx:45-48` sets `offlineReady` to false on dismiss. The sync bar at line 92 is gated on `offlineReady`, so dismissing the green banner also removes the "Sync Now" control. `offlineReady` is only set again by the next `onOfflineReady`, which fires only on the next service-worker install.

**Fix:** keep `offlineReady` true and gate the green banner on `showOfflineBanner` alone.

### L4. `setSyncComplete` discards its payload

`pwa.slice.js:38-42` ignores `action.payload` and stamps `lastSyncTime` with the current time. `pwa-register.util.js:40` dispatches `setSyncComplete({ songsSynced: 0, albumsSynced: 0 })` regardless of the real counts. The UI reports a sync that may have transferred zero records.

**Fix:** store the counts, and pass the real result from `syncAll()`.

### L5. `lastSyncTime` is not persisted

`pwa.slice.js:20` keeps `lastSyncTime` in memory. Every app launch shows "Not yet synced" even when IndexedDB is fresh, because the slice is rebuilt from `initialState`.

**Fix:** persist the timestamp in `syncMeta` and load it during `registerPwa`.

### L6. `onRegisterError` reports a registration failure as a sync error

`pwa-register.util.js:54-57` dispatches `setSyncError(error.message)`, so the UI prints "Sync error: <registration failure>". The user is told the data sync failed when the service worker never installed.

**Fix:** add a `setSwError` reducer and render it separately.

### L7. The update poll is never cleared

`pwa-register.util.js:51` creates a `setInterval` that is never cleared. It keeps polling in a background tab, which costs a `sw.js` fetch per hour.

**Fix:** store the id, clear it on `visibilitychange` to hidden, restore on visible.

### L8. Delta sync re-fetches the cursor record

`sync-service.util.js:61` sends `syncSince=<lastSync>`, and `song.controller.js:43` filters `updatedAt: { $gte: new Date(syncSince) }`. The record whose `updatedAt` equals the cursor is returned on every sync, forever. `bulkPut` makes this idempotent, so the cost is bandwidth, not correctness.

**Fix:** use `$gt` on the server, or store `lastSync + 1ms` on the client.

### L9. `getMaxUpdatedAt` scans the whole store

`song-idb-service.util.js:75-84` calls `db.getAll()` and reduces over every record, ignoring the `updatedAt` index defined at `indexed-db.util.js:38`. On a large catalog this reads every song, including full lyrics, on every first-run sync.

**Fix:** use the index cursor in descending order:

```js
const idx = db.transaction(STORE_NAME).index("updatedAt");
const max = await idx.iterate(null, "prev").next();
return max ? new Date(max.updatedAt).toISOString() : null;
```

### L10. Blob URLs can be revoked while in use

`audio-player.component.jsx:61-66` revokes the previous blob URL at the start of the effect, and the cleanup at line 88 revokes again. A fast track change can revoke a URL that the `<audio>` element is still using.

**Fix:** revoke in the `src` swap path after the element has loaded the new source, not in the effect cleanup.

### L11. `autoPlay` is unhandled

`audio-player.component.jsx:213` sets `autoPlay`. Browsers block autoplay without a user gesture, and `play()` rejects with `NotSupportedError`. There is no `.catch`, so the rejection is unobserved and the play/pause state desyncs.

**Fix:** remove `autoPlay`, call `play()` from the user gesture, and `.catch` the promise.

### L12. No online/offline listeners

Nothing in `src/` listens for `online` / `offline` events. `audio-player.component.jsx:76` checks `navigator.onLine` only when the track changes. When the connection drops mid-playback, `onStalled` at line 208 sets `isPlaying` false and nothing recovers. When the connection returns, no sync runs.

**Fix:** add a listener in `registerPwa` that dispatches `setOnline(online)` and calls `syncAll()` on reconnect.

### L13. `Access-Control-Allow-Origin` is set to a list

`backend/index.js:176-178` sets the header to `process.env.ALLOWED_ORIGINS.split(",")`, an array. Node joins it to `"a, b"`, which is not a valid single-origin value, so browsers reject it. The static album images are consumed by `<img>` (no CORS needed), so the practical impact is limited, but any `fetch` of an album image will fail.

**Fix:** echo the request origin, as the `cors` middleware already does.

### L14. `ALLOWED_ORIGINS` crash at startup

`backend/index.js:131` calls `process.env.ALLOWED_ORIGINS.split(",")` with no guard. If the variable is unset, the process throws at boot.

**Fix:** default to `[]` and validate at startup.

### L15. `crossOrigin="anonymous"` on the audio element

`audio-player.component.jsx:212` sets `crossOrigin="anonymous"`. The streaming endpoint must send `Access-Control-Allow-Origin` for the exact frontend origin. If `ALLOWED_ORIGINS` does not include it, every audio stream fails. It is also applied to `blob:` URLs, where it is meaningless.

**Fix:** drop `crossOrigin` for blob URLs; keep it for the streaming URL and verify the CORS allow-list.

### L16. `cors` origin list must match exactly

`backend/index.js:130-133` uses an array of origins. A trailing slash, a port mismatch, or `http` vs `https` fails silently. There is no logging when a request origin is rejected.

**Fix:** normalize the list and log the resolved origin.

### L17. `api-songs` and `api-albums` caches grow without bound

`vite.config.js:69-84` sets no `expiration`. Every delta sync requests a unique URL (`?all=true&syncSince=<timestamp>`), so each sync adds a permanent cache entry. Over months, the Cache Storage grows with a full copy of the catalog per sync.

**Fix:** add `expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 }` to both rules.

### L18. No storage quota handling

Nothing calls `navigator.storage.estimate()` or `navigator.storage.persist()`. The `songs` store holds full documents including lyrics, and `audioFiles` holds MP3 blobs. On a phone with a small quota, IndexedDB can be evicted by the browser with no warning and no recovery.

**Fix:** request persistence at `onOfflineReady`, check `estimate()` before bulk writes, and surface a "storage full" state.

### L19. `initializePwaData` has no size guard

`sync-service.util.js:24-43` fetches the entire catalog in one transaction. A bulk `put` of every song with full lyrics can fail on quota, and `tx.done` rejects with no partial-progress recovery.

**Fix:** chunk `bulkPut` into batches of 50 and record progress in `syncMeta`.

### L20. `hasAudio` index is defined and never queried

`songs.page.jsx:91` and `lyrics.page.jsx:57` strip `songFilePath`, which is correct. `hasAudio` is computed server-side at `song.controller.js:130` and survives into IndexedDB. The `hasAudio` index at `indexed-db.util.js:39` is never used.

**Fix:** use the index for the bulk-save feature, or drop the index.

### L21. `album-viewer` hard-codes `hasAudio: true`

`album-viewer.component.jsx:104` maps every song to `hasAudio: true`. Songs without audio are shown as playable, the play action is enabled, and the stream fails.

**Fix:** use the real `hasAudio` from the album response.

### L22. The `songs` index set does not support the sorts the UI performs

`songs.page.jsx` offers `A-Z`, `Number`, and `Recently Added`. The store indexes `updatedAt`, `hasAudio`, `title`, and `createdAt` is not indexed, so "Recently Added" cannot be produced locally.

**Fix:** add a `createdAt` index and sort locally with the `title` index.

### L23. `LAST_SONG_SYNC_KEY` is duplicated

`pwa-register.util.js:19` and `sync-service.util.js:13` both define the constant. They agree today. A change to one will silently break the cursor.

**Fix:** export one constant from `sync-meta-idb-service.util.js`.

---

## 4. PWA Best Practice Violations

### B1. Manifest: no `id`

`vite.config.js:27-62` omits `id`. Android uses `id` to identify an installed app across updates. Without it, a change to `start_url` or `scope` can create a second installed app.

### B2. Manifest: combined icon purpose

`vite.config.js:53-55` declares `purpose: "any maskable"` on one icon. Chrome recommends separate entries for `any` and `maskable`. A combined entry is treated as `any` by some Android versions, so the maskable safety zone is applied to an icon that was not designed for it.

### B3. Manifest: no 192 maskable icon

Only a 512 maskable icon exists. Android needs both 192 and 512.

### B4. Manifest: no `shortcuts`

`shortcuts` gives app shortcuts from the launcher icon. For a songbook, `Songs`, `Albums`, `Playlists`, `Schedule` are obvious candidates. Missing.

### B5. Manifest: `start_url` has no source attribution

`start_url: "/"` gives no way to distinguish a PWA launch from a browser launch. Use `/?source=pwa` and read it at startup.

### B6. Manifest: no `orientation`, `categories`, `screenshots`

`orientation` prevents unwanted rotation prompts; `categories` (`music`) and `screenshots` improve store listing. All missing.

### B7. Favicon: SVG only, no ICO fallback in HTML

`index.html:5` links only `/logo.svg`. `favicon.ico`, `favicon-16x16.png`, and `favicon-32x32.png` exist in `public/` and are precached, but no `<link>` references them. Safari does not support SVG favicons, so the tab shows a generic icon.

**Fix:** add `<link rel="icon" href="/favicon.ico" sizes="any">` after the SVG link.

### B8. No `theme-color` for dark scheme

`index.html:10` sets one `theme-color`. `src/index.css` declares `color-scheme: light dark`, but the app has no dark theme. This is a minor gap, not a defect.

### B9. No `display_override`

`display: "standalone"` is set. Adding `display_override: ["standalone", "minimal-ui"]` gives a graceful fallback on Android where standalone is unavailable.

### B10. No `beforeinstallprompt` / `appinstalled` handling

Covered as Critical Flaw 11. It is also a best-practice violation because Lighthouse's "Installable manifest" passes while the user gets no install affordance.

### B11. Service worker scope and permissions

The service worker scope is `/`, which is correct for a SPA. No `Service-Worker-Allowed` header is required. No push, geolocation, notification, or persistent-storage permissions are requested. The permission surface is clean. Compliant.

### B12. No `Content-Security-Policy` on the frontend

The backend sets helmet's default CSP on API responses, which does not cover the frontend host. The frontend has no CSP meta tag and no server header. A PWA serving precached JS from its own origin should ship a CSP.

### B13. No `Strict-Transport-Security` on the frontend host

The backend helmet stack sets HSTS by default, but the frontend host, which serves the manifest and service worker, has no config in the repo.

### B14. No performance budget, no Lighthouse trace

The build precaches 50 entries totalling ~1.1 MB raw (`dist/`). The critical path on first load pulls `index-c6ApRUft.js` (26 KB gz), `vendor-CPqi8l-5.js` (126 KB gz), `ui-Dhk25_fu.js` (28 KB gz), `auth-and-feedback` (2 KB gz), `dragdrop` (13 KB gz), and `index-DXgJBP0K.css` (15.6 KB gz) — about 210 KB gzip, all required before the app renders, because `index.html` emits `modulepreload` for all four chunks. On a slow 3G link this is roughly 4–6 seconds to first render. `dragdrop` is preloaded on every page, including pages with no drag-and-drop.

**Fix:** drop `dragdrop` from the initial preload set, and add a Lighthouse budget file to CI.

### B15. No offline fallback page

The navigation fallback serves `index.html`, which is correct. There is no dedicated offline page, so offline failures surface as the React error page.

### B16. No `broadcast-update`

`BroadcastUpdatePlugin` is not configured, so a client that accepts an update reloads its own tab only. With multiple tabs open, the others keep running the old version. Add `broadcastUpdate: { channels: ["pwa-notify"] }` and show a "reload" toast in each tab.

### B17. No `navigationPreload`

`navigationPreload` is not enabled. On a cold start over a slow network, the service worker starts and then begins fetching the shell. Preloading the document lets the fetch run in parallel with the worker boot, which measurably improves startup on constrained networks.

**Fix:** add `navigationPreload: true` to the workbox config and enable it in `onRegisteredSW`.

### B18. No `cacheableResponse` on API caches

`vite.config.js:69-84` has no `cacheableResponse` plugin. Workbox NetworkFirst caches 200 responses by default, so opaque responses from a cross-origin API are not cached. If the API is cross-origin and non-CORS, nothing is cached at all.

### B19. No PWA tests

`backend/__tests__` covers `syncSince` on both controllers. There are no frontend tests at all, and no test covers `sync-service.util.js`, `pwa-register.util.js`, the IndexedDB services, or the loaders. The 80% coverage threshold applies to the backend only.

**Fix:** add Vitest tests for `sync-service.util.js` (cursor advance, empty delta, missing cursor, delete tombstone) and for the loaders with a mocked IndexedDB.

### B20. `PWA-plan.md` and `PWA-architecture.md` are stale

`PWA-architecture.md` §7.2 states that `cacheAudioForOffline` is unused; it is now wired to the "Save offline" button in `download-audio.component.jsx:56-67`. §5.1 documents `devOptions.enabled: true`; the config sets `false`. §12 item 2 is out of date. The docs describe a state that no longer matches the code.

---

## 5. Prioritized Recommendations

Ordered by impact. P1 items restore broken features; P2 items close structural gaps; P3 items are polish.

### P1.1 — Make the app usable offline for logged-in users

1. Add a `users` object store to `indexed-db.util.js` and bump `DB_VERSION` to 3.
2. Persist `data.user` in `App.jsx` `getUser()` after a successful fetch.
3. In the `catch`, serve the cached user on any non-401 failure and return `null` instead of rethrowing.
4. Add `NetworkFirst` for `/api/user/current-user` and `/api/user/favorites` in `vite.config.js`.
5. Verify by opening the app, logging in, killing the network, and reloading. The songs list must render.

### P1.2 — Fix album search

1. Replace the hand-built URL in `album-api.util.js:14-23` with `URLSearchParams`.
2. Do the same in `songs-api.util.js:18-30`.
3. Add a backend integration test that asserts `GET /api/album?q=Grace` returns matches.

### P1.3 — Make the update prompt visible

1. Replace the undefined Tailwind classes in `pwa-status.component.jsx` with defined tokens.
2. Add the missing shades to `tailwind.config.js` if the design requires them.
3. Verify: deploy a new build, open the app, confirm the banner renders with a background, press Reload, confirm the page reloads.

### P1.4 — Fix songs-page sorting

1. Change `songs.page.jsx:72` to `searchParams.get("sortby")`.
2. Sort the IndexedDB result locally for the offline path using the `title` index and `createdAt`.
3. Verify: select "A - Z" and confirm the order changes.

### P1.5 — Cache album cover images

1. Add the `CacheFirst` rule for `/static/albums/images` shown in Critical Flaw 4.
2. Verify: load the album grid, go offline, reload, confirm covers render.

### P1.6 — Add offline audio failure messaging and bulk save

1. Add `onError` to the `<audio>` element in `audio-player.component.jsx` and render "Audio not saved for offline".
2. Add a "Save album for offline" action that loops `cacheAudioForOffline` with progress.
3. Verify: save an album, go offline, play a track.

### P2.1 — Add background sync for local playlists

1. Add the `backgroundSync` rule for `POST /api/playlist` in `vite.config.js`.
2. Add `sync.js` with `registerSync` / `addSync`.
3. Dispatch `addToSyncPromptQueue` on local playlist create and update; drain the queue in the `sync` event using `syncAllUnsyncedPlaylists`.
4. Verify: create a playlist offline, restore the network, confirm it uploads and `synced` becomes true.

### P2.2 — Propagate deletions

1. Add tombstones to `GET /api/song` and `GET /api/album` when `syncSince` is present.
2. Delete tombstoned records in `syncSongs` / `syncAlbums`.
3. Add backend tests for the tombstone path.

### P2.3 — Handle online/offline transitions

1. Add `window.addEventListener("online"/"offline")` in `registerPwa`.
2. Dispatch an `isOnline` flag in `pwa.slice.js`.
3. Call `syncAll()` on reconnect.
4. Show a persistent "Offline" indicator in `PwaStatus`.

### P2.4 — Bound the caches

1. Add `expiration` to `api-songs` and `api-albums`.
2. Add `cacheableResponse: { statuses: [0, 200] }` to both.
3. Verify with `caches.keys()` and `cache.length` in DevTools after 10 syncs.

### P2.5 — Add install UI

1. Capture `beforeinstallprompt`, store the event, dispatch `setInstallable(true)`.
2. Render an Install button in the header and in `PwaStatus`.
3. Add an iOS "Add to Home Screen" help card.
4. Verify on Chrome Android (prompt appears, install succeeds) and Safari iOS (instructions render).

### P2.6 — Enable the service worker in development

1. Set `devOptions.enabled: true`.
2. Delete the stale `dev-dist/`.
3. Test the full offline flow against the dev server.

### P2.7 — Persist sync state and storage

1. Persist `lastSyncTime` in `syncMeta` and load it at startup.
2. Call `navigator.storage.persist()` on `onOfflineReady`.
3. Check `navigator.storage.estimate()` before bulk writes and surface a quota warning.

### P2.8 — Fix pagination math

1. Change `song.controller.js:53` and `:125` to `Math.ceil(totalDocuments / 100)`.
2. Slice the local song list by `page` in `songs.page.jsx`.

### P3.1 — Complete the manifest

Add `id`, `shortcuts`, `orientation`, `categories`, `screenshots`, `display_override`, `?source=pwa` on `start_url`, a separate `maskable` 192 icon, and split `any` and `maskable` purposes.

### P3.2 — Add favicon fallbacks

Add `<link rel="icon" href="/favicon.ico" sizes="any">` and `<link rel="alternate icon" href="/favicon-32x32.png">`.

### P3.3 — Improve startup on constrained networks

1. Enable `navigationPreload`.
2. Remove `dragdrop` from the initial `modulepreload` set.
3. Add a Lighthouse budget file and run Lighthouse PWA in CI.

### P3.4 — Add frontend tests

Add Vitest with tests for `sync-service.util.js`, the IndexedDB services, and the four IndexedDB-first loaders.

### P3.5 — Add frontend security headers

Serve `dist/` with a CSP and HSTS header.

### P3.6 — Update the PWA docs

Correct `PWA-architecture.md` §5.1, §7.2, and §12 to match the code.

---

## Appendix A — Verified working

| Area | Evidence |
|------|----------|
| Service worker registers | `main.jsx:20` calls `registerPwa()` before `createRoot`; `onRegisterError` wired |
| Precache | `dist/sw.js` precaches 50 entries including `index.html` |
| Navigation fallback | `NavigationRoute` bound to `index.html`, denylist `/^\/api/` |
| `cleanupOutdatedCaches` | Present in `dist/sw.js` |
| `skipWaiting` on message | Present in `dist/sw.js` |
| Manifest injected | `dist/index.html` contains `<link rel="manifest" href="/manifest.webmanifest">` |
| Manifest fields | `name`, `short_name`, `description`, `start_url`, `display`, `theme_color`, `background_color`, `lang`, `scope` all present |
| Icon sizes | 192×192, 512×512, 180×180, 512×512 maskable verified with `sips` |
| `theme-color` meta | `index.html:10` matches `theme_color` |
| Apple meta | `apple-mobile-web-app-capable`, `status-bar-style`, `apple-mobile-web-app-title`, `apple-touch-icon` present |
| IndexedDB-first loaders | `songs.page.jsx`, `albums.page.jsx`, `lyrics.page.jsx`, `album.page.jsx` |
| Detail-page cache self-heal | `lyrics.page.jsx:53-55`, `album.page.jsx:49-52` |
| Album detail guard | `album.page.jsx:59` checks `Array.isArray(localAlbum.songs)` before serving cache |
| Delta sync | `syncSince` implemented and tested on both controllers |
| Cursor self-heal | `sync-service.util.js:55-59, 91-95` fall back to `initializePwaData` when the cursor is missing |
| Migration-safe IDB upgrade | `indexed-db.util.js:78` skips existing stores |
| `hasAudio` computed | `song.controller.js:130` computes it for the `all=true` path, so IndexedDB records carry it |
| Offline audio read path | `audio-player.component.jsx:76-84` uses the IndexedDB blob when `navigator.onLine` is false |
| Offline audio write path | `download-audio.component.jsx:56-67` calls `cacheAudioForOffline` |
| Periodic update check | `pwa-register.util.js:51` polls `registration.update()` hourly |

## Appendix B — Lighthouse PWA checklist mapping

| Lighthouse audit | Status from static analysis |
|------------------|------------------------------|
| Service worker registered | Pass |
| Page has manifest with `name`/`short_name`, icons, `start_url`, `display` | Pass |
| Manifest has `192px` and `512px` icons | Pass |
| Manifest `theme-color` matches meta theme color | Pass |
| No duplicate manifest | Pass (single `<link rel="manifest">`) |
| Page is served over HTTPS | Not verifiable from repo; dev is HTTP, no production config |
| `beforeinstallprompt` handled | Fail — no handler |
| `apple-touch-icon` | Pass |
| No failed requests when offline | Fail — `/api/user/*`, `/api/playlist`, `/static/albums/images` uncached |
| Splash screen | Pass (manifest `background_color`) |
| Redirects when offline | Pass (navigation fallback) |
| Responsive / viewport | Pass |
| First meaningful paint on 3G | Estimated 4–6 s from ~210 KB gzip critical path |

## Appendix C — Sources

- Vite PWA documentation: https://vite-pwa-org.netlify.app/ (via Context7 `/vite-pwa/vite-plugin-pwa`)
- Workbox documentation: https://developer.chrome.com/docs/workbox
- Web app manifest spec: https://www.w3.org/TR/appmanifest/
- Project docs: `PWA-architecture.md`, `PWA-plan.md`
