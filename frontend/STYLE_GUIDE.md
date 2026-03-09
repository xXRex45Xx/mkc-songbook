# MKC Songbook Documentation Style Guide

## Table of Contents

1. [Overview](#overview)
2. [Documentation Philosophy](#documentation-philosophy)
3. [Comment Types and Usage](#comment-types-and-usage)
4. [JSDoc Standards](#jsdoc-standards)
5. [Module-Level Documentation](#module-level-documentation)
6. [Function and Method Documentation](#function-and-method-documentation)
7. [Component Documentation](#component-documentation)
8. [Class and Interface Documentation](#class-and-interface-documentation)
9. [Type and Interface Definitions](#type-and-interface-definitions)
10. [Error Handling Documentation](#error-handling-documentation)
11. [Examples](#examples)
12. [Naming Conventions](#naming-conventions)
13. [Common Patterns](#common-patterns)
14. [Anti-Patterns](#anti-patterns)
15. [Editor Configuration](#editor-configuration)

---

## Overview

This guide establishes standardized documentation practices for the MKC Songbook codebase. The goal is to create **consistent, machine-readable, and developer-friendly** documentation that serves both human developers and AI agents.

### Principles

- **Completeness**: All public APIs must be fully documented
- **Consistency**: Uniform formatting across the codebase
- **Clarity**: Intent and behavior must be explicit
- **Maintainability**: Documentation should be easy to update
- **Machine-Readability**: Structured for IDE integration and AI processing

---

## Documentation Philosophy

### When to Document

**Always document:**
- Public functions, methods, and classes
- Exported variables and constants
- React components and their props
- Redux reducers and actions
- API utility functions
- Custom hooks

**Never document:**
- Private implementation details (unless complex)
- Trivial code (e.g., `return null;`)
- Variables that are self-explanatory
- Test implementation details

### Documentation Depth

| Code Element | Minimum Documentation |
|-------------|----------------------|
| Public function | JSDoc with `@param`, `@returns` |
| Private function | Brief `/** */` comment |
| Component | JSDoc with props and usage example |
| Config object | JSDoc describing purpose |
| Utility function | JSDoc with type signatures |

---

## Comment Types and Usage

### Block Comments (`/** */`)

**Use for:** Public APIs, complex logic, module descriptions

```javascript
/**
 * @fileoverview Main entry point for application
 * Initializes React Router and Redux store
 */

/**
 * Authenticates user with credentials
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} User data and token
 * @throws {Error} On invalid credentials
 */
export const login = async (email, password) => { ... }
```

### Inline Comments (`//`)

**Use for:** Brief explanations, temporary notes, self-explanatory code

```javascript
// Validate email format before API call
if (!emailRegex.test(email)) throw new Error('Invalid email');

// Initialize state with default values
const [count, setCount] = useState(0);
```

### Section Comments (`// === SECTION ===`)

**Use for:** Logical code sections within functions

```javascript
/**
 * Process user authentication flow
 */
export const login = async (email, password) => {
  // Step 1: Validate input
  validateCredentials(email, password);
  
  // Step 2: Make API request
  const response = await api.login(email, password);
  
  // Step 3: Store token and update state
  localStorage.setItem('token', response.token);
};
```

---

## JSDoc Standards

### Required Tags

| Tag | Purpose | When to Use |
|-----|---------|-------------|
| `@param` | Function parameters | All functions |
| `@returns` | Return value | All non-void functions |
| `@throws` | Error conditions | Functions that throw |
| `@example` | Usage examples | Complex or non-obvious APIs |
| `@deprecated` | Deprecation notices | Deprecated functions |
| `@see` | Related references | Cross-references |
| `@type` | Type annotations | Complex types |

### Type Notation

Use JSDoc type syntax:

```javascript
/**
 * @param {string} name - User's name
 * @param {number} [age] - Optional age
 * @param {Object} [options] - Configuration object
 * @param {boolean} [options.debug=false] - Enable debug mode
 * @returns {Promise<User>} Resolves to user object
 */
```

**Type Reference:**
- `string`, `number`, `boolean`, `object`, `array`, `function`
- `Object.<Key, Value>` for maps
- `Array<Type>` for typed arrays
- `Type1 \| Type2` for unions
- `[Type1, Type2]` for tuples
- `{prop: Type}` for objects with specific shape

---

## Module-Level Documentation

### Required `@fileoverview`

Every module must have a file-level overview at the top:

```javascript
/**
 * @fileoverview User authentication utility functions
 * Handles login, registration, and session management
 */

/** @fileoverview API client for song management operations */
```

### Module Export Documentation

Document module-level exports:

```javascript
/**
 * Main Redux store configuration
 * Combines all reducer slices into single store
 * @type {import('@reduxjs/toolkit').EnhancedStore<AppState>}
 */
export const store = configureStore({ ... });

/**
 * Authentication state slice
 * Manages user session and profile data
 */
export const userSlice = createSlice({ ... });
```

---

## Function and Method Documentation

### Standard Format

```javascript
/**
 * [Brief one-line description of purpose]
 *
 * [Detailed description with context, behavior, and side effects]
 *
 * @param {Type} name - Parameter description
 * @param {Object} [options] - Named parameter object (if applicable)
 * @param {Type} [options.prop] - Property description
 * @returns {Type} Return value description
 * @throws {ErrorType} Conditions under which errors are thrown
 * @example Usage example
 */
```

### Async Functions

Always document return type as `Promise`:

```javascript
/**
 * Fetches user data from API
 * @param {string} userId - User identifier
 * @returns {Promise<User>} Resolves to user object
 * @throws {Error} 404 if user not found, 500 for server errors
 */
export const getUser = async (userId) => { ... }
```

### Callback Functions

Document callback signature:

```javascript
/**
 * Searches songs by query parameters
 * @param {Object} query - Search parameters
 * @param {string} query.q - Query string
 * @param {string} [query.type] - Search type (song/album/artist)
 * @param {number} [query.page=1] - Page number
 * @param {(error, results) => void} callback - Completion callback
 * @throws {Error} On invalid request
 */
export const searchSongs = (query, callback) => { ... }
```

---

## Component Documentation

### React Component Template

```javascript
/**
 * [Component Name]
 *
 * [Purpose and key features]
 *
 * @component
 * @param {Object} props - Component props
 * @param {ReactNode} [props.children] - Child elements
 * @param {string} [props.className] - CSS class names
 * @param {Type} [props.data] - Data prop description
 * @param {Function} [props.onEvent] - Event handler description
 * @returns {JSX.Element} Rendered component
 * @example
 * ```jsx
 * return (
 *   <Component prop="value">Children</Component>
 * )
 * ```
 */
const Component = ({ children, className, data, onEvent }) => { ... };

export default Component;
```

### Props Documentation

Document each prop systematically:

```javascript
/**
 * Song Card Component
 * Displays song information with action buttons
 *
 * @component
 * @param {Object} props - Component props
 * @param {Song} props.song - Song object to display
 * @param {boolean} [props.showPlayButton=true] - Show play button
 * @param {boolean} [props.isFavorite=false] - Whether song is favorite
 * @param {Function} [props.onPlay] - Play callback
 * @param {Function} [props.onToggleFavorite] - Favorite toggle callback
 * @returns {JSX.Element} Song card element
 */
const SongCard = ({ song, showPlayButton, isFavorite, onPlay, onToggleFavorite }) => { ... };
```

### Component Hooks

Document custom hooks:

```javascript
/**
 * Custom hook for window resize handling
 * Updates Redux store with current window width
 * Uses useLayoutEffect to prevent visual flickering
 * @returns {void}
 * @example
 * ```jsx
 * useWindowSize(); // Call in component body
 * ```
 */
const useWindowSize = () => { ... };
```

---

## Class and Interface Documentation

### Class Documentation

```javascript
/**
 * Album model class
 * Represents a music album with songs and metadata
 * @class
 */
class Album {
  /**
   * Creates album instance
   * @param {Object} data - Album data
   * @param {string} data.title - Album title
   * @param {string} data.artist - Album artist
   * @param {Array<Song>} data.songs - Array of songs
   */
  constructor(data) { ... }
  
  /**
   * Adds song to album
   * @param {Song} song - Song to add
   * @returns {number} Index of added song
   * @throws {Error} If song already exists
   */
  addSong(song) { ... }
}
```

---

## Type and Interface Definitions

### Type Aliases

```javascript
/**
 * User object type
 * @typedef {Object} User
 * @property {string} id - User identifier
 * @property {string} email - User email
 * @property {string} name - User display name
 * @property {'public' | 'member' | 'admin' | 'super-admin'} role - User role
 * @property {Array<string>} [favorites] - Favorite song IDs
 */

/**
 * Search query parameters
 * @typedef {Object} SearchQuery
 * @property {string} [q] - Search query string
 * @property {'song' | 'album' | 'artist'} [type] - Search type
 * @property {string} [sortBy] - Sort field
 * @property {'asc' | 'desc'} [order] - Sort order
 */
```

### Interface Definitions

```javascript
/**
 * API response interface
 * @interface ApiResponse
 * @property {boolean} success - Operation success status
 * @property {*} [data] - Response data
 * @property {string} [message] - Error message if failed
 */
```

---

## Error Handling Documentation

### Documenting Error Conditions

```javascript
/**
 * Validates user credentials
 * @param {string} email - User email
 * @param {string} password - User password
 * @throws {Error} 
 *   - InvalidEmail: Email format is incorrect
 *   - InvalidPassword: Password doesn't meet requirements
 *   - MissingField: Required field is empty
 */
const validateCredentials = (email, password) => { ... };
```

### Error Types

Document error types with context:

```javascript
/**
 * @throws {Error} On API failure
 * @throws {Error} 401: Invalid or expired token
 * @throws {Error} 403: Insufficient permissions
 * @throws {Error} 500: Server error, try again later
 */
```

---

## Examples

### Usage Examples

```javascript
/**
 * Logs in user with credentials
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User data and token
 * @example
 * ```javascript
 * const { user, token } = await login('user@example.com', 'password');
 * console.log('Logged in as:', user.name);
 * ```
 */
```

### Component Examples

```javascript
/**
 * @example
 * ```jsx
 * <SongCard 
 *   song={song}
 *   showPlayButton={true}
 *   isFavorite={false}
 *   onPlay={() => playSong(song.id)}
 *   onToggleFavorite={() => toggleFavorite(song.id)}
 * />
 * ```
 */
```

---

## Naming Conventions

### Documentation Naming

| Element | Convention | Example |
|---------|-----------|---------|
| Functions | camelCase | `getUserData`, `handleLogin` |
| Components | PascalCase | `SongCard`, `LoginForm` |
| Hooks | use + verb | `useWindowSize`, `useAuth` |
| Configs | camelCase | `buttonTheme`, `navbarTheme` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| Private vars | _prefix | `_internalState`, `_cache` |

### Type Naming

| Element | Convention | Example |
|---------|-----------|---------|
| Interfaces | PascalCase | `ApiResponse`, `UserConfig` |
| Type aliases | PascalCase | `UserType`, `SearchOptions` |
| Props | camelCase | `className`, `onSubmit` |

---

## Common Patterns

### API Utility Pattern

```javascript
/**
 * @fileoverview Song API utility functions
 * Handles all song-related HTTP operations
 */

/**
 * Fetches songs with pagination and search
 * @param {Object} [params] - Request parameters
 * @param {Object} [params.search] - Search query object
 * @param {string} [params.search.q] - Query string
 * @param {string} [params.search.type] - Search type
 * @param {number} [params.page=1] - Page number
 * @param {string} [params.token] - Auth token
 * @returns {Promise<{songs: Song[], totalPages: number}>} Paginated results
 * @throws {Error} 400: Invalid request, 401: Unauthenticated, 500: Server error
 */
export const getAllOrSearchSongs = async (params = {}, page = 1, token) => {
  // Implementation
};
```

### Redux Reducer Pattern

```javascript
/**
 * User state slice
 * Manages authentication flow and user profile
 * @type {import('@reduxjs/toolkit').Slice}
 */
export const userSlice = createSlice({
  name: 'user',
  initialState: {
    currentUser: null,
    adminType: null,
    authEmail: '',
  },
  reducers: {
    /**
     * Sets current user data
     * @param {Object} state - Current state
     * @param {Object} action - Action with user data
     * @param {User} action.payload - User object
     */
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    
    /**
     * Resets user session (logout)
     * @param {Object} state - Current state
     */
    resetCurrentUser: (state) => {
      state.currentUser = null;
      state.adminType = null;
    },
  },
});
```

### Component with Loader Pattern

```javascript
/**
 * Songs Page Component
 * Displays paginated song list with search and sorting
 *
 * @component
 * @returns {JSX.Element} Songs page with table
 */
const SongsPage = () => {
  const { songs, totalPages } = useLoaderData();
  return <SongsTable songs={songs} totalPages={totalPages} />;
};

/**
 * Route loader for songs page
 * Fetches songs with pagination and search params
 * @param {Object} params - Route parameters
 * @param {Request} params.request - HTTP request
 * @returns {Promise<{songs: Song[], totalPages: number}>}
 */
export const loader = async ({ request }) => {
  const searchParams = new URL(request.url).searchParams;
  // Implementation
};
```

---

## Anti-Patterns

### ❌ Incomplete Parameter Documentation

```javascript
// BAD
/**
 * Login function
 * @param email - User email
 * @param password - User password
 * @returns User data
 */
const login = (email, password) => { ... };

// GOOD
/**
 * Authenticates user with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password (minimum 8 characters)
 * @returns {Promise<{user: User, token: string}>} User data and auth token
 * @throws {Error} 400: Invalid input, 401: Wrong credentials
 */
export const login = async (email, password) => { ... };
```

### ❌ Missing Type Information

```javascript
// BAD
/**
 * Get user by ID
 * @param id - User ID
 */
const getUser = (id) => { ... };

// GOOD
/**
 * Fetches user by identifier
 * @param {string} id - User ID or email
 * @returns {Promise<User>} User object
 */
export const getUser = async (id) => { ... };
```

### ❌ Vague Descriptions

```javascript
// BAD
/**
 * Process the request
 */
const processRequest = (req) => { ... };

// GOOD
/**
 * Validates and processes song upload request
 * Extracts metadata, validates file format, and stores song data
 */
const processSongUpload = (req) => { ... };
```

### ❌ Missing Error Documentation

```javascript
// BAD
/**
 * Fetches current user
 */
export const getCurrentUser = async (token) => { ... };

// GOOD
/**
 * Fetches currently logged-in user data
 * @param {string} token - Authentication token
 * @returns {Promise<User>} User object
 * @throws {Error} 401: Invalid or expired token
 */
export const getCurrentUser = async (token) => { ... };
```

---

## Editor Configuration

### VS Code Settings

```json
{
  "typescript.preferences.casePreferences": "lower",
  "typescript.preferences.quoteStyle": "double",
  "javascript.preferences.quoteStyle": "double",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### Eslint Configuration

```javascript
// eslint.config.js
export default [
  {
    rules: {
      'jsdoc/require-param-description': 'error',
      'jsdoc/require-returns-description': 'error',
      'jsdoc/require-throws-description': 'error',
      'jsdoc/require-example': ['warn', { matchFunction: /.*\w+/ }],
      'jsdoc/check-param-names': 'error',
      'jsdoc/check-return-type': 'error',
    },
  },
];
```

---

## Quick Reference

### Documentation Checklist

- [ ] `@fileoverview` at module level
- [ ] All public functions have JSDoc
- [ ] All `@param` tags have types and descriptions
- [ ] All non-void functions have `@returns`
- [ ] Error conditions documented with `@throws`
- [ ] Complex APIs have `@example`
- [ ] Component props fully documented
- [ ] Custom hooks have usage examples
- [ ] Reducers document state mutations
- [ ] Private helpers have brief comments

### Common Tags Reference

| Tag | Syntax | Example |
|-----|--------|---------|
| Param | `@param {Type} name - Desc` | `@param {string} email - User email` |
| Nested Param | `@param {Object} [obj] - Desc`<br>`@param {Type} [obj.prop] - Desc` | See above |
| Returns | `@returns {Type}` | `@returns {Promise<User>}` |
| Throws | `@throws {Type}` | `@throws {Error} On invalid input` |
| Example | `@example` | See examples above |
| See | `@see [ref]` | `@see [getUserById]` |
| Deprecated | `@deprecated [reason]` | `@deprecated Use loginV2 instead` |

---

## Maintenance

### When to Update Documentation

- Before adding new functions or parameters
- Before modifying function signatures
- Before deprecating APIs
- During feature additions or refactoring
- When error handling changes

### Documentation Review

Before PR submission, verify:
1. All new public APIs are documented
2. Type signatures are accurate
3. Examples are tested and working
4. Error conditions are documented
5. Component props are complete

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-03-05 | Initial | Initial documentation style guide |

---

## Appendix

### A. Type Reference

- `string`, `number`, `boolean`, `object`, `array`, `function`
- `any`, `void`, `null`, `undefined`
- `Promise<T>` for async operations
- `ReactNode` for React children
- `JSX.Element` for React components
- `import('module').Type` for external types

### B. Common Descriptions

- **Input validation**: "Validates input format and constraints"
- **State mutation**: "Updates Redux state with new value"
- **Side effects**: "Dispatches action to Redux store"
- **API call**: "Makes HTTP request to backend API"
- **Cleanup**: "Removes event listener on unmount"
