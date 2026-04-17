# MKC Songbook Documentation Templates

## Table of Contents

1. [Module-Level Templates](#module-level-templates)
2. [Function and Method Templates](#function-and-method-templates)
3. [Component Templates](#component-templates)
4. [Hook Templates](#hook-templates)
5. [Redux Slice Templates](#redux-slice-templates)
6. [Utility Function Templates](#utility-function-templates)
7. [API Route Templates](#api-route-templates)
8. [Type and Interface Templates](#type-and-interface-templates)
9. [Configuration Object Templates](#configuration-object-templates)
10. [Quick Copy-Paste Snippets](#quick-copy-paste-snippets)

---

## Module-Level Templates

### Basic Module Template

```javascript
/**
 * @fileoverview [Brief description of module purpose]
 * [Optional: Additional context or scope description]
 */

// Imports
import { ... } from '...';

// Module-level exports
/**
 * [Export name]
 * [Brief description]
 * @type {Type}
 */
export const [name] = ...;
```

**Example:**
```javascript
/**
 * @fileoverview User API utility functions
 * Handles authentication, registration, and session management
 */

import backendURL from '../../config/backend-url.config';

/**
 * User API client for authentication operations
 * @type {Object}
 */
export const userAPI = { ... };
```

---

## Function and Method Templates

### Simple Function Template

```javascript
/**
 * [One-line description of function purpose]
 *
 * [Optional: Additional context or behavior details]
 *
 * @param {Type} [name] - [Parameter description]
 * @param {Object} [params] - [Named parameter object description]
 * @param {Type} [params.prop] - [Property description]
 * @returns {Type} [Return value description]
 * @throws {ErrorType} [Error conditions]
 * @example [Usage example]
 */
const [functionName] = ([...params]) => { ... };

export { [functionName] };
```

**Example:**
```javascript
/**
 * Validates email format using regex
 *
 * @param {string} email - User's email address
 * @returns {boolean} true if valid, false otherwise
 * @example
 * ```javascript
 * isValidEmail('user@example.com'); // true
 * isValidEmail('invalid'); // false
 * ```
 */
const isValidEmail = (email) => emailRegex.test(email);

export { isValidEmail };
```

---

### Async Function Template

```javascript
/**
 * [One-line description of async function]
 *
 * [Optional: Additional context or behavior details]
 *
 * @param {Type} [param1] - [Description]
 * @param {Object} [param2] - [Named parameter object]
 * @param {Type} [param2.prop] - [Property description]
 * @returns {Promise<Type>} [Resolved value description]
 * @throws {ErrorType} [Error conditions with status codes]
 * @example [Usage example]
 */
export const [asyncFunctionName] = async ([...params]) => { ... };

export default [asyncFunctionName];
```

**Example:**
```javascript
/**
 * Authenticates user with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password (minimum 8 characters)
 * @returns {Promise<{user: User, token: string}>} User data and authentication token
 * @throws {Error} 400: Invalid input format, 401: Wrong credentials
 */
export const login = async (email, password) => {
  const response = await fetch(`${backendURL}/api/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) throw { message: data.message, status: response.status };
  return data;
};
```

---

### Callback Function Template

```javascript
/**
 * [One-line description of callback function]
 *
 * @param {Type} [param1] - [Description]
 * @param {Function} callback - [Callback function description]
 * @param {Error} [callback.error] - [Error if occurred]
 * @param {Type} [callback.result] - [Success result]
 * @returns {void}
 * @throws {ErrorType} [Error conditions]
 */
const [functionName] = ([...params], callback) => { ... };

export { [functionName] };
```

**Example:**
```javascript
/**
 * Searches songs with pagination
 * @param {Object} query - Search parameters
 * @param {string} query.q - Query string
 * @param {number} [query.page=1] - Page number
 * @param {(error: Error|null, results: Object) => void} callback - Completion callback
 * @returns {void}
 * @throws {Error} 400: Invalid request
 */
export const searchSongs = (query, callback) => {
  fetch(`${backendURL}/api/songs${params}`)
    .then(res => res.json())
    .then(data => callback(null, data))
    .catch(err => callback(err, null));
};
```

---

## Component Templates

### Functional Component Template

```javascript
/**
 * [Component Name]
 *
 * [Purpose and key features]
 *
 * @component
 * @param {Object} props - Component props
 * @param {ReactNode} [props.children] - [Child elements description]
 * @param {string} [props.className] - [CSS class names]
 * @param {Type} [props.data] - [Data prop description]
 * @param {Function} [props.onEvent] - [Event handler description]
 * @returns {JSX.Element} Rendered component
 * @example [Usage example]
 */
const [ComponentName] = ({ children, className, data, onEvent }) => {
  // Component implementation
  return <div className={className}>...</div>;
};

export default [ComponentName];
```

**Example:**
```javascript
/**
 * Song Card Component
 * Displays song information with play and favorite actions
 *
 * @component
 * @param {Object} props - Component props
 * @param {Song} props.song - Song object to display
 * @param {boolean} [props.showPlayButton=true] - Show play button
 * @param {boolean} [props.isFavorite=false] - Whether song is favorite
 * @param {Function} [props.onPlay] - Play callback
 * @param {Function} [props.onToggleFavorite] - Favorite toggle callback
 * @returns {JSX.Element} Song card element
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
const SongCard = ({ song, showPlayButton, isFavorite, onPlay, onToggleFavorite }) => {
  return (
    <div className="song-card">
      <h3>{song.title}</h3>
      {showPlayButton && <button onClick={onPlay}>Play</button>}
    </div>
  );
};

export default SongCard;
```

---

### Container/Wrapper Component Template

```javascript
/**
 * [Component Name]
 *
 * [Purpose: wraps child components with layout/styling]
 *
 * @component
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to wrap
 * @param {string} [props.title] - [Title for header]
 * @param {ReactNode} [props.titleHelper] - [Additional title content]
 * @param {string} [props.className] - [Additional CSS classes]
 * @returns {JSX.Element} Wrapped content
 */
const [ComponentName] = ({ children, title, titleHelper, className }) => {
  return (
    <div className={className}>
      {title && <h2>{title}{titleHelper}</h2>}
      {children}
    </div>
  );
};

export default [ComponentName];
```

**Example:**
```javascript
/**
 * Main Body Container
 *
 * Wrapper component for page content with consistent styling
 * Provides title, subtitle, and content area
 *
 * @component
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child content
 * @param {string} [props.title] - Page title
 * @param {ReactNode} [props.titleHelper] - Additional title elements
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Styled container
 */
const MainBodyContainer = ({ children, title, titleHelper, className }) => {
  return (
    <div className={`main-body ${className}`}>
      {title && (
        <div className="page-header">
          <h1>{title}</h1>
          {titleHelper}
        </div>
      )}
      <div className="page-content">{children}</div>
    </div>
  );
};

export default MainBodyContainer;
```

---

### Form Component Template

```javascript
/**
 * [Form Component Name]
 *
 * [Purpose: handles form submission and validation]
 *
 * @component
 * @param {Object} props - Component props (if not using action)
 * @param {Function} props.onSubmit - Submit callback
 * @returns {JSX.Element} Form element
 * @example [Usage example]
 */
const [FormName] = ({ onSubmit }) => {
  // Form implementation
  return <form onSubmit={handleSubmit}>...</form>;
};

/**
 * Form action handler
 * [Brief description of action]
 *
 * @param {Object} params - Action parameters
 * @param {FormData} params.formData - Form submission data
 * @returns {Object|Response} Redirect or error response
 * @throws {Error} [Error conditions]
 */
export const action = async ({ formData }) => { ... };

export default [FormName];
```

**Example:**
```javascript
/**
 * Login Form Component
 *
 * Handles user authentication via email/password or OAuth
 * Features validation, error display, and loading states
 *
 * @component
 * @returns {JSX.Element} Login form
 * @example
 * ```jsx
 * <LoginForm /> // Uses route action for submission
 * ```
 */
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  return (
    <Form method="POST">
      <Input name="email" value={email} onChange={setEmail} />
      <Input name="password" type="password" value={password} onChange={setPassword} />
      <Button type="submit">Login</Button>
    </Form>
  );
};

/**
 * Login form action handler
 * Processes login request and handles authentication
 *
 * @param {Object} params - Action parameters
 * @param {FormData} params.formData - Form data
 * @returns {Object|Response} Redirect on success or errors
 * @throws {Error} On unexpected server errors
 */
export const action = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');
  
  try {
    const result = await login(email, password);
    return redirect('/');
  } catch (error) {
    return error;
  }
};

export default LoginForm;
```

---

## Hook Templates

### Custom Hook Template

```javascript
/**
 * [Hook Name]
 *
 * [Purpose and behavior description]
 *
 * @returns {Type} [Return value description]
 * @example [Usage example]
 */
const use[HookName] = () => {
  // Hook implementation
  return { ... };
};

export default use[HookName];
```

**Example:**
```javascript
/**
 * Window resize hook
 * Tracks window width and dispatches updates to Redux store
 * Uses useLayoutEffect to prevent visual flickering
 *
 * @returns {void}
 * @example
 * ```jsx
 * useWindowSize(); // Call in component body
 * ```
 */
const useWindowSize = () => {
  const dispatch = useDispatch();
  
  useLayoutEffect(() => {
    const updateSize = (e) => 
      dispatch(setWindowInnerWidth(e.target.innerWidth));
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);
};

export default useWindowSize;
```

---

### State Management Hook Template

```javascript
/**
 * [Hook Name]
 *
 * [Purpose: manages specific state or side effects]
 *
 * @param {Type} [initialValue] - [Initial value description]
 * @returns {Object} [State management object]
 * @example [Usage example]
 */
const use[HookName] = ([initialValue]) => {
  // Hook implementation
  return { state, setState, ... };
};

export default use[HookName];
```

**Example:**
```javascript
/**
 * Search input hook
 * Provides debounced search functionality with state
 *
 * @param {string} [initialValue] - Initial search value
 * @returns {{query: string, setQuery: Function, reset: Function}}
 * @example
 * ```jsx
 * const { query, setQuery, reset } = useSearch('');
 * ```
 */
const useSearch = (initialValue = '') => {
  const [query, setQuery] = useState(initialValue);
  
  const reset = () => setQuery('');
  
  return { query, setQuery, reset };
};

export default useSearch;
```

---

## Redux Slice Templates

### Reducer Slice Template

```javascript
/**
 * [Slice Name] slice
 *
 * [Purpose: manages specific state domain]
 *
 * @type {import('@reduxjs/toolkit').Slice}
 */
export const [sliceName]Slice = createSlice({
  name: '[sliceName]',
  initialState: {
    [prop]: [defaultValue],
  },
  reducers: {
    /**
     * [Reducer name]
     * [Description of state mutation]
     * @param {Object} state - Current state
     * @param {Object} action - Action with [payload description]
     */
    [reducerName]: (state, action) => {
      state.[prop] = action.payload;
    },
  },
});

export const { [reducerName] } = [sliceName]Slice.actions;
export default [sliceName]Slice.reducer;
```

**Example:**
```javascript
/**
 * User state slice
 * Manages authentication flow and user profile data
 *
 * @type {import('@reduxjs/toolkit').Slice}
 */
export const userSlice = createSlice({
  name: 'user',
  initialState: {
    currentUser: null,
    adminType: null,
    authEmail: '',
    authOtp: '',
  },
  reducers: {
    /**
     * Sets current user data
     * @param {Object} state - Current state
     * @param {Object} action - Action with user data as payload
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
      state.authEmail = '';
    },
    
    /**
     * Toggles between admin and member role
     * @param {Object} state - Current state
     * @returns {void}
     */
    toggleRole: (state) => {
      if (!state.adminType || !state.currentUser) return;
      state.currentUser.role = 
        state.currentUser.role === state.adminType 
          ? 'member' 
          : state.adminType;
    },
  },
});

export const {
  setCurrentUser,
  resetCurrentUser,
  toggleRole,
} = userSlice.actions;
export default userSlice.reducer;
```

---

## Utility Function Templates

### API Utility Template

```javascript
/**
 * @fileoverview [Module purpose]
 * [Optional: Additional context]
 */

/**
 * [Function Name]
 *
 * [Detailed description]
 *
 * @param {Type} [param] - [Description]
 * @returns {Promise<Type>} [Resolved value]
 * @throws {Error} [Error conditions]
 */
export const [functionName] = async ([...params]) => {
  // Implementation
};

/**
 * [Function Name 2]
 * ...
 */
```

**Example:**
```javascript
/**
 * @fileoverview User API utility functions
 * Handles authentication, registration, and session management
 */

/**
 * Requests OTP for email verification
 * @param {string} email - User's email address
 * @param {boolean} [forgotPassword=false] - If true, OTP is for password reset
 * @returns {Promise<Object>} Success response from server
 * @throws {Error} 400: Invalid email format, 500: Server error
 */
export const requestOTP = async (email, forgotPassword = false) => {
  if (!emailRegex.test(email))
    throw { message: 'Invalid email', status: 400 };
  
  const response = await fetch(
    `${backendURL}/api/user/otp${forgotPassword ? '?forgotPassword=true' : ''}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }
  );
  
  const data = await response.json();
  if (!response.ok) throw { message: data.message, status: response.status };
  return data;
};

/**
 * Verifies OTP sent to user's email
 * @param {Object} params - Verification parameters
 * @param {string} params.email - User's email address
 * @param {string|number} params.otp - OTP to verify
 * @returns {Promise<Object>} Success response from server
 * @throws {Error} 400: Invalid OTP, 401: Expired or wrong OTP
 */
export const verifyOTP = async ({ email, otp }) => {
  if (!otp) throw { message: 'OTP required', status: 400 };
  
  const response = await fetch(`${backendURL}/api/user/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });
  
  const data = await response.json();
  if (!response.ok) throw { message: data.message, status: response.status };
  return data;
};
```

---

### Validation Utility Template

```javascript
/**
 * @fileoverview [Validation module purpose]
 */

/**
 * [Validation function name]
 *
 * [Description]
 *
 * @param {Type} [input] - Input to validate
 * @param {Object} [options] - Validation options
 * @returns {Object} Validation result
 * @returns {boolean} [result.isValid] - Validation status
 * @returns {string[]} [result.errors] - Error messages
 * @throws {Error} [Error conditions]
 */
export const [functionName] = ([...params]) => { ... };
```

**Example:**
```javascript
/**
 * @fileoverview Form validation utilities
 */

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {{isValid: boolean, errors: string[]}} Validation result
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};
```

---

## API Route Templates

### Route Loader Template

```javascript
/**
 * [Route Name] loader
 *
 * [Description: fetches data for route]
 *
 * @param {Object} params - Route parameters
 * @param {Request} params.request - HTTP request
 * @param {Object} [params.params] - Route params
 * @returns {Promise<Object>} Data for component
 * @throws {Error} [Error conditions]
 */
export const loader = async ({ request, params }) => {
  // Implementation
};

/**
 * Route action handler
 * [Description: handles form submission]
 */
export const action = async ({ request, params }) => { ... };
```

**Example:**
```javascript
/**
 * Songs page loader
 * Fetches paginated songs with search and sorting
 *
 * @param {Object} params - Route parameters
 * @param {Request} params.request - HTTP request
 * @returns {Promise<{songs: Song[], totalPages: number}>}
 * @throws {Error} 401: Unauthenticated
 */
export const loader = async ({ request }) => {
  const searchParams = new URL(request.url).searchParams;
  const page = searchParams.get('page') || 1;
  const searchQuery = {
    q: searchParams.get('q'),
    type: searchParams.get('type'),
    sortBy: searchParams.get('sortby'),
  };
  
  return defer({
    songData: getAllOrSearchSongs(searchQuery, page),
  });
};

/**
 * Songs page action handler
 * Handles song creation and updates
 *
 * @param {Object} params - Route parameters
 * @param {FormData} params.formData - Form data
 * @returns {Response} Redirect on success
 * @throws {Error} 400: Invalid input
 */
export const action = async ({ request, params }) => {
  if (request.method !== 'POST') return null;
  
  const formData = await request.formData();
  const result = await createSong(formData);
  
  return redirect(`/songs/${result.id}`);
};
```

---

## Type and Interface Templates

### Type Alias Template

```javascript
/**
 * [Type Name]
 *
 * [Description]
 *
 * @typedef {Object} [TypeName]
 * @property {Type} [prop] - [Property description]
 * @property {Type} [prop] - [Property description]
 */
```

**Example:**
```javascript
/**
 * User object type
 * @typedef {Object} User
 * @property {string} id - User identifier
 * @property {string} email - User email address
 * @property {string} name - User display name
 * @property {'public' | 'member' | 'admin' | 'super-admin'} role - User role
 * @property {Array<string>} [favorites] - Favorite song IDs
 * @property {Date} [createdAt] - Account creation date
 */

/**
 * Search query parameters
 * @typedef {Object} SearchQuery
 * @property {string} [q] - Search query string
 * @property {'song' | 'album' | 'artist'} [type] - Search type
 * @property {string} [sortBy] - Sort field
 * @property {'asc' | 'desc'} [order] - Sort order
 * @property {number} [page=1] - Page number
 */
```

---

### Interface Template

```javascript
/**
 * [Interface Name]
 *
 * @interface [InterfaceName]
 * @property {Type} [prop] - [Property description]
 */
```

**Example:**
```javascript
/**
 * API response interface
 * @interface ApiResponse
 * @property {boolean} success - Operation success status
 * @property {*} [data] - Response data
 * @property {string} [message] - Error message if failed
 */

/**
 * Song object interface
 * @interface Song
 * @property {string} id - Song identifier
 * @property {string} title - Song title
 * @property {string} [lyrics] - Song lyrics
 * @property {Album} [album] - Associated album
 * @property {string} [audioUrl] - Audio file URL
 */
```

---

## Configuration Object Templates

### Config Object Template

```javascript
/**
 * [Config Name]
 *
 * [Description]
 *
 * @type {Object}
 */
export const [configName] = {
  [prop]: [value],
};
```

**Example:**
```javascript
/**
 * Button theme configuration
 * @type {Object}
 */
export const buttonTheme = {
  base: 'group flex items-center justify-center',
  size: {
    xs: 'text-xs px-2 py-1',
    sm: 'text-sm px-3 py-1.5',
    lg: 'text-lg px-5 py-2.5',
  },
};

/**
 * Form input theme configuration
 * @type {Object}
 */
export const inputTheme = {
  base: 'w-full rounded-md border p-2',
  variants: {
    primary: 'border-gray-300 focus:border-blue-500',
    error: 'border-red-500 focus:border-red-500',
  },
};
```

---

## Quick Copy-Paste Snippets

### Basic JSDoc Block

```javascript
/**
 * [One-line description]
 *
 * @param {Type} [name] - [Description]
 * @returns {Type} [Description]
 */
```

### Component Props

```javascript
/**
 * @param {Object} props - Component props
 * @param {ReactNode} [props.children] - Child elements
 * @param {string} [props.className] - CSS classes
 * @param {Type} [props.prop] - Prop description
 * @param {Function} [props.onEvent] - Event handler
 */
```

### Redux Reducer

```javascript
/**
 * @param {Object} state - Current state
 * @param {Object} action - Action with payload
 */
```

### Async Function

```javascript
/**
 * @returns {Promise<Type>} [Description]
 * @throws {Error} [Conditions]
 */
```

### Usage Example

```javascript
/**
 * @example
 * ```[language]
 * [code example]
 * ```
 */
```

---

## Usage Notes

1. **Always use JSDoc `/** */`** for public APIs, never inline `//` comments
2. **Include all required tags**: `@param`, `@returns`, `@throws` where applicable
3. **Use JSDoc type syntax**: `{Type}`, `{Type1 \| Type2}`, `{Property: Type}`
4. **Document error conditions** with specific status codes or error types
5. **Add examples** for complex or non-obvious APIs
6. **Keep descriptions concise** but complete
7. **Update documentation** when modifying function signatures

---

## Template Selection Guide

| Scenario | Template |
|----------|----------|
| New module | Module-Level Template |
| Public function | Function Template (sync/async) |
| React component | Functional Component Template |
| Custom hook | Custom Hook Template |
| Redux slice | Reducer Slice Template |
| API utility | API Utility Template |
| Route loader | API Route Template |
| Type definition | Type Alias Template |
| Config object | Configuration Object Template |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-03-05 | Initial | Initial documentation templates |
