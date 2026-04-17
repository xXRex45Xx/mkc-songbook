# MKC Songbook - AGENTS.md

## Build & Test Commands

### Frontend (React + Vite)
- **Run dev server**: `cd frontend && npm run dev`
- **Build for production**: `cd frontend && npm run build`
- **Lint code**: `cd frontend && npm run lint`
- **Preview build**: `cd frontend && npm run preview`

### Backend (Node.js/Express)
- **All tests with coverage**: `cd backend && npm test`
- **Watch mode**: `cd backend && npm run test:watch`
- **Unit tests only** (utils, middlewares): `cd backend && npm run test:unit`
- **Integration tests** (controllers, routes): `cd backend && npm run test:integration`
- **E2E tests**: `cd backend && npm run test:e2e`
- **Coverage report**: `cd backend && npm run test:coverage`

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
- **Backend dev server**: `cd backend && npm run dev` (uses nodemon)
- **Backend production**: `cd backend && npm start`
- **Frontend dev server**: `cd frontend && npm run dev`

## Code Style Guidelines

### File Structure & Organization
**Frontend:**
- Components: `src/components/*.component.jsx`
- Pages: `src/pages/*.page.jsx`
- Utils: `src/utils/*.{js,jsx}`
- Hooks: `src/hooks/*.hook.js`
- Config: `src/config/*.config.js`
- Store slices: `src/store/slices/*.slice.js`

**Backend:**
- Controllers: `controllers/` - Business logic
- Routes: `routes/` - API endpoints
- Middlewares: `middlewares/` - Request processing
- Models: `models/` - Database schemas + validation
- Utils: `utils/` - Helper functions
- Config: `config/` - Application configuration
- Tests: `__tests__/` - Jest test files

**Test Files:**
- Test files: `*.test.js` or `*.spec.js`
- Factories: `jest/factories/*.factory.js` for test data generation
- Fixtures: `jest/fixtures/*.js` for static test data
- Helpers: `jest/helpers/*.helper.js` for reusable utilities

### Import Conventions
**Frontend:**
- Use absolute imports from `src/` (e.g., `@/store/store`)
- Group imports: external → internal → relative
- Prefer named exports over default exports
- Component files use `.jsx` extension

**Backend:**
- Use absolute imports with `@/` alias pointing to project root
- Import order: dependencies → models → middlewares → routes → utils → helpers
- All files use `.js` extension
- Module syntax: ES modules (`import`/`export`)

### Naming Conventions
| Element | Convention | Example |
|---------|-----------|---------|
| **Frontend** | | |
| Components | PascalCase + .component.jsx | `SongCard.component.jsx`, `LoginForm.component.jsx` |
| Pages | PascalCase + .page.jsx | `SongsPage.page.jsx`, `AuthPage.page.jsx` |
| Hooks | use + verb + .hook.js | `useWindowSize.hook.js` |
| Configs | camelCase + .config.js | `buttonTheme.config.js` |
| Slices | camelCase + .slice.js | `user.slice.js`, `playlist.slice.js` |
| Utils | camelCase + .util.js | `amharicMap.util.js`, `regex.util.js` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_RETRY_COUNT` |
| Private vars | _prefix | `_internalState`, `_cache` |

| Element | Convention | Example |
|---------|-----------|---------|
| **Backend** | | |
| Files | kebab-case | `local-auth.middleware.js`, `user.factory.js` |
| Classes | PascalCase | `ClientFaultError`, `UserModel` |
| Functions/Variables | camelCase | `wrapAsync`, `mockUser` |
| Constants | UPPER_SNAKE_CASE | `JWT_SECRET`, `ALLOWED_ORIGINS` |

### Error Handling
**Backend Custom Errors** (in `utils/error.util.js`):
- `ClientFaultError` (4xx errors) - Base client error class
- `UnauthorizedError` (401) - Authentication required but missing/invalid
- `ForbiddenError` (403) - Insufficient permissions
- `NotFoundError` (404) - Resource not found
- `ServerFaultError` (500) - Internal server errors

**Best Practices:**
- Use `wrapAsync()` to wrap async route handlers for automatic error catching
- Catch and rethrow errors with appropriate status codes
- Log internal errors server-side, send generic messages to clients
- Clean up uploaded files on error in global error handler

### Types & Validation
**Frontend:**
- Use JSDoc comments for all public functions and components
- Type annotations in JSDoc: `@param {Type} name`, `@returns {Type}`
- Document props with full type information
- Use TypeScript-style types in JSDoc (e.g., `import('module').Type`)

**Backend:**
- Use JSDoc comments for all public functions and classes
- Use Joi schemas in `models/validation-schemas/` for request validation
- Validate MongoDB ObjectIds with `Types.ObjectId.isValid()`
- Type annotations in JSDoc: `@param {Type} name`, `@returns {Type}`

### Formatting (Both Projects)
- **Indentation**: 2 spaces
- **Quotes**: Double quotes
- **Semicolons**: Required at end of statements
- **Line length**: Max 100 characters
- **Newlines**: Single blank line between functions/classes

### Documentation Standards (JSDoc)
**Required Tags:**
- `@param {Type} name - Description` for all function parameters
- `@returns {Type}` for all non-void functions
- `@throws {ErrorType}` for error conditions
- `@example` for complex or non-obvious APIs
- `@fileoverview` at module level describing purpose

**Component Documentation Template:**
```javascript
/**
 * Component Name
 *
 * Purpose and key features
 *
 * @component
 * @param {Object} props - Component props
 * @param {Type} [props.propName] - Prop description
 * @returns {JSX.Element} Rendered component
 * @example
 * ```jsx
 * <Component prop="value" />
 * ```
 */
```

### Testing Standards (Backend)
- **Coverage threshold**: 80% across branches, functions, lines, statements
- **Test environment**: Jest with `testEnvironment: 'node'`
- **Timeout**: 10000ms
- **Mock location**: `jest/__mocks__/` for automatic mocking
- **Factory pattern**: Use factories in `jest/factories/` for test data
- **Database helper**: Use `database.helper.js` for MongoDB memory server setup
- **Auth helper**: Use `auth.helper.js` for JWT token creation

## Development Environment

### Frontend Dependencies
**Runtime:** React 18.3, Redux Toolkit, React Router DOM, Flowbite React, @dnd-kit/core
**Dev:** Vite 5.4, ESLint 9.9, Tailwind CSS 3.4, PostCSS, Autoprefixer

### Backend Dependencies
**Runtime:** Express 4.19, Mongoose 8.5, Passport, JWT, Joi, bcrypt, Multer, Helmet, CORS, Morgan
**Testing:** Jest 30.3, Supertest, mongodb-memory-server, jest-mock-extended

### Environment Variables (Backend)
- `DB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `ALLOWED_ORIGINS`: Comma-separated list of CORS origins
- `DEFAULT_ADMIN_EMAIL`, `DEFAULT_ADMIN_NAME`, `DEFAULT_ADMIN_PHOTO_LINK`
- `PORT`: Server port (default: 3000)

### Environment Variables (Frontend)
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID

## Git Workflow
- **Repository**: https://github.com/xXRex45Xx/mkc-songbook.git
- **Branch**: main
- **Issue tracker**: https://github.com/xXRex45Xx/mkc-songbook/issues
