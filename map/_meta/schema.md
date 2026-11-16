# Map Schema — closed card types and fields

Three card types. No others without editing this file first.

## `area` — a code area (where to edit)

Lives in `areas/<cluster>/<slug>.md`. Copy `_templates/area.md`. Objects say what the data is,
processes say how it moves; an area card says **which files hold a slice of the code, what each
does, and what calls it**. Use it to route a task to files.

| Field | Values |
|---|---|
| `type` | `area` |
| `cluster` | `backend-api`, `backend-core`, `frontend-ui`, `frontend-core`, `tests` |
| `universe` | `live`, `leftover`, `ghost` |
| `status` | `stub`, `verified`, `stale` |
| `owns` | Globs of the files the card covers (coverage is counted from these) |
| `description` | One line; feeds `_index.md`. Double-quote it if it contains `: ` or ` #` |
| `verified` | `YYYY-MM-DD @ <commit>` — required when `status: verified` |

Clusters:

- `backend-api`: routes, controllers, middlewares and validation per resource.
- `backend-core`: `backend/index.js`, `backend/config/`, `backend/utils/`, deploy and env.
- `frontend-ui`: pages, routes, components.
- `frontend-core`: `frontend/src/utils/`, `store/`, `hooks/`, build config.
- `tests`: backend Jest suites and helpers.

Body sections, in order: summary, Files, Entry points, Connected to, Known defects (optional),
If you change this, See.

## `object` — a noun

Lives in `objects/<cluster>/<slug>.md`. Copy `_templates/object.md`.

| Field | Values |
|---|---|
| `type` | `object` |
| `cluster` | `data-model`, `local-db`, `app-state` |
| `universe` | `live`, `leftover`, `ghost` |
| `status` | `stub`, `verified`, `stale` |
| `entity` | `path:line` of the owning definition |
| `code-name` | Name in code when it differs from the product word |
| `description` | One line; feeds `_index.md`. Double-quote it if it contains `: ` or ` #` |
| `verified` | `YYYY-MM-DD @ <commit>` — required when `status: verified` |

Clusters:

- `data-model`: Mongoose models, `backend/models/*.model.js`.
- `local-db`: IndexedDB stores, `STORE_SCHEMAS` in `frontend/src/utils/db/indexed-db.util.js`.
- `app-state`: Redux slices, `frontend/src/store/slices/*.slice.js`.

### Citations

`path:line` from the repo root. A bare `:NN` is a line in the last file the card named.

### Body sections

In order: one-line summary, Why this shape, Shape, Connected to, Known defects (optional),
If you change this, Surfaces, See.

**Known defects** is the one home for bugs found while mapping. Each bullet says what goes
wrong and cites `path:line`. No bug goes in another section. List them all with:
`grep -rn -A12 '## Known defects' map/objects map/processes`

## `process` — a verb

Lives in `processes/<slug>.md`. Copy `_templates/process.md`. Same `status`, `description` and
`verified` fields, plus `consumes` and `produces`: lists of relative links to object cards.
Only movements that run in the code get a card.
