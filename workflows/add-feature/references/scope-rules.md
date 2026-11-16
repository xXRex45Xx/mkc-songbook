# scope-rules — decide which side a feature touches

Rules for `add-feature` stage 01. The map's routing table does the file-level routing; this file
only decides which workflows run, in what order, and under what names.

## Which side

| The feature needs | Side |
|---|---|
| A new or changed endpoint, request field, response field, validation rule, role rule, rate limit, upload, email, environment variable, model field, index or seed change | backend |
| A new screen, route, component, flow, state, copy, theme, offline behavior, install or caching rule | frontend |
| A limit, default or flag the client also enforces or displays (for example an upload size the form checks): the server value changes | both; the API must return the value so the client stops hard-coding it |
| Both of the above, or a UI that shows data the API does not return yet | both |

Decide from the map, not from guesswork: for each need, find the row in `map/effects/CONTEXT.md`
("Route a task to files") and the Backend and Frontend columns it gives.

- **Frontend only:** the data and writes the UI needs already exist, with the type and meaning the UI
  needs, and they reach the client (check the response projection). Name the existing
  `frontend/src/utils/api/` function (full path and name) that provides each one. If you cannot, the
  feature is "both".
- **Backend only:** no screen, client function or offline rule changes. Say why no visible change is needed.
- **Both:** list every contract point the two share: route, method, roles, request fields, response
  shape, status codes.

## Order

- **Both:** backend first, committed and pushed, then frontend. The frontend run verifies in a real
  browser against the real endpoint, so it needs the backend in place. The backend's `spec.md` is the
  authority for the contract; if it changes the router's draft, the frontend run follows the backend spec.
- **One side:** just that run.

## Send away

- A defect or a bug with no new behavior: `workflows/fix-defect/`.
- The user wants live, in-browser variant iteration: the `impeccable` skill's live mode, outside any
  workflow. When Esrom picks a variant, run `workflows/review-commit/` to commit it.
- A pure restyle or polish: the `impeccable` skill, then `workflows/review-commit/`.
- Not a code change (a question, a docs-only edit): none of these; say so.

## Naming the child runs

The router's run is `{run}` = `<YYYYMMDD-HHMM>-<slug>` (`workflows/CONTEXT.md` §5). Each child run
keeps the timestamp and takes the slug cut to 37 characters (drop a trailing hyphen) plus a suffix,
so the whole slug stays at or under 40:

- backend child: `<YYYYMMDD-HHMM>-<slug37>-be`
- frontend child: `<YYYYMMDD-HHMM>-<slug37>-fe`

The child runs use these names in every one of their stages and in their `review-commit` hand-off.
