---
type: object
cluster: data-model
universe: live
status: verified
verified: 2026-10-24 @ 9db0d0c
entity: backend/models/service-logbook.model.js:37
code-name: LogBook
description: A scheduled church service and its songs, created before the service; model LogBook.
---

# Service logbook

One entry per church service, created before it so members know what is planned. The product
says "schedule" or "logbook"; the model is `LogBook`, files are `service-logbook.*`, the API is
`/api/logbook`.

## Why this shape

It records the service itself (where, when, cancelled or not), separate from any
[Playlist](playlist.md). Planned, not in code: a nullable ref to a Playlist, attachable later
(`PRODUCT.md`). Do not merge the two.

## Shape

- `churchName` String, required. `backend/models/service-logbook.model.js:38`
- `serviceDate` Date, required. `:39`
- `songList` [String ref Song]. `:40`
- `updatedAt`, `createdAt` Date. `:41`
- `cancelled` Boolean, default `false`. `:43`

The API body uses other names: `location`, `timestamp`, `songs`
(`backend/controllers/service-logbook.controller.js:77`).

API: `GET` and `POST /api/logbook` only (`backend/routes/service-logbook.route.js:34`). `GET`
drops `songList` from results and pages by 100 (`service-logbook.controller.js:33`).

## Connected to

- **joins:** [Song](song.md) by id. Deleting a song leaves its id here.
- **looks-like-but-is-not:** [Playlist](playlist.md).

## Known defects

- `/schedule/new` has no route action, so no UI ever calls `POST /api/logbook`.
  `frontend/src/main.jsx:180`
- No endpoint sets `cancelled`; it is always `false`.
  `backend/models/service-logbook.model.js:43`
- No update or delete endpoint, though `README.md` lists `PUT /api/logbook/:id`.
  `backend/routes/service-logbook.route.js:34`

## If you change this

- **Hits:** `backend/models/validation-schemas/service-logbook.validation-schema.js`,
  `backend/middlewares/service-logbook-validation.middleware.js`,
  `backend/controllers/service-logbook.controller.js`,
  `frontend/src/utils/api/logbook-api.util.js` (`getAllOrSearchLogBook` only),
  `frontend/src/pages/schedule.page.jsx`, `frontend/src/pages/new-schedule.page.jsx`.
- **Does not hit:** [Playlist](playlist.md) — no link exists yet; adding one is a new field.

## Surfaces

| Surface | Role |
|---|---|
| Admin, `/schedule/new` | meant to write; see Known defects |
| Members, `/schedule` | read (`frontend/src/main.jsx:172`) |

## See

- Source: `backend/models/service-logbook.model.js`
