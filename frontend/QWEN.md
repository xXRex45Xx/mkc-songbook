# MKC Songbook Frontend - Project Context

## Project Overview

This is a **React-based single-page application** for the MKC Choir Song Book platform. The application provides a web interface for managing and streaming gospel songs, albums, and playlists for a choir community.

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

### Architecture

The application follows a **modular architecture** with clear separation of concerns:

- **Pages**: Route-level components (e.g., `SongsPage`, `AuthPage`)
- **Components**: Reusable UI elements (e.g., `SongCard`, `LoginForm`)
- **Store**: Redux slices for state management (`user`, `configs`, `playlist`)
- **Utils**: API clients and utility functions
- **Config**: Theme and environment configurations

### Key Features

1. **Authentication**: Email/password login, Google OAuth, JWT-based sessions
2. **Song Management**: Upload, edit, search, and organize songs
3. **Album Management**: Create and manage music albums
4. **Playlists**: Custom playlist creation and management
5. **Schedule**: Choir schedule/logbook management (admin features)
6. **User Management**: Admin panel for user roles and permissions

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
│   └── *.styles.css     # Component-specific styles
├── pages/               # Page-level components
│   └── *.page.jsx       # Page files use .page.jsx extension
├── store/
│   ├── slices/          # Redux slice definitions
│   └── store.js         # Main store configuration
├── utils/
│   ├── api/             # API client functions
│   └── *.util.js        # Utility functions
├── config/              # Configuration files
├── hooks/               # Custom React hooks
└── assets/              # Static assets (images, icons)
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

The app uses **React Router v6** with **loader/actions** pattern (similar to Remix):

```javascript
// Page exports loader and action for data fetching
export const loader = async ({ request }) => {
  const data = await api.fetch();
  return data;
};

export const action = async ({ request }) => {
  const result = await api.submit(formData);
  return redirect('/success');
};
```

### Redux Patterns

- **Slices**: Use `createSlice` from Redux Toolkit
- **State Structure**: Flat state with top-level slices (`user`, `configs`, `playlist`)
- **Selectors**: Use `useSelector` with inline state access
- **Actions**: Export action creators via `slice.actions`

### API Integration

All API calls go through utility functions in `src/utils/api/`:

```javascript
// Example: user-api.util.js
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

### State Management Pattern

```javascript
const user = useSelector((state) => state.user.currentUser);
const queue = useSelector((state) => state.playlist.queue);
```

---

## Project Structure

### Main Entry Point

`src/main.jsx` - Initializes:
- React Router with route definitions
- Redux store provider
- All page routes with loaders/actions

### Application Root

`src/App.jsx` - Main layout component:
- Auth state handling via loader
- Outlet for child routes
- Conditional rendering of Header and AudioPlayer

### Key Pages

| Page | Purpose | Protected |
|------|---------|-----------|
| `HomePage` | Redirects to songs | No |
| `SongsPage` | Browse/search songs | No |
| `LyricsPage` | View song lyrics | No |
| `Auth` | Login/signup flow | No |
| `UploadSongPage` | Add new songs | Admin only |
| `EditSongPage` | Edit existing songs | Admin only |
| `UsersPage` | User management | Admin only |
| `SchedulePage` | Choir schedule | Member+ |

### Protected Routes

Protected routes use the `ProtectedRoute` component:

```jsx
<ProtectedRoute roles={["admin", "super-admin"]}>
  <AdminOnlyPage />
</ProtectedRoute>
```

### Roles

- **public**: Unauthenticated users
- **member**: Registered users
- **admin**: Administrative access
- **super-admin**: Full administrative access

---

## Development Notes

### Known Issues

1. **Typo in protected route**: `"memeber"` should be `"member"` in `main.jsx`
2. **Inconsistent documentation**: Page components lack JSDoc
3. **Missing type annotations**: Some functions lack JSDoc types

### Common Tasks

**Adding a new page:**

1. Create `src/pages/new-page.page.jsx`
2. Export `loader` and/or `action` if data fetching needed
3. Add route to `main.jsx` router configuration
4. Add `ProtectedRoute` if admin-only

**Adding a new Redux slice:**

1. Create `src/store/slices/new.slice.js`
2. Define state shape and reducers
3. Import and add to `store.js`
4. Use `useSelector` and `useDispatch` in components

**Adding a new API endpoint:**

1. Create `src/utils/api/new-api.util.js`
2. Follow existing patterns for fetch calls
3. Document with JSDoc

---

## Dependencies

### Production

- `react` & `react-dom`: UI framework
- `react-router-dom`: Client-side routing
- `@reduxjs/toolkit` & `react-redux`: State management
- `flowbite-react`: UI component library
- `@react-oauth/google`: Google OAuth integration
- `react-loader-spinner`: Loading animations

### Development

- `vite`: Build tool and dev server
- `tailwindcss`: Utility-first CSS framework
- `@vitejs/plugin-react`: React plugin for Vite
- `eslint`: Code linting
- `vite-plugin-svgr`: SVG as React components

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
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run ESLint
```

### File Locations

| Need | Location |
|------|----------|
| Add new page | `src/pages/new-page.page.jsx` |
| Add new component | `src/components/new-component.component.jsx` |
| Add Redux slice | `src/store/slices/new.slice.js` |
| Add API utility | `src/utils/api/new-api.util.js` |
| Update theme | `tailwind.config.js` |

### Documentation Files

| File | Purpose |
|------|---------|
| `STYLE_GUIDE.md` | Documentation standards and conventions |
| `TEMPLATES.md` | JSDoc templates for quick reference |
| `README.md` | Project overview and setup |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-03-05 | Initial | Project initialization |
