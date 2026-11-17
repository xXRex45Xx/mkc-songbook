# Change-Impact Index — which cards to open before a change

A catalog, not a spec. Find the thing you are changing, open the listed cards, and read their
**If you change this**. If this index and a card disagree, the card wins; fix this file.

## Route a task to files

Start here for any task. Find the feature; the **Backend** and **Frontend** columns are the area
cards that name the files. A task touching both sides opens both.

| Feature | Backend | Frontend |
|---|---|---|
| Sign-up, login, OTP, Google, session, favorites, roles | [user-api](../areas/backend-api/user-api.md) | [auth forms](../areas/frontend-ui/components-collections-auth-shell.md), [api clients](../areas/frontend-core/api-clients.md) |
| Songs: list, search, edit, audio | [song-api](../areas/backend-api/song-api.md) | [songs components](../areas/frontend-ui/components-player-and-songs.md), [pages](../areas/frontend-ui/routes-and-pages.md) |
| Albums | [album-api](../areas/backend-api/album-api.md) | [collections components](../areas/frontend-ui/components-collections-auth-shell.md), [pages](../areas/frontend-ui/routes-and-pages.md) |
| Playlists | [playlist-and-logbook-api](../areas/backend-api/playlist-and-logbook-api.md) | [collections components](../areas/frontend-ui/components-collections-auth-shell.md), [pages](../areas/frontend-ui/routes-and-pages.md) |
| Logbook (schedule page) | [playlist-and-logbook-api](../areas/backend-api/playlist-and-logbook-api.md) | `frontend/src/pages/schedule.page.jsx` and `logbook-api.util.js` only ([routes and pages](../areas/frontend-ui/routes-and-pages.md), [api clients](../areas/frontend-core/api-clients.md)); no component |
| Audio player, queue, lyrics | [song-api](../areas/backend-api/song-api.md) (stream) | [player components](../areas/frontend-ui/components-player-and-songs.md) |
| A new URL, guard, loader or action | none unless a new endpoint | [routes and pages](../areas/frontend-ui/routes-and-pages.md) |
| New API endpoint end to end | resource card above, [middlewares](../areas/backend-api/middlewares.md), [data-model](../objects/data-model/_index.md) | [api clients](../areas/frontend-core/api-clients.md), then the page or component |
| Offline, sync, queued writes, install | [song-api](../areas/backend-api/song-api.md) and [album-api](../areas/backend-api/album-api.md) (`?syncSince`), [middlewares](../areas/backend-api/middlewares.md) | [pwa and storage](../areas/frontend-core/pwa-and-storage.md), [build and config](../areas/frontend-core/build-and-config.md) |
| Auth cookies, CSRF, rate limits, CORS, env vars, Docker, seeding | [middlewares](../areas/backend-api/middlewares.md), [bootstrap](../areas/backend-core/bootstrap-and-utils.md) | [api clients](../areas/frontend-core/api-clients.md) (`api-client.util.js`) |
| File uploads (audio, covers) and their size limits | [bootstrap](../areas/backend-core/bootstrap-and-utils.md) (`multer.config.js`: audio 50 MB at :118, images 30 MB at :51 and :86), [middlewares](../areas/backend-api/middlewares.md) | the forms repeat the limits: `song-form.component.jsx:84`, `new-album-song.component.jsx:124` (audio 50 MB), `album-form.component.jsx:145` (cover 30 MB); a changed server limit is a both-sides change |
| Styling, themes, Tailwind | none | run the `impeccable` skill; [build and config](../areas/frontend-core/build-and-config.md) |
| Search (online or offline), search categories | [song-api](../areas/backend-api/song-api.md) (`type` rules in the Joi schema) | `search-bar.component.jsx`, `offline-search.util.js` ([api clients](../areas/frontend-core/api-clients.md)), `songs.page.jsx` and `albums.page.jsx` loaders, `use-fresh-result.hook.js` ([pwa and storage](../areas/frontend-core/pwa-and-storage.md)), `songs-table.component.jsx` |
| Login captcha threshold, device cookie, bot signal | `login-risk.middleware.js` (`CAPTCHA_AFTER_FAILURES` :33) in [user-api](../areas/backend-api/user-api.md); `captcha.util.js`, `bot-signal.util.js` in [bootstrap](../areas/backend-core/bootstrap-and-utils.md) | `login-form.component.jsx` (Turnstile widget needs `VITE_TURNSTILE_SITE_KEY` at build time); also `backend/README.md:168` |
| Offline copy of a new server list (e.g. logbook) | none | new `utils/db/*-idb-service.util.js`, `indexed-db.util.js` (`STORE_SCHEMAS`, `DB_VERSION`), `sync-service.util.js`, `session.util.js` (`endSession` clears per-user caches: decide whether church-wide data needs clearing), the page loader; see [pwa and storage](../areas/frontend-core/pwa-and-storage.md) |
| A new field on song, album, playlist or user | model, Joi schema (unknown body keys get 400: add to create and update schemas), controller (PUT clears omitted fields; song id rename copies fields by hand at `song.controller.js:~340`) | form component, display component, `optimistic-write.util.js` (`applySongWrite` and playlist branch copy fields into IndexedDB), local-playlist utils for device playlists |
| A new user field | also `passport.config.js:90` (JWT user projection) and the five hand-built user replies: `user.controller.js:141`, `:168`, `:262`, `:395`, `local-auth.middleware.js:42` | `user.slice.js`, `header.component.jsx` (no profile page or edit form exists: the avatar menu items "My Profile" and "Account Settings" at `header.component.jsx:183` have no handler) |
| A new route with a fixed path (for example `GET /api/song/count`, `PATCH /api/user/<x>`) | declare it above the `/:id` chain in the same router: `user.route.js:449`, `song.route.js:124`, `album.route.js:106`, `playlist.route.js:102` (`/:id` catches the fixed segment as an id) | none |
| Any backend change | the per-change test list in [backend tests](../areas/tests/backend-tests.md): unit tests as well as the route test | none (no frontend tests) |
| Docs that quote behavior | `backend/README.md` (search `type` values :89, body field lists :127-138, captcha "five" :168); root `README.md` (endpoint list :268-270) | none |

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
| OTP, OTP limits, email, SMTP | [OTP](../objects/data-model/otp.md) | [OTPLimit](../objects/data-model/otp-limit.md), [auth](../processes/auth.md) |
| Login risk checks, device cookie, captcha | [auth](../processes/auth.md) | [Device](../objects/data-model/device.md), [LoginAttempt](../objects/data-model/login-attempt.md) |
| JWT secret, claim, access or refresh lifetime, session cookies (`mkc_at`, `mkc_rt`), `mkc:signed-in` | [auth](../processes/auth.md) | [RefreshToken](../objects/data-model/refresh-token.md), [users store](../objects/local-db/users-store.md), [pendingWrites store](../objects/local-db/pending-writes-store.md) (`owner`) |
| CSRF header, `ALLOWED_ORIGINS`, CORS `credentials`, Origin matching (`backend/utils/origin.util.js`) | [auth](../processes/auth.md) | every frontend API call goes through `frontend/src/utils/api/api-client.util.js`; see Outside consumers |
| `?syncSince`, `?idsOnly`, sync triggers | [delta-sync](../processes/delta-sync.md) | [syncMeta store](../objects/local-db/sync-meta-store.md), [songs store](../objects/local-db/songs-store.md), [albums store](../objects/local-db/albums-store.md) |
| IndexedDB `STORE_SCHEMAS`, `DB_VERSION` | the store's card in [local-db](../objects/local-db/_index.md) | every process that reads that store |
| `X-Base-Updated-At`, `checkBaseVersion`, optimistic local writes | [offline-writes](../processes/offline-writes.md) | [pendingWrites store](../objects/local-db/pending-writes-store.md), [songs store](../objects/local-db/songs-store.md), [albums store](../objects/local-db/albums-store.md), [users store](../objects/local-db/users-store.md), [Playlist](../objects/data-model/playlist.md) (its write routes run `checkPlaylistWriteAccess` before `checkBaseVersion`) |
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
| DNS and hosting of the frontend and API | the two must share a registrable domain (sibling subdomains): the session cookies are `SameSite=Lax` | they are on different registrable domains (for example a `vercel.app` frontend and another API domain): the browser drops the cookies and nobody can stay signed in |
| Reverse proxy or host in front of the API | `TRUST_PROXY` (hop count), `Set-Cookie` pass-through, HTTPS to the browser | the count is wrong or unset behind a proxy: every client shares one address, so rate limits and login failure counters hit everyone at once; cookies stripped or served over plain HTTP in production (`Secure`): no session |
| `.vscode/settings.json` | Prettier tabs, width 3 | formatting rules change (also `docs/conventions.md`) |

No CI config (`.github/`) and no scheduled jobs exist in the repo.
Others may exist outside this machine; add them here when found.
