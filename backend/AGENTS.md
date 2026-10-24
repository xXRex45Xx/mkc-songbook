# MKC Songbook Backend — catalog

Express 4 + Mongoose 8 API. Run every command from `backend/`.
Rules for all code: [../docs/conventions.md](../docs/conventions.md).
What each model and route is: [../map/AGENTS.md](../map/AGENTS.md).

## Commands

| Job | Command |
|---|---|
| Dev server (nodemon) | `npm run dev` |
| Production | `npm start` |
| All tests + coverage | `npm test` |
| Watch | `npm run test:watch` |
| Unit (utils, middlewares) | `npm run test:unit` |
| Integration (controllers, routes) | `npm run test:integration` |
| E2E | `npm run test:e2e` — `__tests__/e2e/` is empty; no suite yet |
| One file | `npm test -- __tests__/middlewares/local-auth.middleware.test.js` |
| By pattern | `npm test -- --testPathPattern=local-auth.middleware` |

Atlas SRV lookup fails on Tailscale DNS: run `node --import ./scripts/dns-fix.js index.js`.

## Where things live

| Path | Holds |
|---|---|
| `models/`, `models/validation-schemas/` | Mongoose schemas, Joi request schemas |
| `routes/` then `middlewares/` then `controllers/` | Request path: route, checks, logic |
| `config/` | DB, Passport, Multer, Nodemailer setup |
| `utils/` | Errors, OTP, Amharic map, validators |
| `init-db/` | Seed script and `final_songs.json` (real catalog) |
| `__tests__/`, `jest/` | Tests; factories, fixtures, helpers, mocks |

## Read before

- Tests: [TESTING.md](TESTING.md) (helpers, factories, 80% coverage gate).
- JSDoc: [STYLE_GUIDE.md](STYLE_GUIDE.md) and [TEMPLATES.md](TEMPLATES.md).

## Environment (copy [.env.example](.env.example) to `.env`, not tracked)

`DB_URI`, `JWT_SECRET`, `ALLOWED_ORIGINS` (comma-separated), `PORT` (required; no default),
`DEFAULT_ADMIN_EMAIL`, `DEFAULT_ADMIN_NAME`, `DEFAULT_ADMIN_PHOTO_LINK`,
`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `AUDIO_STORAGE`, `IMAGE_STORAGE`, `NODE_ENV`.
