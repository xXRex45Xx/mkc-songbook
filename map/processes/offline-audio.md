---
type: process
status: verified
verified: 2026-10-25 @ aacc93d
description: Save a recording to IndexedDB on request; the player prefers the saved copy over the stream.
consumes: [../objects/data-model/song.md, ../objects/local-db/songs-store.md]
produces: [../objects/local-db/audio-files-store.md]
---

# offline-audio

How a song's recording is saved for offline play, and how the player picks its source.

## Input → Movement → Output

The user presses "Save offline". The app fetches `GET /api/song/:id/audio`, stores the blob in
the [audioFiles store](../objects/local-db/audio-files-store.md) stamped with the song's
`updatedAt`, and also saves a file to the device. At play time the player uses the saved blob
unless it is stale, else streams from the server.

## Why this shape

Audio is too large to sync for every song, so it is saved per song on request. The service
worker never caches it (`frontend/vite.config.js:104`); the app owns the copy, so it can show
what is saved and check staleness.

## Steps

Save (`frontend/src/utils/api/audio-download.util.js:149`):

1. `fetchAudioBlob`: plain `fetch` of `/api/song/:id/audio`, no `Range` header (`:60`). The
   backend answers `200` with the whole file. A `206` is never taken as complete: the client
   fetches the remaining ranges from `Content-Range` and fails if the total size is not reached
   (`collectRemainingParts`, `:28`).
2. Read the song's `updatedAt` from the [songs store](../objects/local-db/songs-store.md) (`:78`).
3. `audioIdbService.store` with `{ _id, songId, blob, updatedAt, size, mimeType }` (`:153`).
4. Save a copy to the device's files (`:162`).

The button and saved state live in `frontend/src/components/download-audio.component.jsx:48`.

Play (`frontend/src/components/audio-player.component.jsx:76`):

1. Saved blob exists and `isAudioStale` is false → play `URL.createObjectURL(blob)`.
2. Otherwise → stream `/api/song/:id/audio`; a request with a `Range`
   header (the audio element always sends one) gets a `206` of at most 500 KB
   (`backend/controllers/song.controller.js:396`); a request without one gets the whole file
   with `200` (`:400`).
3. Stream error → fall back to a saved blob, or show "unavailable" (`audio-player.component.jsx:105`).

Stale means the songs store has a newer `updatedAt` than the saved copy
(`frontend/src/utils/api/audio-download.util.js:195`).

## Known defects

None known.

## If you change this

- **Hits:** [audioFiles store](../objects/local-db/audio-files-store.md),
  `frontend/src/utils/api/audio-download.util.js`,
  `frontend/src/components/download-audio.component.jsx`,
  `frontend/src/components/audio-player.component.jsx`, `streamSongAudio` in
  `backend/controllers/song.controller.js`, [delta-sync](delta-sync.md) (reconcile deletes
  saved audio).
- **Does not hit:** the [playlist slice](../objects/app-state/playlist-slice.md) shape — the
  player reads only song ids from the queue.

## Surfaces

| Surface | Role |
|---|---|
| "Save offline" button | starts the save |
| Audio player | picks the source |

## See

- Objects: [audioFiles store](../objects/local-db/audio-files-store.md),
  [Song](../objects/data-model/song.md)
- Source: `frontend/src/utils/api/audio-download.util.js`
