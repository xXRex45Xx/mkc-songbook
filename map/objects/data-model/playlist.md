---
type: object
cluster: data-model
universe: live
status: verified
verified: 2026-10-24 @ 9db0d0c
entity: backend/models/playlist.model.js:37
code-name: Playlist
description: A server-side playlist owned by its creator; private, members or public.
---

# Playlist

A saved, ordered list of songs owned by one user. Model `PlaylistModel`, collection `playlists`.
Not the `playlist` Redux slice, which is the audio queue.

## Why this shape

`creator` is the only owner, and only the creator may update or delete
(`backend/controllers/playlist.controller.js:188`, `:252`), so an admin cannot edit another
user's playlist. `visibility` has three levels so a songleader can share a setlist with the
choir without making it public.

## Shape

- `name` String, required, indexed. `backend/models/playlist.model.js:38`
- `visibility` `private` | `members` | `public`, default `private`. `:45`
- `createdAt`, `updatedAt` Date. `:50` — `updatePlaylist` sets `updatedAt`
  (`backend/controllers/playlist.controller.js:196`).
- `creator` ObjectId ref User, required, indexed. `:58`
- `songs` [String ref Song], ordered. `:59`

Who sees what (`backend/controllers/playlist.controller.js:40`):

| Viewer | Sees |
|---|---|
| Anonymous | `public` |
| Signed in, role `public` | `public` + own `private` |
| `member`, `admin`, `super-admin` | `members` + `public` + own `private` |

API: `/api/playlist` (`backend/routes/playlist.route.js:41`).

## Connected to

- **owned-by:** [User](user.md) via `creator`.
- **joins:** [Song](song.md) by id. Deleting a song does not remove it from playlists.
- **looks-like-but-is-not:** [localPlaylists store](../local-db/local-playlists-store.md)
  (device-only, may point here by `remoteId`); [playlist slice](../app-state/playlist-slice.md)
  (playback queue); [Service logbook](service-logbook.md) (a scheduled service; a nullable
  playlist link from the logbook is planned, see `PRODUCT.md`).

## If you change this

- **Hits:** `backend/models/validation-schemas/playlist.validation-schema.js`,
  `backend/middlewares/playlist-validation.middleware.js`,
  `backend/controllers/playlist.controller.js`, `frontend/src/utils/api/playlist-api.util.js`,
  `frontend/src/utils/api/local-playlist-api.util.js` (syncs local playlists up).
- **Does not hit:** [Album](album.md) or the [playlist slice](../app-state/playlist-slice.md).

## Surfaces

| Surface | Role |
|---|---|
| Creator (new/edit playlist pages) | writes |
| Viewers per table above | read |

## See

- Source: `backend/models/playlist.model.js`
