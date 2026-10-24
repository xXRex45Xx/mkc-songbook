# MKC Songbook — root catalog

Choir songbook PWA for MKC (Meserete Kiristos Church) Choir: Amharic lyrics, chords, audio,
playlists, service logbook. React + Vite frontend, Express + Mongoose backend.
This file routes only; content lives in the files it points at.

## Where things live

| Path | Holds |
|---|---|
| `frontend/` | React app. Routing: [frontend/AGENTS.md](frontend/AGENTS.md) |
| `backend/` | Express API. Routing: [backend/AGENTS.md](backend/AGENTS.md) |
| `map/` | System map: nouns, verbs, change impact. Entry: [map/AGENTS.md](map/AGENTS.md) |
| `docs/conventions.md` | Naming, formatting, imports, errors, JSDoc rules |
| `docs/pwa/` | PWA plan, architecture, audit (each has a status line) |
| `PRODUCT.md` | Users, roles, purpose, product principles |
| `DESIGN.md` | Visual design system |
| `README.md` | Human setup guide |

`PRODUCT.md` and `DESIGN.md` stay at the root: `frontend/.impeccable/live/roots.json` points at
them by absolute path.

## Go here for

| Task | Read first |
|---|---|
| Change a model, API or store | `map/AGENTS.md`, then the card |
| Write or edit any code | `docs/conventions.md` |
| Write JSDoc | `frontend/STYLE_GUIDE.md` or `backend/STYLE_GUIDE.md`, plus `TEMPLATES.md` |
| Backend tests | `backend/TESTING.md` |
| PWA / offline / sync | `docs/pwa/architecture.md` |
| UI or visual work | `PRODUCT.md`, `DESIGN.md` |

## Git

- Repo: https://github.com/xXRex45Xx/mkc-songbook.git — base branch `main`.
- Issues: https://github.com/xXRex45Xx/mkc-songbook/issues
