---
type: object
cluster: app-state
universe: live
status: verified
verified: 2026-10-24 @ 9db0d0c
entity: frontend/src/store/slices/playlist.slice.js:13
code-name: playlist
description: Audio playback queue, position and repeat mode; not the Playlist model.
---

# playlist slice

The audio player's queue. Despite the name, it is not a saved [Playlist](../data-model/playlist.md).

## Why this shape

One queue drives the player wherever playback starts (a song row, an album, a playlist), so
the player reads only this slice.

## Shape

State (`frontend/src/store/slices/playlist.slice.js:15`):

- `queue` — song objects. `currentSongIdx` — `-1` when empty.
- `repeat` — default `"no-repeat"`; cycled by `toggleRepeat`.

Actions: `setPlaylist`, `setCurrentSongIdx`, `nextSong` (`:146`), `prevSong`,
`addSongToQueue` (`:55`), `toggleRepeat`, `playNext`, `removeSong`.

## Connected to

- **looks-like-but-is-not:** [Playlist](../data-model/playlist.md),
  [localPlaylists slice](local-playlists-slice.md).

## Known defects

- The slice is exported as `configsSlice`, a copy-paste name from the configs slice.
  `frontend/src/store/slices/playlist.slice.js:13`

## If you change this

- **Hits:** `frontend/src/components/audio-player.component.jsx`,
  `audio-player-toolbox.component.jsx`, `album-viewer.component.jsx`,
  `playlist-viewer.component.jsx`, `frontend/src/App.jsx`.
- **Does not hit:** any stored playlist, on the device or the server.

## Surfaces

| Surface | Role |
|---|---|
| Song, album, playlist views | write (start playback) |
| Audio player | reads, advances |

## See

- Source: `frontend/src/store/slices/playlist.slice.js`
