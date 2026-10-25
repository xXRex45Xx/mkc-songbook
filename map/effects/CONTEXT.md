# Change-Impact Index — which cards to open before a change

A catalog, not a spec. Find the thing you are changing, open the listed cards, and read their
**If you change this**. If this index and a card disagree, the card wins; fix this file.

## By what you change

| Changing | Open first | Also open |
|---|---|---|
| Song fields, song API, `updatedAt` on edit | [Song](../objects/data-model/song.md) | [songs store](../objects/local-db/songs-store.md), [delta-sync](../processes/delta-sync.md), [publish-content](../processes/publish-content.md) |
| Song delete or `_id` rename (`song.controller.js`) | [Song](../objects/data-model/song.md) | `removeSongFromReferences` / `replaceSongIdInReferences` touch Album, Playlist, User favorites, LogBook: add a new song reference there too |
| Song or album `_id` rename | [Song](../objects/data-model/song.md), [Album](../objects/data-model/album.md) | [Playlist](../objects/data-model/playlist.md), [User](../objects/data-model/user.md) favorites, [Service logbook](../objects/data-model/service-logbook.md) — all hold string ids |
| Album fields or cover upload | [Album](../objects/data-model/album.md) | [albums store](../objects/local-db/albums-store.md), [publish-content](../processes/publish-content.md) |
| Song–album link | [publish-content](../processes/publish-content.md) | [Song](../objects/data-model/song.md), [Album](../objects/data-model/album.md), [delta-sync](../processes/delta-sync.md) |
| Playlist fields, visibility rules | [Playlist](../objects/data-model/playlist.md) | [local-playlist-upload](../processes/local-playlist-upload.md), [offline-writes](../processes/offline-writes.md) |
| Logbook, incl. the planned playlist link | [Service logbook](../objects/data-model/service-logbook.md) | [Playlist](../objects/data-model/playlist.md) |
| User fields or roles | [User](../objects/data-model/user.md) | [auth](../processes/auth.md), [user slice](../objects/app-state/user-slice.md), [users store](../objects/local-db/users-store.md) |
| OTP, email, SMTP | [OTP](../objects/data-model/otp.md) | [auth](../processes/auth.md) |
| Login risk checks, device cookie, captcha | [auth](../processes/auth.md) | [Device](../objects/data-model/device.md), [LoginAttempt](../objects/data-model/login-attempt.md) |
| JWT secret, claim, expiry, `localStorage._s` | [auth](../processes/auth.md) | [pendingWrites store](../objects/local-db/pending-writes-store.md) (queued tokens) |
| `?syncSince`, `?idsOnly`, sync triggers | [delta-sync](../processes/delta-sync.md) | [syncMeta store](../objects/local-db/sync-meta-store.md), [songs store](../objects/local-db/songs-store.md), [albums store](../objects/local-db/albums-store.md) |
| IndexedDB `STORE_SCHEMAS`, `DB_VERSION` | the store's card in [local-db](../objects/local-db/_index.md) | every process that reads that store |
| `X-Base-Updated-At`, `checkBaseVersion`, optimistic local writes | [offline-writes](../processes/offline-writes.md) | [pendingWrites store](../objects/local-db/pending-writes-store.md), [songs store](../objects/local-db/songs-store.md), [albums store](../objects/local-db/albums-store.md), [users store](../objects/local-db/users-store.md) |
| `sendMutation`, queue replay | [offline-writes](../processes/offline-writes.md) | [pendingWrites store](../objects/local-db/pending-writes-store.md), [pwa slice](../objects/app-state/pwa-slice.md) |
| Device playlists | [localPlaylists store](../objects/local-db/local-playlists-store.md) | [localPlaylists slice](../objects/app-state/local-playlists-slice.md), [local-playlist-upload](../processes/local-playlist-upload.md) |
| Audio stream endpoint, chunk size | [offline-audio](../processes/offline-audio.md) | [audioFiles store](../objects/local-db/audio-files-store.md) |
| Service worker caching (`frontend/vite.config.js`) | [offline-audio](../processes/offline-audio.md), [delta-sync](../processes/delta-sync.md) | `docs/pwa/architecture.md` |
| A Mongoose model: new, renamed, or with a unique index | its card in [data-model](../objects/data-model/_index.md) | `backend/jest/helpers/integration.helper.js`: `resetDatabase` clears each model by name and waits for its indexes; see `backend/TESTING.md` |
| Rate limits (`RATE_LIMIT_MAX`, `AUDIO_RATE_LIMIT_MAX`), `TRUST_PROXY` | [auth](../processes/auth.md) | [offline-audio](../processes/offline-audio.md) (audio has its own limiter); see Outside consumers |
| Backend test setup (`backend/jest/`, supertest, in-memory MongoDB) | `backend/TESTING.md` (not a card) | every route test; its Troubleshooting explains the supertest port and unique-index fixes |
| A Redux slice | its card in [app-state](../objects/app-state/_index.md) | the store or process it mirrors |
| Route roles in `frontend/src/main.jsx` | [user slice](../objects/app-state/user-slice.md) | [auth](../processes/auth.md) |
| Components, pages, styling, Tailwind or Flowbite themes | run the `impeccable` skill (`.claude/skills/impeccable/SKILL.md`) | the slice or store the component reads, from [app-state](../objects/app-state/_index.md) or [local-db](../objects/local-db/_index.md) |
| `AUDIO_STORAGE`, `IMAGE_STORAGE`, `/static` paths | [publish-content](../processes/publish-content.md) | [offline-audio](../processes/offline-audio.md); see Outside consumers |

