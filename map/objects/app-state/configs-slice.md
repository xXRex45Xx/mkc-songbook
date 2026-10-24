---
type: object
cluster: app-state
universe: live
status: verified
verified: 2026-10-24 @ 9db0d0c
entity: frontend/src/store/slices/configs.slice.js:13
code-name: configs
description: Lyrics font size, window width and header visibility; nothing is persisted.
---

# configs slice

UI preferences and layout state.

## Why this shape

`lyricsFontSize` is a product requirement (`PRODUCT.md`: readable while singing). `windowWidth` is
fed by one resize listener in `frontend/src/hooks/useWindowSize.hook.js:33`.

## Shape

State (`frontend/src/store/slices/configs.slice.js:15`):

- `lyricsFontSize` String, default `"15"` (points).
- `windowWidth` — starts at `window.innerWidth`.
- `hiddenHeader` Boolean — true in fullscreen.

Actions: `setLyricsFontSize` (`:39`), `setWindowInnerWidth`, `setHiddenHeader`,
`toggleFullscreen` (`:66`).

## Connected to

- **looks-like-but-is-not:** [settings store](../local-db/settings-store.md).

## Known defects

- Font size is not persisted: no `localStorage` or IndexedDB write, so it resets to 15 on every
  reload. The [settings store](../local-db/settings-store.md) exists but is unused.
- `toggleFullscreen` calls `document.requestFullscreen()` inside the reducer, a side effect
  Redux reducers must not have. `frontend/src/store/slices/configs.slice.js:66`

## If you change this

- **Hits:** `frontend/src/components/lyric-viewer.component.jsx` (font control),
  `frontend/src/hooks/useWindowSize.hook.js`,
  `frontend/src/App.jsx`, `custom-row.component.jsx`, `song-tools.component.jsx`,
  `songs-table.component.jsx`.
- **Does not hit:** the backend or any stored data.

## Surfaces

| Surface | Role |
|---|---|
| Lyric viewer | writes font size, toggles fullscreen |
| Layout components | read |

## See

- Source: `frontend/src/store/slices/configs.slice.js`
