# Testing Guide

## Running Tests

```bash
# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run only unit-focused tests
npm run test:unit

# Run controller and route integration tests
npm run test:integration

# Run E2E tests (reserved; no backend E2E suite is checked in yet)
npm run test:e2e

# Run a single test file
npm test -- __tests__/routes/user.route.test.js

# Run tests by filename pattern
npm test -- --testPathPattern=song.route
```

## Test Organization

```
backend/
├── __tests__/
│   ├── config/              # Config and bootstrap tests
│   ├── controllers/         # Controller unit tests
│   ├── init-db/             # Init script tests
│   ├── middlewares/         # Middleware unit tests
│   ├── models/              # Model and Joi schema tests
│   ├── routes/              # Route integration tests with Supertest
│   └── utils/               # Utility unit tests
├── jest/
│   ├── __mocks__/           # Manual mocks
│   ├── factories/           # Reusable data factories
│   ├── fixtures/            # Shared fixture data
│   ├── helpers/             # Auth, request, DB, and integration helpers
│   ├── jest.config.js       # Main Jest configuration source
│   ├── jest.env.js          # Test env defaults loaded before Jest setup
│   ├── jest.sequencer.js    # Custom test ordering
│   └── jest.setup.js        # Global mocks and test setup
├── jest.config.js           # Jest entry file
└── TESTING.md               # This file
```

## Current Test Setup

- Jest runs in a Node environment with Babel transform support.
- `backend/index.js` exports the Express app so route tests can import the app without starting the HTTP server.
- Environment defaults such as `NODE_ENV=test` and `JWT_SECRET` are provided by `backend/jest/jest.env.js`.
- Shared setup in `backend/jest/jest.setup.js` configures test doubles for external dependencies such as `dotenv`, `nodemailer`, `multer`, and `bcrypt`.
- Route integration tests use an in-memory MongoDB instance created by `backend/jest/helpers/integration.helper.js`.
- Model integration tests also use the in-memory MongoDB instance for schema and hook coverage.
- Coverage thresholds are enforced globally from `backend/jest/jest.config.js`.
- Coverage is collected only from runtime source files under `backend/index.js`, `config/`, `controllers/`, `middlewares/`, `models/`, `routes/`, and `utils/`.
- Coverage excludes `backend/__tests__/`, `backend/jest/`, and `backend/init-db/`, so helpers and fixtures no longer appear in the report.

## Writing Tests

### Unit Test Structure

```javascript
import { describe, it, expect, jest } from "@jest/globals";
import SongModel from "../../models/song.model.js";
import { validateUpdateFavorites } from "../../middlewares/user-validation.middleware.js";

jest.mock("../../models/song.model.js", () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
  },
}));

describe("validateUpdateFavorites", () => {
  it("calls next when the provided songs exist", async () => {
    const req = {
      body: { favorites: ["song-001"] },
      user: { favorites: [] },
    };
    const next = jest.fn();

    SongModel.find.mockResolvedValue([{ _id: "song-001" }]);

    await validateUpdateFavorites(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
```

### Route Integration Test Structure

```javascript
import request from "supertest";

import app from "../../index.js";
import {
  authHeader,
  createSong,
  ensureDbConnection,
  loginUser,
  resetDatabase,
  seedAuthUsers,
  teardownDb,
} from "../../jest/helpers/integration.helper.js";

describe("GET /api/user/favorites", () => {
  beforeAll(async () => {
    await ensureDbConnection();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await teardownDb();
  });

  it("returns the current user's favorites", async () => {
    const { memberUser } = await seedAuthUsers();
    await createSong({ _id: "song-001" });
    memberUser.favorites = ["song-001"];
    await memberUser.save();

    const loginResponse = await loginUser("member@mkc.com", "member123");

    const response = await request(app)
      .get("/api/user/favorites")
      .set(authHeader(loginResponse.body.token));

    expect(response.status).toBe(200);
  });
});
```

## Available Helpers

### `jest/helpers/integration.helper.js`

- `ensureDbConnection()` - starts or reuses the in-memory MongoDB connection
- `resetDatabase()` - clears test collections between tests
- `teardownDb()` - closes Mongoose and stops the in-memory server
- `seedAuthUsers()` - creates public/member/admin/super-admin test users
- `createUser()` - creates a single test user document with overridable defaults
- `loginUser(email, password)` - logs in through the real auth route
- `authHeader(token)` - returns a Bearer auth header object
- `createSong()`, `createAlbum()`, `createPlaylist()`, `createOtp()` - direct model seeding helpers

### Other Helpers

- `jest/helpers/auth.helper.js` - JWT helpers for token creation/decoding
- `jest/helpers/request.helper.js` - convenience wrappers around Supertest requests
- `jest/helpers/database.helper.js` - lower-level database cleanup helpers

## Best Practices

1. Use `beforeAll`/`beforeEach`/`afterAll` with the integration helper for route tests.
2. Keep tests isolated by calling `resetDatabase()` before each integration test.
3. Prefer seeding through shared helpers instead of repeating setup inline.
4. Mock external services and filesystem interactions in unit tests.
5. Assert both status codes and response payloads for route tests.
6. Cover happy paths and failure branches, especially validation and authorization cases.
7. Use descriptive test names that explain the expected behavior.
8. Keep examples aligned with real routes and helper APIs.
9. Add direct controller, model, and Joi schema tests when route coverage alone would miss important branches.
10. Prefer route tests for end-to-end request behavior and focused unit tests for branching business logic.

## Environment Variables for Testing

The test suite sets defaults for:

- `NODE_ENV=test`
- `JWT_SECRET=test-jwt-secret`
- `ALLOWED_ORIGINS=http://localhost:3000`
- `IMAGE_STORAGE=uploads/images`
- `AUDIO_STORAGE=uploads/audio`
- `DEFAULT_ADMIN_EMAIL=admin@mkc.com`
- `DEFAULT_ADMIN_NAME=Admin User`
- `DEFAULT_ADMIN_PHOTO_LINK=https://example.com/admin.jpg`
- `PORT=3001`

Note: integration tests do not rely on a preconfigured `DB_URI`; the in-memory database is started inside the integration helper.

## Coverage Notes

- Jest enforces global coverage thresholds of 80% for statements, branches, lines, and functions.
- Use `npm run test:coverage` to generate the HTML report in `backend/coverage/`.
- Coverage is intentionally scoped to runtime source files; test support code under `backend/jest/`, `backend/__tests__/`, and `backend/init-db/` is excluded.
- When coverage drops, prioritize uncovered controller branches and error paths.

## Current Coverage Scope

- Included in coverage: `backend/index.js`, `backend/config/`, `backend/controllers/`, `backend/middlewares/`, `backend/models/`, `backend/routes/`, and `backend/utils/`
- Excluded from coverage: `backend/__tests__/`, `backend/jest/`, and `backend/init-db/`

## Troubleshooting

### Tests fail with auth or env issues
- Confirm the test imports run through Jest so `jest.env.js` and `jest.setup.js` are loaded.
- Avoid starting the app with `npm run dev` while running integration tests.

### Integration tests interfere with each other
- Ensure `resetDatabase()` runs in `beforeEach`.
- Seed only the records required for the current test.

### Coverage threshold fails
- The suite can still have all tests passing while `npm test` fails on coverage.
- Open `coverage/index.html` and add tests for uncovered branches reported there.