## Does not move together

- The [playlist slice](../objects/app-state/playlist-slice.md) (audio queue) never touches a
  stored playlist.
- [Playlist](../objects/data-model/playlist.md) and [Service logbook](../objects/data-model/service-logbook.md)
  are not synced to IndexedDB; [delta-sync](../processes/delta-sync.md) does not hit them.
- Ghosts — [SearchHistory](../objects/data-model/search-history.md),
  [settings store](../objects/local-db/settings-store.md) — hit nothing at runtime.

## Outside consumers

Nothing inside the repo names these, so no card would warn you. Check them before you rename
or move files.

| Consumer | Points at | Breaks when |
|---|---|---|
| `frontend/.impeccable/live/roots.json` (untracked) | absolute paths to `PRODUCT.md`, `DESIGN.md` | either file moves |
| `impeccable` skill, `.claude/skills/impeccable/` | `PRODUCT.md`, `DESIGN.md` at the repo root | either file moves or is renamed |
| Obsidian vault `mkc-songbook/` (one note per repo file, per `PRODUCT.md`) | repo file paths | any source file is renamed or moved |
| Claude Code project memory `~/.claude/projects/-Users-esrom-js-apps-mkc-songbook/` | the checkout path | the repo folder moves |
| `backend/Dockerfile` | `index.js`, `EXPOSE 8080`; `.dockerignore` drops `uploads`, `.env` | entry file renamed; `EXPOSE` only documents 8080, so set `PORT=8080` to match |
| Cloudflare Turnstile widget (Cloudflare dashboard) | `TURNSTILE_SECRET_KEY` (backend), `VITE_TURNSTILE_SITE_KEY` (frontend), the widget's hostname list | a key is rotated, or the frontend hostname is missing from the widget: every required login captcha fails, and in production a missing secret does the same |
| Google Cloud OAuth client | `GOOGLE_CLIENT_ID` (backend), `VITE_GOOGLE_CLIENT_ID` (frontend) | the two ids differ or the backend one is unset: Google sign-in answers 401 |
| Reverse proxy or host in front of the API | `TRUST_PROXY` (hop count) | the count is wrong or unset behind a proxy: every client shares one address, so rate limits and login failure counters hit everyone at once |
| `.vscode/settings.json` | Prettier tabs, width 3 | formatting rules change (also `docs/conventions.md`) |

No CI config (`.github/`) and no scheduled jobs exist in the repo.
Others may exist outside this machine; add them here when found.
