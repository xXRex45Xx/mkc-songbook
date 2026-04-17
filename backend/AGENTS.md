# MKC Songbook Backend - AGENTS.md

## Build & Test Commands

### Running Tests
- **All tests with coverage**: `npm test`
- **Watch mode**: `npm run test:watch`
- **Unit tests only** (utils, middlewares): `npm run test:unit`
- **Integration tests** (controllers, routes): `npm run test:integration`
- **E2E tests**: `npm run test:e2e`
- **Coverage report**: `npm run test:coverage`

### Running a Single Test
```bash
# By filename pattern
npm test -- --testPathPattern=local-auth.middleware

# Watch a specific test file
npm run test:watch -- --testPathPattern=local-auth.middleware

# Run specific test file directly
npm test -- __tests__/middlewares/local-auth.middleware.test.js
```

### Development
- **Start dev server**: `npm run dev` (uses nodemon)
- **Start production**: `npm start`

## Code Style Guidelines

### File Structure & Organization
- **Module syntax**: ES modules (`import`/`export`)
- **Test files**: `*.test.js` or `*.spec.js` in `__tests__/` directory
- **Factory files**: `factories/*.factory.js` for test data generation
- **Fixture files**: `fixtures/*.js` for static test data
- **Helper files**: `helpers/*.helper.js` for reusable test utilities

### Import Conventions
- Use absolute imports with `@/` alias pointing to project root
- Group imports: external → internal → relative
- Prefer named exports over default exports
- Import order: dependencies → models → middlewares → routes → utils → helpers

### Naming Conventions
- **Files**: `kebab-case` (e.g., `local-auth.middleware.js`, `user.factory.js`)
- **Classes**: `PascalCase` (e.g., `ClientFaultError`, `UserModel`)
- **Functions/Variables**: `camelCase` (e.g., `wrapAsync`, `mockUser`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `JWT_SECRET`, `ALLOWED_ORIGINS`)

### Error Handling
- **Custom error classes** in `utils/error.util.js`:
  - `ClientFaultError` (4xx errors)
  - `UnauthorizedError` (401)
  - `ForbiddenError` (403)
  - `NotFoundError` (404)
  - `ServerFaultError` (500)
- Use `wrapAsync()` to wrap async route handlers for automatic error catching
- Catch and rethrow errors with appropriate status codes
- Log internal errors server-side, send generic messages to clients
- Clean up uploaded files on error in global error handler

### Types & Validation
- Use JSDoc comments for all public functions and classes
- Use Joi schemas in `models/validation-schemas/` for request validation
- Validate MongoDB ObjectIds with `Types.ObjectId.isValid()`
- Type annotations in JSDoc: `@param {Type} name`, `@returns {Type}`

### Formatting
- **Indentation**: 2 spaces
- **Quotes**: Double quotes
- **Semicolons**: Required at end of statements
- **Line length**: Max 100 characters
- **Newlines**: Single blank line between functions/classes

### Testing Standards
- **Coverage threshold**: 80% across branches, functions, lines, statements
- **Test environment**: Jest with `testEnvironment: 'node'`
- **Timeout**: 10000ms
- **Mock location**: `jest/__mocks__/` for automatic mocking
- **Factory pattern**: Use factories in `jest/factories/` for test data
- **Database helper**: Use `database.helper.js` for MongoDB memory server setup
- **Auth helper**: Use `auth.helper.js` for JWT token creation

### Documentation
- JSDoc required for all modules, functions, and classes
- Include `@module` declaration at top of each file
- Document parameters, return values, and usage examples
- Explain error conditions and edge cases
- When creating or editing JSDoc, follow `backend/STYLE_GUIDE.md` and `backend/TEMPLATES.md` for formatting, required tags, and example structure

## Development Environment

### Dependencies
- **Runtime**: Express, Mongoose, Passport, JWT, Joi, bcrypt, Multer
- **Testing**: Jest, Supertest, mongodb-memory-server, jest-mock-extended
- **Dev tools**: Nodemon, Babel, Morgan, Helmet

### Environment Variables
- `DB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `ALLOWED_ORIGINS`: Comma-separated list of CORS origins
- `DEFAULT_ADMIN_EMAIL`, `DEFAULT_ADMIN_NAME`, `DEFAULT_ADMIN_PHOTO_LINK`
- `PORT`: Server port (default: 3000)

## Git Workflow
- Repository: `https://github.com/xXRex45Xx/mkc-songbook.git`
- Branch: `main`
- Issue tracker: https://github.com/xXRex45Xx/mkc-songbook/issues
