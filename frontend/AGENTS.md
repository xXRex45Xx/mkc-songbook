# MKC Songbook Frontend — catalog

React 18 + Vite 5 PWA (`vite-plugin-pwa`), Redux Toolkit, Flowbite React, Tailwind 3.
Run every command from `frontend/`.
Rules for all code: [../docs/conventions.md](../docs/conventions.md).
What each store and slice is: [../map/AGENTS.md](../map/AGENTS.md).

## Commands

| Job | Command |
|---|---|
| Dev server | `npm run dev` |
| Production build | `npm run build` |
| Preview build | `npm run preview` |
| Lint | `npm run lint` |

No frontend test suite exists.

## Where things live

| Path | Holds |
|---|---|
| `src/pages/` | Route pages and their loaders/actions |
| `src/components/` | UI components |
| `src/store/` | Redux store and slices |
| `src/utils/api/` | Backend calls |
| `src/utils/db/` | IndexedDB stores |
| `src/utils/pwa/` | Service worker registration, sync, write queue, install |
| `src/config/` | Flowbite themes, backend URL |
| `vite.config.js` | PWA manifest and Workbox caching |

## Read before

- JSDoc: [STYLE_GUIDE.md](STYLE_GUIDE.md) and [TEMPLATES.md](TEMPLATES.md).
- Offline or sync work: [../docs/pwa/architecture.md](../docs/pwa/architecture.md).
- UI work: [../PRODUCT.md](../PRODUCT.md), [../DESIGN.md](../DESIGN.md).

## Environment (copy [.env.example](.env.example) to `.env`, not tracked)

`VITE_BACKEND_URL`, `VITE_CLIENT_URL`, `VITE_GOOGLE_CLIENT_ID`.
