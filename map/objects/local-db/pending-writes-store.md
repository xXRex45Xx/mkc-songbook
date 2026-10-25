---
type: object
cluster: local-db
universe: live
status: verified
verified: 2026-10-25 @ 3515b77
entity: frontend/src/utils/db/indexed-db.util.js:74
code-name: pendingWrites
description: "Offline write queue: failed mutations replayed in order when the network returns."
---

# pendingWrites store

Mutations made offline, waiting to reach the server. Store name `pendingWrites`.

## Why this shape

An app-level queue, not Workbox `backgroundSync`, because Safari lacks the Background Sync API
(`frontend/src/utils/pwa/write-queue.util.js:6`). Replay is in creation order (`sequence` breaks
same-millisecond ties). The token is not stored: replay reads the current `localStorage._s`.
Each edit of a record carries the `updatedAt` the device last saw, and the backend refuses a
stale one with 409.

## Shape

- keyPath `id`; index `createdAt`. `frontend/src/utils/db/indexed-db.util.js:74`
- Record: `{ id, sequence, url, method, headers, body, label, createdAt, attempts, lastError,
  permanent, baseUpdatedAt, owner }`. `frontend/src/utils/pwa/write-queue.util.js:155`
- `headers` is stored without `Authorization`; `owner` is the user id read from the token, so an
  entry waits for its own account. `baseUpdatedAt` is the local copy's `updatedAt` at queue
  time, set only on the first queued edit of a record (later edits build on it).

Flush (`frontend/src/utils/pwa/write-queue.util.js:257`):

| Response | Result |
|---|---|
| network error | `attempts`+1, stop the flush |
| 401 | keep the entry (`attempts`+1), stop: wait for a new sign-in |
| 409 | `permanent: true` (record changed on the server), later edits of that record too, continue |
| other 4xx | `permanent: true`, skip, continue |
| 5xx | `attempts`+1, stop the flush |
| 2xx/3xx | remove the entry |

## Connected to

- **joins:** [pwa slice](../app-state/pwa-slice.md) via `setWriteQueueSummary`.
- **looks-like-but-is-not:** [localPlaylists store](local-playlists-store.md) — local
  playlists upload through their own path, not this queue
  (`frontend/src/utils/pwa/pwa-register.util.js:99`).

## Known defects

None known. A permanent non-409 rejection (for example validation) leaves the optimistic local
copy in place until a later sync replaces it.

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
