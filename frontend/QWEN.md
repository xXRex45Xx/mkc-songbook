# MKC Songbook Frontend - Project Context

## Project Overview

This is a **React-based single-page application** for the MKC Choir Song Book platform. The application provides a web interface for managing and streaming gospel songs, albums, playlists, and service records for a choir community.

### Core Technologies

| Category | Technology |
|----------|-----------|
| **Framework** | React 18 |
| **Build Tool** | Vite 5.4 |
| **Routing** | React Router DOM 6.26 |
| **State Management** | Redux Toolkit 2.2 |
| **UI Components** | Flowbite React 0.10 |
| **Styling** | Tailwind CSS 3.4 |
| **Authentication** | Google OAuth (@react-oauth/google) |
| **Loading States** | React Loader Spinner 6.1 |
| **Drag & Drop** | @dnd-kit/core 6.3 |

### Architecture

The application follows a **modular architecture** with clear separation of concerns:

- **Pages**: Route-level components (e.g., `SongsPage`, `AuthPage`)
- **Components**: Reusable UI elements (e.g., `SongCard`, `LoginForm`)
- **Store**: Redux slices for state management (`user`, `configs`, `playlist`)
- **Utils**: API clients and utility functions
- **Config**: Theme and environment configurations
- **Hooks**: Custom React hooks for reusable logic

### Key Features

1. **Authentication**: Email/password with OTP, Google OAuth, JWT-based sessions
2. **Song Management**: Upload, edit, search, stream, and organize songs with lyrics/chords
3. **Album Management**: Create and manage albums with cover images
4. **Playlists**: Custom playlist creation with visibility controls (private/members/public)
5. **Service Logbook**: Record and track choir service performances
6. **User Management**: Admin panel for user roles and permissions
7. **Audio Streaming**: Range-request supported audio playback

---

## Building and Running

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API server running (default: `http://localhost:5000`)

### Environment Setup

Create a `.env` file in the frontend directory:

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Runs the development server at `http://localhost:5173` (default Vite port).

### Production Build

```bash
npm run build
```

Builds optimized production assets in the `dist/` directory.

### Preview

```bash
npm run preview
```

Locally preview the production build.

### Linting

```bash
npm run lint
```

Runs ESLint to check for code issues.

---

## Development Conventions

### Code Organization

```
src/
├── components/           # Reusable UI components
│   ├── *.component.jsx  # Component files use .component.jsx extension
│   └── *.styles.css     # Component-specific styles (optional)
├── pages/               # Page-level components
│   └── *.page.jsx       # Page files use .page.jsx extension
├── store/
│   ├── slices/          # Redux slice definitions (user, configs, playlist)
│   └── store.js         # Main store configuration
├── utils/
│   ├── api/             # API client functions
│   └── *.util.js        # Utility functions
├── config/              # Configuration files
├── hooks/               # Custom React hooks
└── assets/              # Static assets (images, icons, SVGs)
```

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase + `.component.jsx` | `SongCard.component.jsx` |
| Pages | camelCase + `.page.jsx` | `songs.page.jsx` |
| Redux Slices | camelCase + `.slice.js` | `user.slice.js` |
| Utils | camelCase + `.util.js` | `user-api.util.js` |
| Configs | camelCase + `.config.js` | `button-theme.config.js` |
| Hooks | `use` + camelCase + `.hook.js` | `useWindowSize.hook.js` |

### Documentation Standards

This project follows **JSDoc** documentation standards:

- **Public APIs**: Full JSDoc with `@param`, `@returns`, `@throws`
- **Components**: JSDoc with props and usage examples
- **Modules**: `@fileoverview` at the top of each file
- **See**: `STYLE_GUIDE.md` for detailed documentation rules
- **Templates**: `TEMPLATES.md` contains copy-paste documentation templates

**Current Documentation Status**: The codebase has **inconsistent documentation coverage**. API utilities are well-documented, but page components and hooks often lack JSDoc.

### React Router Pattern

The app uses **React Router v6** with **loader/actions** pattern:

```javascript
// Page exports loader and action for data fetching
export const loader = async ({ params }) => {
  const data = await api.fetch(params.id);
  return data;
};

export const action = async ({ request }) => {
  const formData = await request.formData();
  await api.submit(formData);
  return redirect('/success');
};

// In component
const MyPage = () => {
  const data = useLoaderData();
  // ...
};
```

