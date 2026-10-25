---
type: object
cluster: data-model
universe: live
status: verified
verified: 2026-10-25 @ 3515b77
entity: backend/models/song.model.js:49
code-name: Song
description: "A song: Amharic lyrics, chords, rhythm, tempo, optional audio."
---

# Song

A catalog song. Product word and model name are both "Song" (`SongModel`, collection `songs`).

## Why this shape

`_id` is a human-chosen string code (seed ids look like `a1`), not an ObjectId, so
every reference to a song (`Album.songs`, `Playlist.songs`, `User.favorites`,
`LogBook.songList`) is a plain string ref. `updatedAt` is indexed because offline clients pull
changes with `?syncSince` delta sync.

## Shape

- `_id` String, required — the song code. `backend/models/song.model.js:50`
- `title` String, trimmed, required, indexed. `:51`
- `lyrics` String, required. `:58`
- `musicElements` `{ chord, tempo: Number, rythm }` — note the spelling `rythm`. `:59`
- `createdAt` String year (e.g. `"2016"`), not a Date. `:64`
- `updatedAt` Date, indexed. `:69`
- `songFilePath` server disk path of the audio; never sent to clients (replaced by
  `hasAudio`). `:70`, `backend/controllers/song.controller.js:116`
- `youtubeLink` String. `:71`
- `albums` [String ref Album]. `:72`

Deleting a song (`deleteSong`) pulls its id from every album, playlist, logbook and user
favorites list, bumps `updatedAt` on the albums, playlists and logbooks it touched, then deletes
the audio file. Changing a song's `_id` (`updateSong`) creates the new document first (keeping
`songFilePath`, `youtubeLink`, `createdAt`), repoints the same four collections to the new id,
then deletes the old document; both paths live in `backend/controllers/song.controller.js`.

API: `/api/song` (`backend/routes/song.route.js:44`), plus `GET /api/song/:id/audio` range
streaming (`backend/routes/song.route.js:266`).

## Connected to

- **owns:** the audio file at `songFilePath`.
- **owned-by:** none.
- **joins:** [Album](album.md) both ways (`Song.albums` and `Album.songs` are kept in sync by
  hand, and each side's `updatedAt` is bumped when the link changes); referenced by [Playlist](playlist.md), [User](user.md) favorites,
  [Service logbook](service-logbook.md).
- **looks-like-but-is-not:** [songs store](../local-db/songs-store.md) — the offline copy has
  `hasAudio`, not `songFilePath`.

## Known defects

None known.

## If you change this

- **Hits:** `backend/middlewares/base-version.middleware.js` (409 on a stale replayed edit),
  `backend/models/validation-schemas/song.validation-shcema.js`,
  `backend/middlewares/pre-add-song.middleware.js`, `pre-update-song.middleware.js`,
  `backend/controllers/song.controller.js`, `backend/controllers/album.controller.js`
  (`$pull`/`$push` on `albums`), `backend/init-db/init-db.js` (seed mapping),
  `frontend/src/utils/api/songs-api.util.js`, the [songs store](../local-db/songs-store.md).
- **Does not hit:** [Playlist](playlist.md) schema — it stores ids only, but a renamed `_id`
  still breaks its references.

## Surfaces

| Surface | Role |
|---|---|
| Admin (upload/edit song pages) | writes |
| Everyone, online or offline | reads |
| `init-db` seed from `final_songs.json` | writes once, only when `songs` is empty; maps `id`, `name`, `detail`, `year`, `chord`, `tempo`, `rhythm` (`backend/init-db/init-db.js:36`) |

## See

- Source: `backend/models/song.model.js`
