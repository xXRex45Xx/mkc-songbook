---
type: object
cluster: app-state
universe: live
status: verified
verified: 2026-10-24 @ 9db0d0c
entity: frontend/src/store/slices/local-playlists.slice.js:13
code-name: localPlaylists
description: In-memory mirror of the localPlaylists IndexedDB store for rendering.
---

# localPlaylists slice

Redux copy of the [localPlaylists store](../local-db/local-playlists-store.md), so pages render
device playlists without awaiting IndexedDB.

## Why this shape

IndexedDB is the source of truth; this slice is a render cache. Callers write the store first,
then dispatch the matching action (`frontend/src/components/playlist-form.component.jsx:163`).
The API util functions and the slice actions share names (`updateLocalPlaylist`,
`deleteLocalPlaylist`); components import the actions with an `Action` suffix. Route actions such as
`frontend/src/pages/edit-playlist.page.jsx:106` write the store only; the root loader re-runs
after every action and reloads the slice (`frontend/src/App.jsx:67`).

## Shape

State (`frontend/src/store/slices/local-playlists.slice.js:15`): `localPlaylists` (array),
`isLoading`.

Actions: `setLocalPlaylists`, `addLocalPlaylist`, `updateLocalPlaylist`, `deleteLocalPlaylist`,
`markAsSynced` (`:74`), `setLoading`.

## Connected to

- **joins:** [localPlaylists store](../local-db/local-playlists-store.md).
- **looks-like-but-is-not:** [playlist slice](playlist-slice.md),
  [Playlist](../data-model/playlist.md).

## If you change this

- **Hits:** `frontend/src/App.jsx:70` (initial load), `playlist-form.component.jsx`,
  `playlist-viewer.component.jsx`, `frontend/src/utils/api/local-playlist-api.util.js:196`
  (`markAsSynced`), `frontend/src/pages/local-playlists.page.jsx`,
  `frontend/src/pages/playlists.page.jsx`, `frontend/src/components/pwa-status.component.jsx`.
- **Does not hit:** the store schema — the slice holds whatever records the store returns.

## Surfaces

| Surface | Role |
|---|---|
| Root loader, playlist form and viewer | write |
| Playlist pages, PWA status | read |

## See

- Source: `frontend/src/store/slices/local-playlists.slice.js`