### Redux Patterns

- **Slices**: Use `createSlice` from Redux Toolkit
- **State Structure**: Flat state with top-level slices (`user`, `configs`, `playlist`)
- **Selectors**: Use `useSelector` with inline state access
- **Actions**: Export action creators via `slice.actions`

```javascript
// Slice definition
export const userSlice = createSlice({
  name: 'user',
  initialState: { currentUser: null, token: null },
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
  },
});

// Usage in components
const user = useSelector((state) => state.user.currentUser);
const dispatch = useDispatch();
dispatch(setCurrentUser(userData));
```

### API Integration

All API calls go through utility functions in `src/utils/api/`:

```javascript
// Example: user-api.util.js
const backendURL = import.meta.env.VITE_BACKEND_URL;

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

### Error Handling

- **API Errors**: Throw objects with `status` and `message`
- **Route Errors**: Use `errorElement` for error pages
- **Validation**: Client-side validation before API calls
- **Protected Routes**: Redirect to auth page if not authenticated

### Styling

- **Tailwind CSS**: Utility-first styling with custom colors
- **Flowbite React**: Pre-built components for forms, buttons, cards
- **Custom Colors**: Defined in `tailwind.config.js` (primary, secondary, success, warning, error)

### Component Props Pattern

Components receive props and use hooks for state:

```javascript
const SongCard = ({ song, showPlayButton, onPlay }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  // Component implementation
};
```

---

## Project Structure

### Main Entry Point

`src/main.jsx` - Initializes:
- React Router with route definitions
- Redux store provider
- Google OAuth provider
- All page routes with loaders/actions

### Application Root

`src/App.jsx` - Main layout component:
- Auth state handling via loader
- Outlet for child routes
- Conditional rendering of Header and AudioPlayer

### Key Pages

| Page | Route | Purpose | Protected |
|------|-------|---------|-----------|
| `HomePage` | `/` | Redirects to songs | No |
| `SongsPage` | `/songs` | Browse/search songs | No |
| `LyricsPage` | `/lyrics/:id` | View song lyrics/chords | No |
| `AuthPage` | `/auth` | Login/signup flow | No |
| `AlbumsPage` | `/albums` | Browse albums | No |
| `AlbumPage` | `/album/:id` | View album details | No |
| `PlaylistsPage` | `/playlists` | Browse public playlists | No |
| `PlaylistPage` | `/playlist/:id` | View playlist | No |
| `UploadSongPage` | `/upload-song` | Add new songs | Admin |
| `EditSongPage` | `/edit-song/:id` | Edit existing songs | Admin |
| `UploadAlbumPage` | `/upload-album` | Create album | Admin |
| `EditAlbumPage` | `/edit-album/:id` | Edit album | Admin |
| `NewPlaylistPage` | `/new-playlist` | Create playlist | Yes |
| `EditPlaylistPage` | `/edit-playlist/:id` | Edit playlist | Creator |
| `SchedulePage` | `/schedule` | View service logbook | Member+ |
| `NewSchedulePage` | `/new-schedule` | Create service record | Admin |
| `UsersPage` | `/users` | User management | Admin |
| `ErrorPage` | `/error` | Error display | No |

### Protected Routes

Protected routes use the `ProtectedRoute` component:

```jsx
<ProtectedRoute roles={["admin", "super-admin"]}>
  <AdminOnlyPage />
