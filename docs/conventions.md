# Code Conventions — naming, layout, formatting, errors, JSDoc

Factory reference for every code change in `frontend/` and `backend/`. Where this file and the
code disagree, the code wins; fix this file.

JSDoc detail lives in the per-app standards, not here:
`frontend/STYLE_GUIDE.md`, `frontend/TEMPLATES.md`, `backend/STYLE_GUIDE.md`,
`backend/TEMPLATES.md`. Test standards live in `backend/TESTING.md`.

## Formatting (both apps)

- **Indentation**: tabs. `.vscode/settings.json` sets Prettier `useTabs: true`, `tabWidth: 3`.
  Measured 2026-10-24: `frontend/src` and `backend/controllers` are tab-indented. The old
  AGENTS.md said "2 spaces"; that was wrong.
- **Quotes**: double. **Semicolons**: required.
- **Line length**: max 100 characters.
- **Blank lines**: one between functions and classes.

## Imports

- Relative imports (`./`, `../`). No `@/` alias is configured in `frontend/vite.config.js` or the
  backend Babel/Jest config, and no file uses one. The old AGENTS.md claimed one: ghost.
- Group: external, then internal, then relative.
- Prefer named exports. Backend is ES modules; all backend files are `.js`.
- Backend order: dependencies, models, middlewares, routes, utils, helpers.

## File layout and naming

Frontend (`frontend/src/`):

| Kind | Path | Name |
|---|---|---|
| Component | `components/` | `kebab-case.component.jsx` |
| Page | `pages/` | `kebab-case.page.jsx` |
| Hook | `hooks/` | `useThing.hook.js` |
| Config | `config/` | `kebab-case.config.js` |
| Redux slice | `store/slices/` | `kebab-case.slice.js` |
| Util | `utils/`, `utils/api/`, `utils/db/`, `utils/pwa/` | `kebab-case.util.js` |

Backend (`backend/`): files are `kebab-case.<role>.js` in `controllers/`, `routes/`,
`middlewares/`, `models/`, `models/validation-schemas/`, `utils/`, `config/`.
Tests: `__tests__/**/*.test.js`; factories `jest/factories/*.factory.js`;
fixtures `jest/fixtures/`; helpers `jest/helpers/*.helper.js`.

Identifiers (both): classes `PascalCase`, functions and variables `camelCase`, constants
`UPPER_SNAKE_CASE`, private `_prefix`.

## Errors (backend)

Classes in `backend/utils/error.util.js`: `ClientFaultError` (4xx base), `UnauthorizedError`
(401), `ForbiddenError` (403), `NotFoundError` (404), `ServerFaultError` (500).

- Wrap async route handlers in `wrapAsync()`.
- Rethrow with the right status. Log internals server-side; send clients a generic message.
- The global error handler cleans up uploaded files.

## Validation and types

- Request validation: Joi schemas in `backend/models/validation-schemas/`.
- ObjectIds: `Types.ObjectId.isValid()`.
- JSDoc on every public function, class and component: `@fileoverview`, `@param`, `@returns`,
  `@throws`, and `@example` for non-obvious APIs. Format per the STYLE_GUIDE files above.
