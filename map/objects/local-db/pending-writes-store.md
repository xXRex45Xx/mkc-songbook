---
type: object
cluster: local-db
universe: live
status: verified
verified: 2026-10-24 @ 9db0d0c
entity: frontend/src/utils/db/indexed-db.util.js:74
code-name: pendingWrites
description: "Offline write queue: failed mutations replayed in order when the network returns."
---

# pendingWrites store

Mutations made offline, waiting to reach the server. Store name `pendingWrites`.

## Why this shape

An app-level queue, not Workbox `backgroundSync`, because Safari lacks the Background Sync API
(`frontend/src/utils/pwa/write-queue.util.js:6`). Replay is in creation order (`sequence` breaks
same-millisecond ties) and last-write-wins: the backend has no concurrency check.

## Shape

- keyPath `id`; index `createdAt`. `frontend/src/utils/db/indexed-db.util.js:74`
- Record: `{ id, sequence, url, method, headers, body, label, createdAt, attempts, lastError,
  permanent }`. `frontend/src/utils/pwa/write-queue.util.js:155`
- `headers` is stored as given, including the `Authorization: Bearer` token
  (`frontend/src/utils/api/playlist-api.util.js:173`).

Flush (`frontend/src/utils/pwa/write-queue.util.js:257`):

| Response | Result |
|---|---|
| network error | `attempts`+1, stop the flush |
| 4xx | `permanent: true`, skip, continue |
| 5xx | `attempts`+1, stop the flush |
| 2xx/3xx | remove the entry |

## Connected to

- **joins:** [pwa slice](../app-state/pwa-slice.md) via `setWriteQueueSummary`.
- **looks-like-but-is-not:** [localPlaylists store](local-playlists-store.md) — local
  playlists upload through their own path, not this queue
  (`frontend/src/utils/pwa/pwa-register.util.js:99`).

## Known defects

- Queued `headers` keep the bearer token, so a token that expires while queued gets a 401 on
  replay and the write is marked `permanent` (failed for good).
  `frontend/src/utils/pwa/write-queue.util.js:285`

## If you change this

- **Hits:** `frontend/src/utils/pwa/write-queue.util.js`, callers in
  `frontend/src/utils/api/{album,playlist,songs,user}-api.util.js`,
  `frontend/src/utils/pwa/pwa-register.util.js`, `frontend/src/components/pwa-status.component.jsx`.
- **Does not hit:** the backend.

## Surfaces

| Surface | Role |
|---|---|
| API utils on offline mutation | write |
| PWA status component | reads, clears failed |

## See

- Source: `frontend/src/utils/pwa/write-queue.util.js`