</ProtectedRoute>
```

### Roles

- **public**: Unauthenticated users (view public content only)
- **member**: Registered users (create playlists, view logbook)
- **admin**: Administrative access (CRUD songs, albums, manage users)
- **super-admin**: Full access including admin role management

---

## Redux Store Structure

### `userSlice` (`src/store/slices/user.slice.js`)

Manages user authentication state:
- `currentUser`: User profile data (id, name, email, role, favorites)
- `token`: JWT authentication token
- `adminType`: Admin role type for UI conditioning

### `configsSlice` (`src/store/slices/configs.slice.js`)

Manages app-wide configuration:
- `fontSize`: User preference for text size
- `windowSize`: Current window dimensions
- UI theme settings

### `playlistSlice` (`src/store/slices/playlist.slice.js`)

Manages audio playback state:
- `queue`: Array of songs in current playlist
- `currentSong`: Currently playing song
- `isPlaying`: Playback state
- `volume`: Volume level

---

## Component Categories

### Layout Components
- `header.component.jsx` - Main navigation header
- `main-body-container.component.jsx` - Main content wrapper
- `auth-main-container.component.jsx` - Auth page wrapper
- `protected-route.component.jsx` - Route protection

### Form Components
- `login-form.component.jsx` - Login form
- `sign-up-form.component.jsx` - Registration form
- `forgot-password-form.component.jsx` - Password reset request
- `create-password-form.component.jsx` - Password creation
- `verify-email-form.component.jsx` - Email verification
- `song-form.component.jsx` - Song create/edit form
- `album-form.component.jsx` - Album create/edit form
- `playlist-form.component.jsx` - Playlist create/edit form

### Media Components
- `audio-player.component.jsx` - Main audio player
- `audio-player-toolbox.component.jsx` - Player controls
- `audio-controls.component.jsx` - Playback controls
- `lyric-viewer.component.jsx` - Lyrics display
- `album-viewer.component.jsx` - Album display
- `playlist-viewer.component.jsx` - Playlist display

### Card Components
- `album-card.component.jsx` - Album card
- `horizontal-album-card.component.jsx` - Horizontal album card
- `playlist-card.component.jsx` - Playlist card
- `horizontal-playlist-card.component.jsx` - Horizontal playlist card

### UI Components
- `custom-table.component.jsx` - Reusable table
- `custom-row.component.jsx` - Table row
- `custom-slider.component.jsx` - Slider/carousel
- `custom-tail-spin.component.jsx` - Loading spinner
- `search-bar.component.jsx` - Search input
- `sort-dropdown.component.jsx` - Sort options

---

## Dependencies

### Production

| Package | Purpose |
|---------|---------|
| `react`, `react-dom` | UI framework |
| `react-router-dom` | Client-side routing |
| `@reduxjs/toolkit`, `react-redux` | State management |
| `flowbite-react` | UI component library |
| `@react-oauth/google` | Google OAuth integration |
| `react-loader-spinner` | Loading animations |
| `@dnd-kit/core` | Drag-and-drop functionality |

### Development

| Package | Purpose |
|---------|---------|
| `vite` | Build tool and dev server |
| `tailwindcss` | Utility-first CSS |
| `@vitejs/plugin-react` | React plugin for Vite |
| `eslint` | Code linting |
| `vite-plugin-svgr` | SVG as React components |
| `postcss`, `autoprefixer` | CSS processing |

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_BACKEND_URL` | Backend API URL | Yes |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes (for OAuth) |

---

## Quick Reference

### Useful Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (port 5173)
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### File Locations

| Need | Location |
|------|----------|
| Add new page | `src/pages/new-page.page.jsx` |
| Add new component | `src/components/new-component.component.jsx` |
| Add Redux slice | `src/store/slices/new.slice.js` |
| Add API utility | `src/utils/api/new-api.util.js` |
| Update theme | `tailwind.config.js` |
| Update routes | `src/main.jsx` |

### Documentation Files

| File | Purpose |
|------|---------|
| `STYLE_GUIDE.md` | Documentation standards and conventions |
| `TEMPLATES.md` | JSDoc templates for quick reference |
| `README.md` | Project overview and setup |

---

## Development Notes

### Known Issues

1. **Typo in protected route**: `"memeber"` should be `"member"` in `main.jsx`
2. **Inconsistent documentation**: Page components and hooks lack JSDoc
3. **Missing type annotations**: Some functions need complete JSDoc types

### Common Tasks

**Adding a new page:**

1. Create `src/pages/new-page.page.jsx`
2. Export `loader` and/or `action` if data fetching needed
3. Add route to `main.jsx` router configuration
4. Add `ProtectedRoute` wrapper if admin/member-only

**Adding a Redux slice:**

1. Create `src/store/slices/new.slice.js`
2. Define state shape and reducers using `createSlice`
3. Import and add to `store.js`
4. Use `useSelector` and `useDispatch` in components

**Adding a new API endpoint:**

1. Create `src/utils/api/new-api.util.js`
2. Follow existing patterns for fetch calls
3. Document with JSDoc
4. Handle errors with status and message

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2026-03-09 | Updated | Added playlist, logbook, streaming docs |
| 1.0.0 | 2026-03-05 | Initial | Project initialization |
