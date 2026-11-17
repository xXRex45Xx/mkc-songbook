---
type: object
cluster: app-state
universe: live
status: verified
verified: 2026-10-24 @ 9db0d0c
entity: frontend/src/store/slices/pwa.slice.js:35
code-name: pwa
description: Offline readiness, connectivity, sync status, write-queue counts and install state.
---

# pwa slice

Redux state the PWA layer reports into, so the UI can show offline, syncing and install status.

## Why this shape

Service worker, sync and write-queue code run outside React. `pwa-register.util.js`,
`write-queue.util.js` and `install.util.js` dispatch into this slice; two components read it.
`lastSyncTime` comes from `lastFullSync` (`frontend/src/utils/pwa/pwa-register.util.js:157`).

## Shape

State (`frontend/src/store/slices/pwa.slice.js:20`):

- `offlineReady`, `isOnline`, `swError` — service worker and network.
- `isSyncing`, `lastSyncTime`, `lastSyncCounts`, `syncError` — sync runs.
- `pendingWrites`, `failedWrites` — from the [pendingWrites store](../local-db/pending-writes-store.md)
  via `setWriteQueueSummary` (`:65`).
- `isInstallable`, `isInstalled` — install prompt (`:69`). `isInstalled` is set at startup from
  `display-mode: standalone` (and iOS `navigator.standalone`), kept current by a media-query
  listener, and set by `appinstalled`. The song tools show Download only when it is true.
- `audioDownloads` — whole-percent progress (0-100) of audio saves in flight, keyed by song id
  (`setAudioDownloadProgress`, `clearAudioDownload`). Written by `download-audio.component.jsx`,
  read by the song table row, which dims and shows a progress bar while an entry exists.

## Connected to

- **joins:** [pendingWrites store](../local-db/pending-writes-store.md),
  [syncMeta store](../local-db/sync-meta-store.md) (`lastSyncTime`).

## If you change this

- **Hits:** `frontend/src/utils/pwa/pwa-register.util.js`, `write-queue.util.js`,
  `install.util.js`, `frontend/src/components/pwa-status.component.jsx`,
  `frontend/src/components/install-prompt.component.jsx`.
- **Does not hit:** cached data — the slice only reports on it.

## Surfaces

| Surface | Role |
|---|---|
| PWA utils | write |
| PWA status, install prompt | read |

## See

- Source: `frontend/src/store/slices/pwa.slice.js`
