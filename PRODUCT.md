# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Priority order: admin > choir member > public visitor. All three matter; the admin carries the most design weight.

- **Super-admin (the developer, one person):** everything everyone else can do, plus promote and demote admins. The super-admin role itself cannot be changed.
- **Admin / songleader:** manages the data — songs, albums, announcements, service scheduling and logging — and promotes or demotes non-admin users. Cannot edit another user's playlist.
- **Choir member:** everything a public visitor can do, plus access to schedules and announcements.
- **Public visitor:** searches and reads songs, albums, and playlists; streams audio; signs in (every new account defaults to the public role); creates playlists that live only in the browser's IndexedDB while signed out.

## Product Purpose

The working songbook of MKC Choir, the choir of Meserete Kiristos Church. It holds the full catalog — 1,016 songs of Amharic lyrics with chord notation, recordings, and album groupings spanning 1966 to 2016 — so the songleader can choose and order what gets sung, and a choir member can carry their phone into rehearsal or service and sing from the screen with or without network.

Success means the right song's words, chords, and audio reach the right person in time: prepared before the service by the songleader, read at a glance during the service by the singer.

## Positioning

The product is both the plan and the record of a choir's singing. The service logbook entry is created before a service and names the church, the date, and the songs — a service history no generic lyrics or karaoke app carries. Planned, not yet in code: a nullable reference from the logbook to a playlist, so members can see which songs will be played. A logbook entry does not need a playlist, and one can be linked later. Playlists and logbook entries stay separate records.

The catalog reaches the device before the network does. Songs and albums are mirrored into IndexedDB, route loaders read IndexedDB first and sync in the background, delta sync asks the server only for records changed since the last `updatedAt` seen, and offline audio is an explicit user-initiated save rather than a cache side effect.

## Operating Context

- Rehearsal and church service: phone in hand, often dim, often under stage light, often with weak or no network.
- The songleader creates the logbook entry before the service, with date, location, and songs, and builds setlists as playlists. Linking a playlist to a logbook entry is planned (optional, attachable later); the `LogBook` model has no playlist field yet.
- Planned future use: the lyrics page projected for the audience to read and sing along, with lyrics broken into sections and large fonts in a presentation mode.
- Search handles Amharic script, including variant-character matching (`frontend/src/utils/amharic-map.util.js`).
- Working branch: `pwa-and-responsiveness`.

## Capabilities and Constraints

- Roles: `public`, `member`, `admin`, `super-admin`. New accounts default to `public`. The super-admin role cannot be changed; only a super-admin may change an admin's role (`backend/controllers/user.controller.js`).
- Playlist edits are restricted to the playlist's creator, so an admin does not touch another user's playlist (`backend/controllers/playlist.controller.js`).
- PWA layer: `vite-plugin-pwa` with `registerType: "autoUpdate"`, IndexedDB-first loaders, `?syncSince` delta sync on both sides, audio excluded from the HTTP cache and saved explicitly, install prompt surfaced in the header with a static "Add to Home Screen" line for iOS Safari.
- Font-size preference already exists in `configsSlice`; treat it as a product requirement, not an experiment.
- Announcements: routed in the frontend (`/announcements`) but renders an "Under Construction" placeholder; no backend support yet. Undecided — scope and content model not established.
- Deployment target, domain, and HTTPS configuration are not established in the repo.
- `docs/pwa/audit-report.md` lists 12 broken features and 23 code defects against commit `fa2f32c`; `docs/pwa/architecture.md` §12 records that several have since been fixed. Re-verify any individual finding against the current tree before treating it as open.

## Brand Commitments

- Name: **MKC Choir**. MKC stands for **Meserete Kiristos Church**, the church the choir belongs to.
- App name in the manifest: "MKC Choir Songbook"; short name "MKC Songbook"; description "A collection of the MKC Choir songs."
- Logo: `frontend/src/assets/logo.svg` and `frontend/public/logo.svg`; icon set in `frontend/public/`.
- One-line description, generated at the user's request and not yet shipped: "Every song MKC Choir sings — Amharic lyrics, chords, and recordings — on the phone you carry into rehearsal."

## Evidence on Hand

- `backend/init-db/final_songs.json`: 1,016 real songs, all in Amharic script, years 1966–2016, fields `id`, `name`, `detail`, `year`, `chord`, `rhythm`, `tempo`, `albums`. This is the real catalog, usable as content.
- Obsidian knowledge base documenting the whole repository (~293 in-scope files, one note per file plus folder indexes) under vault path `mkc-songbook/`, reachable through the Obsidian MCP server.
- Repository docs: `README.md`, `AGENTS.md`, `frontend/README.md`, `backend/README.md`, `frontend/STYLE_GUIDE.md`, `backend/STYLE_GUIDE.md`, `backend/TESTING.md`, `docs/pwa/plan.md`, `docs/pwa/architecture.md`, `docs/pwa/audit-report.md`.
- Absences future work must not fabricate: no testimonials, press, benchmarks, pricing, licensing, or deployment/domain claims; no verified album cover or audio asset inventory.

## Product Principles

1. One product, three roles. The role decides what a visitor can see and do; it does not fork the app into separate experiences.
2. Offline is a real state for every user, including the logged-in songleader, not a demo that only anonymous visitors survive.
3. Data reaches the device before the network does: local store first, background delta sync, explicit audio save.
4. Amharic script is the content language. Search, rendering, and type sizes must respect it everywhere.
5. The logbook entry schedules a service; the playlist is a setlist it may point to. Keep them distinct records: the planned link is an optional reference, never a merge.

## Accessibility & Inclusion

- Lyrics must be readable while singing: large text, high contrast, legible in a dim hall or under stage light.
- Older and low-vision users are expected; the in-app font-size control is a hard requirement.
- Ethiopic/Amharic glyph rendering is the priority at every size.
- Projector presentation mode is planned: lyrics split into sections with large fonts for the audience.
