---
type: area
cluster: frontend-core
universe: live
status: verified
owns: [frontend/vite.config.js, frontend/tailwind.config.js, frontend/postcss.config.js, frontend/eslint.config.js, frontend/index.html, frontend/package.json, frontend/src/config/*.js]
description: "Vite and PWA build config, service worker caching rules, Tailwind palette, Flowbite theme files, env vars."
verified: 2026-11-17 @ d99b6dc
---

# Build and config

Build, PWA manifest, service worker routes, and the theme files that style Flowbite components.

## Files

| File | Role |
|---|---|
| `frontend/vite.config.js` | `react`, `svgr` (SVG only through `?react`), `VitePWA` (autoUpdate, dev SW on); manifest; Workbox rules; `manualChunks` (`ui`, `dragdrop`, `auth-and-feedback`, `vendor`) |
| `frontend/tailwind.config.js` | Content globs, palette (primary `#FABE1F`, secondary `#C9184A`), Flowbite plugin |
| `frontend/index.html` | Icons, theme color, title, entry script |
| `frontend/package.json` | Scripts `dev`, `build`, `lint`, `preview` |
| `frontend/src/config/backend-url.config.js` | `VITE_BACKEND_URL`, the API origin for every request |
| `frontend/src/config/button-theme.config.js` | `buttonTheme`, `uploadButtonTheme`, `buttonGroupTheme`, `formButtonTheme` (`uploadFormButtonTheme` is unused) |
| `frontend/src/config/card-theme.config.js` | Album and favorites card themes |
| `frontend/src/config/forms-theme.config.js` | Select, search input, range slider, number input, password input themes |
| `frontend/src/config/navbar-theme.config.js`, `table-theme.config.js`, `date-picker.config.js` | Single-use themes for `header`, `custom-table`, `new-schedule.page` |

Frontend env vars: `VITE_BACKEND_URL`, `VITE_CLIENT_URL`, `VITE_GOOGLE_CLIENT_ID`, `VITE_TURNSTILE_SITE_KEY` (see `frontend/.env.example`).

## Entry points

Cloudflare Pages files in `frontend/public` (copied to `dist`): `_headers` (`/sw.js` and the manifest revalidated; `/assets/*` and `/workbox-*.js` immutable), `404.html` (turns off the single-page-app fallback, so a missing asset is a 404) and `_redirects` (200 rewrites to `/` for each client route prefix of `main.jsx`; a new top-level route needs a line). Detail in `docs/pwa/architecture.md` §5.6. An update reloads each open tab on activation (`autoUpdate`); a failed lazy chunk is recovered by `chunk-error-recovery.util.js` ([pwa and storage](pwa-and-storage.md)).

Service worker caching (`frontend/vite.config.js`):

| Path | Strategy |
|---|---|
| `/api/song/:id/audio` | NetworkOnly (audio is cached by hand in IndexedDB) |
| `/api/song`, `/api/album`, `/api/playlist`, `/api/user/current-user`, `/api/user/favorites` | NetworkFirst |
| `/static/albums/images` | CacheFirst |
| `/api/logbook`, other `/api/user/*` | not cached |

## Connected to

- **processes:** [offline-audio](../../processes/offline-audio.md), [delta-sync](../../processes/delta-sync.md)
- **areas:** [components](../frontend-ui/components-collections-auth-shell.md) (themes), [pwa and storage](pwa-and-storage.md)
- **docs:** `docs/pwa/architecture.md`

## Known defects

- `package.json` lists `run` and `start` with no imports in `src`.
- `tailwind.config.js` uses CJS `require` in an ESM package; fragile, not run.
- Schedule page gets no offline data: `/api/logbook` has no cache rule.

## If you change this

- **Hits:** a new offline-readable `/api` path needs a rule here and a matching [api client](api-clients.md); a Tailwind color rename hits every theme file in `frontend/src/config/`; the Turnstile and Google env vars pair with backend keys (see [effects](../../effects/CONTEXT.md#outside-consumers)).
- **Does not hit:** backend code.

## See

- Source: `frontend/vite.config.js`
