---
type: area
cluster: frontend-ui
universe: live
status: verified
owns: [frontend/src/main.jsx, frontend/src/App.jsx, frontend/src/App.css, frontend/src/index.css, frontend/src/pages/**]
description: "URL to page table, route guards, loaders and actions, root layout."
verified: 2026-11-17 @ 94c53c6
---

# Routes and pages

Where a URL lands. Routes are wired in `frontend/src/main.jsx`; each page is a lazy chunk (`lazyRoute` :28, `lazyProtectedRoute` :45, `lazyAuthRoute` :67). Root layout and loader are `frontend/src/App.jsx`.

## Files

| File | Role |
|---|---|
| `frontend/src/main.jsx` | Entry: `registerPwa()`, router, Redux `Provider`, `GoogleOAuthProvider` on login and sign-up only |
| `frontend/src/App.jsx` | Root layout (`Header`, `PwaStatus`, `Outlet`, `AudioPlayer` when the queue is non-empty and the user is not admin). Loader :69-126 migrates the legacy token, loads the current user, fills local playlists |
| `frontend/src/index.css`, `App.css` | Tailwind layers and global rules |
| `frontend/src/pages/*.page.jsx` | One file per screen (below); two `.styles.css` files are global, not modules |

## Entry points

| URL | Page | Loader / action | Access |
|---|---|---|---|
| `/` | `home.page.jsx` | root loader; redirects to `/songs` | public |
| `/songs` | `songs.page.jsx` | loader :126; IndexedDB first with background `syncSongs` when there is no `q` or `sortby`; with them it goes to the network first and falls back to IndexedDB (offline: IndexedDB only; a combined `type=all` search returns `{ titleMatch, lyricsMatch }` from either source, as `songs-table.component.jsx` expects) | public |
| `/songs/:songId` | `lyrics.page.jsx` | loader :49 | public |
| `/songs/new` | `upload-song.page.jsx` | loader :55, action :68 | admin, super-admin |
| `/songs/:songId/edit` | `edit-song.page.jsx` | loader :61, action :78 | admin, super-admin |
| `/albums` | `albums.page.jsx` | loader :89 | public |
| `/albums/new` | `upload-album.page.jsx` | action :40 | admin, super-admin |
| `/albums/:albumId` | `album.page.jsx` | loader :48 | public |
| `/albums/:albumId/edit` | `edit-album.page.jsx` | loader :61, action :78 | admin, super-admin |
| `/playlists` | `playlists.page.jsx` | loader :95 | public |
| `/playlists/new` | `new-playlist.page.jsx` | action :60; guests make local playlists | public |
| `/local-playlists` | `local-playlists.page.jsx` | none (App loader fills the slice) | public |
| `/playlists/:playlistId` | `playlist.page.jsx` | loader :49; `favorites` id reads `getFavorites` | public |
| `/playlists/:playlistId/edit` | `edit-playlist.page.jsx` | loader :70, action :95; owner check at render :37, no route guard | creator |
| `/schedule` | `schedule.page.jsx` | loader :180; edit and delete buttons have no handlers | member, admin, super-admin |
| `/schedule/new` | `new-schedule.page.jsx` | none: a form wired to nothing | admin, super-admin |
| `/users` | `users.page.jsx` | loader :49 | admin, super-admin |
| `/announcements` | inline "Under Construction" in `main.jsx:196` | none | public (ghost) |
| `/auth`, `/auth/signup`, `/auth/verify`, `/auth/create-password`, `/auth/forgot-password`, `/auth/reset-password` | `auth.page.jsx` layout plus form components | `auth.page.jsx:45` redirects signed-in users to `/`; forms export their own `action` | public |

Error boundaries: `error.page.jsx` at `main.jsx:96` and the auth layout `:208`. Guard component: `protected-route.component.jsx` (no user: `/auth?redirect=<path>`; wrong role: throws 403). Role checks here are UI only; the server enforces.

## Connected to

- **objects:** [user slice](../../objects/app-state/user-slice.md) (roles), [songs store](../../objects/local-db/songs-store.md), [albums store](../../objects/local-db/albums-store.md), [localPlaylists store](../../objects/local-db/local-playlists-store.md)
- **processes:** [delta-sync](../../processes/delta-sync.md) (songs and albums pages top up IndexedDB), [auth](../../processes/auth.md), [local-playlist-upload](../../processes/local-playlist-upload.md)
- **areas:** [components: player and songs](components-player-and-songs.md), [components: collections, auth, shell](components-collections-auth-shell.md), [api clients](../frontend-core/api-clients.md), [pwa and storage](../frontend-core/pwa-and-storage.md)

## Known defects

- `new-schedule.page.jsx`: no action or loader; submit label reads global `location` (`:156`); fragment maps lack `key` (`:53`, `:92`).
- `schedule.page.jsx:138` reads `log.recentlyUpdated`; `logbook-api.util.js:35` sets `log.recentlyChanged`. The badge never shows.
- Login honors an unvalidated `redirect` query param (`frontend/src/components/login-form.component.jsx:195`). Not verified as exploitable.
- `/playlists/:playlistId/edit` action has no client owner check (`edit-playlist.page.jsx:95`); the server must enforce.

## If you change this

- **Hits:** `main.jsx` route list plus the page's loader and action; [user slice](../../objects/app-state/user-slice.md) if roles change; `vite.config.js` caching rules if a new `/api` path is read offline.
- **Does not hit:** backend routes unless the loader or action calls a new endpoint ([api clients](../frontend-core/api-clients.md)).

## See

- Source: `frontend/src/main.jsx`
