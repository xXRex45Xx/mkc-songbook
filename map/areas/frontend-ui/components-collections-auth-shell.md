---
type: area
cluster: frontend-ui
universe: live
status: verified
owns: [frontend/src/components/admin-helper.component.jsx, frontend/src/components/album-card.component.jsx, frontend/src/components/album-form.component.jsx, frontend/src/components/album-viewer.component.jsx, frontend/src/components/horizontal-album-card.component.jsx, frontend/src/components/horizontal-playlist-card.component.jsx, frontend/src/components/playlist-card.component.jsx, frontend/src/components/playlist-form.component.jsx, frontend/src/components/playlist-viewer.component.jsx, frontend/src/components/auth-main-container.component.jsx, frontend/src/components/create-password-form.component.jsx, frontend/src/components/forgot-password-form.component.jsx, frontend/src/components/google-link.component.jsx, frontend/src/components/login-form.component.jsx, frontend/src/components/reset-password.component.jsx, frontend/src/components/sign-up-form.component.jsx, frontend/src/components/verify-email-form.component.jsx, frontend/src/components/header.component.jsx, frontend/src/components/install-prompt.component.jsx, frontend/src/components/pwa-status.component.jsx, frontend/src/components/main-body-container.component.jsx, frontend/src/components/protected-route.component.jsx, frontend/src/components/custom-tail-spin.component.jsx, frontend/src/components/users-table.component.jsx, frontend/src/components/users-table-row.component.jsx]
description: "Album and playlist cards, forms and viewers; auth forms; header, PWA banners, layout and guards; users table."
verified: 2026-11-15 @ b2fce7d
---

# Components: collections, auth, shell

Run the `impeccable` skill for visual changes. This card routes by behavior.

## Files

| File | Role | Uses |
|---|---|---|
| `album-card.component.jsx` | Album tile with edit and delete | `user` slice; `deleteAlbum` |
| `album-form.component.jsx` | Create and edit album form | `getSong`; renders `new-album-song` |
| `album-viewer.component.jsx` | Album detail: queue, share, edit, delete | `playlist`, `user` slices; `deleteAlbum` |
| `horizontal-album-card.component.jsx`, `horizontal-playlist-card.component.jsx` | Compact header cards | `card-theme.config` |
| `playlist-card.component.jsx` | Playlist tile; favorites, local and synced variants | `user` slice |
| `playlist-form.component.jsx` | Create and edit; server mode (router submit) or local mode (IndexedDB plus `local-playlists` slice) | `local-playlist-api`, `songs-api` |
| `playlist-viewer.component.jsx` | Playlist detail; visibility, remove song, delete, upload local to server; handles ids starting `local_` | `playlist-api`, `local-playlist-api`; `local-playlists`, `playlist` slices |
| `admin-helper.component.jsx` | Upload shortcuts for admins | `user` slice |
| `login-form.component.jsx` | Password login, Turnstile when the server answers `CAPTCHA_REQUIRED`; exports `action` | `login`, `startSession` |
| `sign-up-form.component.jsx` | Step 1: email, then `requestOTP`; exports `action` | `user` slice via `store` |
| `verify-email-form.component.jsx` | OTP entry for sign-up and forgot flows; exports `action` | `verifyOTP`, `setAuthOtp` |
| `create-password-form.component.jsx` | Final sign-up step; `action` calls `registerUser`, `startSession` | `user` slice |
| `forgot-password-form.component.jsx`, `reset-password.component.jsx` | Forgot flow; each exports `action` | `requestOTP`, `resetPassword` |
| `google-link.component.jsx` | Google sign-in button | `googleOauthLogin`, `startSession` |
| `auth-main-container.component.jsx` | Layout shell for `/auth` pages | router |
| `header.component.jsx` | Navbar, avatar menu, search toggle; admin role toggle | `user` slice; `signOut`; `navbar-theme.config` |
| `install-prompt.component.jsx` | Install button, iOS hint | `pwa` slice; `install.util` |
| `pwa-status.component.jsx` | Offline-ready banner, failed-writes notice | `pwa` slice; `clearFailedWrites` |
| `main-body-container.component.jsx` | `<main>` wrapper with title slot | none |
| `protected-route.component.jsx` | Role guard | `user` slice |
| `custom-tail-spin.component.jsx` | Spinner | none |
| `users-table.component.jsx`, `users-table-row.component.jsx` | Admin users list; row promotes or demotes, then `navigate(0)` | `updateUserRole`, `configs` slice |

Auth `action` functions read and write Redux through the `store` singleton, outside render.

## Entry points

Auth forms are routes in `main.jsx` (see [routes and pages](routes-and-pages.md)). Viewers and forms are rendered by the album and playlist pages. `Header`, `PwaStatus` and `InstallPrompt` mount from `App.jsx`.

## Connected to

- **objects:** [user slice](../../objects/app-state/user-slice.md), [local-playlists slice](../../objects/app-state/local-playlists-slice.md), [pwa slice](../../objects/app-state/pwa-slice.md), [Playlist](../../objects/data-model/playlist.md)
- **processes:** [auth](../../processes/auth.md), [local-playlist-upload](../../processes/local-playlist-upload.md)
- **areas:** [user-api](../backend-api/user-api.md), [playlist-and-logbook-api](../backend-api/playlist-and-logbook-api.md), [api clients](../frontend-core/api-clients.md), [player and songs components](components-player-and-songs.md)

## Known defects

- `playlist-form.component.jsx` (~:220): the visibility `Select` reuses `id="name"`; its label points at `visibility`.
- `header.component.jsx`: `toggleRole` changes the role only on the client.

## If you change this

- **Hits:** `playlist-viewer` and `playlist-form` branch on local versus server, so a change to either needs the local-playlist path checked; auth `action` functions break if `user.slice` actions rename.
- **Does not hit:** audio queue behavior.

## See

- Source: `frontend/src/components/`
