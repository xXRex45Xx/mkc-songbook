---
type: area
cluster: frontend-ui
universe: live
status: verified
owns: [frontend/src/components/audio-controls.component.jsx, frontend/src/components/audio-player-toolbox.component.jsx, frontend/src/components/audio-player.component.jsx, frontend/src/components/audio-player.styles.css, frontend/src/components/custom-slider.component.jsx, frontend/src/components/download-audio.component.jsx, frontend/src/components/lyric-viewer.component.jsx, frontend/src/components/music-element.component.jsx, frontend/src/components/song-collection-tools.component.jsx, frontend/src/components/song-tools.component.jsx, frontend/src/components/song-form.component.jsx, frontend/src/components/songs-table.component.jsx, frontend/src/components/sort-dropdown.component.jsx, frontend/src/components/search-bar.component.jsx, frontend/src/components/no-results.component.jsx, frontend/src/components/new-album-song.component.jsx, frontend/src/components/custom-table.component.jsx, frontend/src/components/custom-row.component.jsx, frontend/src/components/first-droppable-row.component.jsx]
description: "Audio player, lyric viewer, song forms, song tables, search and sort components."
verified: 2026-11-15 @ b2fce7d
---

# Components: player and songs

Run the `impeccable` skill for visual changes. This card routes by behavior.

## Files

| File | Role | Uses |
|---|---|---|
| `audio-player.component.jsx` | Persistent `<audio>` mounted once in `App.jsx:50`; prefers the IndexedDB blob, falls back to the stream | slices `playlist`, `user`; `audio-download.util`, `user-api.util`; `audio-player.styles.css` |
| `audio-controls.component.jsx` | Play, prev, next, repeat, favorite buttons | `button-theme.config` |
| `audio-player-toolbox.component.jsx` | Queue modal: reorder, remove, jump | `playlist` slice; renders `SongsTable`, `DownloadAudio` |
| `custom-slider.component.jsx` | Range slider for progress, volume, font size | `forms-theme.config` |
| `download-audio.component.jsx` | Save-offline button with progress | `pwa` slice; `audio-download.util`, `audio-idb-service` |
| `lyric-viewer.component.jsx` | Lyric page body: highlight, font size, fullscreen | `configs` slice; `regexBuilder` from `amharic-map.util` |
| `music-element.component.jsx` | Chord, tempo, rhythm label pair | none |
| `song-tools.component.jsx` | Per-song menu: favorite, queue, add to playlist, share, delete | `user`, `pwa`, `playlist` slices; `songs-api`, `playlist-api`, `local-playlist-api`, `user-api` |
| `song-collection-tools.component.jsx` | Album and playlist header menu | none |
| `song-form.component.jsx` | Create and edit song form; client checks audio 50 MB, mp3 or aac | router `Form`, no store |
| `songs-table.component.jsx` | Song list, paging, drag and drop (dnd-kit) | `configs.windowWidth`; `setPlaylist` |
| `custom-row.component.jsx` | One draggable song row (exports `SongsTableRow`) | `pwa.audioDownloads`; renders `SongTools` |
| `first-droppable-row.component.jsx` | Drop target at index 0 | dnd-kit |
| `custom-table.component.jsx` | Flowbite table with pagination | `table-theme.config` |
| `sort-dropdown.component.jsx` | Writes `?sortby=` | router |
| `search-bar.component.jsx` | Search form with category select | rendered by `header.component.jsx` |
| `no-results.component.jsx` | Empty state | none |
| `new-album-song.component.jsx` | Row editor inside album and playlist forms | `songs-api` `patchSong` |

## Entry points

- Rendered by pages: `songs.page.jsx` (`SongsTable`, `SortDropdown`), `lyrics.page.jsx` (`LyricViewer`), `upload-song` and `edit-song` pages (`SongForm`), `schedule.page.jsx` (`CustomTable`). See [routes and pages](routes-and-pages.md).
- `AudioPlayer` mounts from `App.jsx`; the queue lives in the [playlist slice](../../objects/app-state/playlist-slice.md).

## Connected to

- **objects:** [playlist slice](../../objects/app-state/playlist-slice.md), [pwa slice](../../objects/app-state/pwa-slice.md), [configs slice](../../objects/app-state/configs-slice.md), [audioFiles store](../../objects/local-db/audio-files-store.md)
- **processes:** [offline-audio](../../processes/offline-audio.md)
- **areas:** [api clients](../frontend-core/api-clients.md), [pwa and storage](../frontend-core/pwa-and-storage.md), [collections, auth, shell](components-collections-auth-shell.md)

- `lyric-viewer.component.jsx:121-138` renders the chord, tempo and rhythm row through `MusicElement`; a new song field shown there goes in that block.

## If you change this

- **Hits:** the stream URL `${backendURL}/api/song/:id/audio` ([song-api](../backend-api/song-api.md)); stale check uses song `updatedAt`; `song-tools` mutations rely on router revalidation.
- **Does not hit:** saved playlists (the queue never touches them).

## See

- Source: `frontend/src/components/`
