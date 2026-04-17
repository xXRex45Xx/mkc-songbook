# MKC Choir Song Book - Project Context

## Project Overview

**MKC Songbook** is a full-stack web application for managing choir songs, lyrics, albums, playlists, and service logbooks. Built with the **MERN stack** (MongoDB, Express, React, Node.js) and Vite, it serves both choir members and public users with role-based access control.

### Core Features

| Feature | Description |
|---------|-------------|
| **Song Management** | Create, edit, search, and organize songs with lyrics, chords, and audio files |
| **Album Management** | Group songs into albums with cover images |
| **Playlists** | Custom playlist creation with visibility controls (private/members/public) |
| **Service Logbook** | Record and track choir service performances by date and location |
| **Authentication** | Email/password with OTP verification and Google OAuth with JWT sessions |
| **User Roles** | Public, Member, Admin, Super-Admin access levels |
| **Media Upload** | Audio and image file handling with Multer |
| **Audio Streaming** | Range-request supported audio streaming for efficient playback |

### Tech Stack

**Frontend**
- React 18 with Vite 5.4
- Redux Toolkit 2.2 (state management)
- React Router DOM 6.26 (routing)
- Flowbite React 0.10 (UI components)
- Tailwind CSS 3.4 (styling)
- @react-oauth/google (Google authentication)
- @dnd-kit/core (drag-and-drop)
- React Loader Spinner 6.1 (loading states)

**Backend**
- Node.js with Express 4.19
- MongoDB with Mongoose 8.5
- Passport.js (JWT and Local strategies)
- Joi (validation)
- Multer (file uploads)
- Nodemailer (email notifications)
- Helmet (security headers)
- Morgan (request logging)
- bcrypt (password hashing)
- UUID (unique ID generation)
- cors (CORS handling)

---

## Project Structure

```
mkc-songbook/
├── backend/                 # Node.js/Express API server
│   ├── config/             # DB, Multer, Nodemailer, Passport configs
│   ├── controllers/        # Route handlers (song, album, user, playlist, logbook)
│   ├── middlewares/        # Auth, validation, file upload, error handlers
│   ├── models/             # Mongoose schemas + validation-schemas/
│   ├── routes/             # Express routers
│   ├── utils/              # Helper functions, custom errors, OTP generation
│   ├── uploads/            # File storage (images, audio)
│   ├── init-db/            # Database initialization scripts
│   ├── index.js            # Application entry point
│   ├── package.json
│   ├── STYLE_GUIDE.md      # JSDoc documentation standards
│   └── TEMPLATES.md        # Documentation templates
│
└── frontend/               # React SPA
    ├── src/
    │   ├── components/     # Reusable UI components (*.component.jsx)
    │   ├── pages/          # Route-level components (*.page.jsx)
    │   ├── store/          # Redux slices (user, configs, playlist) and store config
    │   ├── utils/          # API clients and utilities
    │   ├── hooks/          # Custom React hooks
    │   ├── config/         # Theme and environment configs
    │   ├── assets/         # Static files (images, icons, SVGs)
    │   ├── App.jsx         # Root layout component
    │   ├── App.css         # Application styles
    │   ├── main.jsx        # Router and provider setup
    │   └── index.css       # Global styles
    ├── public/             # Static assets
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── STYLE_GUIDE.md      # Frontend documentation standards
    └── TEMPLATES.md        # Component documentation templates
```

---

## Building and Running

### Prerequisites

- Node.js 18+
- MongoDB (local or cloud instance)
- Google OAuth credentials

### Environment Setup

**Backend `.env`** (in `backend/` directory):
```env
# Server Configuration
PORT=5000
DB_URI=mongodb://localhost:27017/mkc-songbook
JWT_SECRET=your_jwt_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# SMTP Configuration (for email verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
SMTP_FROM=your_email@gmail.com

# CORS
ALLOWED_ORIGINS=http://localhost:5173

# File Storage
IMAGE_STORAGE=./uploads/images
AUDIO_STORAGE=./uploads/audio

# Default Admin (created on first run)
DEFAULT_ADMIN_EMAIL=admin@mkc.com
DEFAULT_ADMIN_NAME=Admin
DEFAULT_ADMIN_PHOTO_LINK=https://example.com/photo.jpg
```

**Frontend `.env`** (in `frontend/` directory):
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Installation

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running in Development

```bash
# Terminal 1: Start backend (port 5000)
cd backend
npm run dev

# Terminal 2: Start frontend (port 5173)
cd frontend
npm run dev
```

### Production Build

```bash
# Build frontend
cd frontend
npm run build
npm run preview  # Preview production build

# Start backend in production
cd backend
NODE_ENV=production npm start
```

---

## API Endpoints

### Authentication (`/api/user`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/login` | Email/password login | No |
| POST | `/google/callback` | Google OAuth login | No |
| POST | `/otp` | Request OTP for registration/reset | No |
| POST | `/verify-otp` | Verify OTP code | No |
| PUT | `/reset-password` | Reset password with OTP | No |
| POST | `/` | Register new user | No |
| GET | `/current-user` | Get current user profile | Yes |
| GET | `/` | Get all/search users | Admin |
| PATCH | `/:id` | Update user role | Admin |
| GET | `/favorites` | Get user's favorite songs | Yes |
| PUT | `/favorites` | Update user's favorites | Yes |

### Songs (`/api/song`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get/search songs (query: q, page, type, sortBy, all) | No |
| POST | `/` | Create new song | Admin |
| GET | `/:id` | Get song by ID | No |
| PUT | `/:id` | Update song | Admin |
| DELETE | `/:id` | Delete song | Admin |
| GET | `/:id/stream` | Stream song audio (range requests) | No |

### Albums (`/api/album`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get/search albums (query: q, names, page) | No |
| POST | `/` | Create new album | Admin |
| GET | `/:id` | Get album by ID | No |
| PUT | `/:id` | Update album | Admin |
| DELETE | `/:id` | Delete album | Admin |

### Playlists (`/api/playlist`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get/search playlists (query: q, page, myPlaylists) | No* |
| POST | `/` | Create playlist | Yes |
| GET | `/:id` | Get playlist by ID | No* |
| PUT | `/:id` | Update playlist (creator only) | Yes |
| PATCH | `/:id` | Partial update (add/remove songs) | Yes |
| DELETE | `/:id` | Delete playlist (creator only) | Yes |

*Public playlists accessible without auth

### Service Logbook (`/api/logbook`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get/search service records (query: q, page, type) | Member+ |
| POST | `/` | Create service record | Admin |
| PUT | `/:id` | Update service record | Admin |

---

## Development Conventions

### File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Frontend Components | `*.component.jsx` | `song-card.component.jsx` |
| Frontend Pages | `*.page.jsx` | `songs.page.jsx` |
| Redux Slices | `*.slice.js` | `user.slice.js` |
| API Utils | `*-api.util.js` | `song-api.util.js` |
| Hooks | `*.hook.js` | `useWindowSize.hook.js` |
| Configs | `*.config.js` | `button-theme.config.js` |
| Backend Models | `*.model.js` | `song.model.js` |
| Backend Routes | `*.route.js` | `song.route.js` |
| Backend Controllers | `*.controller.js` | `song.controller.js` |

### Documentation Standards

This project uses **JSDoc** for all public APIs:

**Function Documentation:**
```javascript
/**
 * Brief description of function purpose
 *
 * @param {Object} req - Express request object
 * @param {string} req.body.name - Parameter description (required, constraints)
 * @param {string} [req.body.optional] - Optional parameter description
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Description of return value
 * @throws {NotFoundError} When resource not found
 * @throws {ClientFaultError} When validation fails
 * @throws {ServerFaultError} When server error occurs
 * @example
 * // Example usage:
 * POST /api/song
 * { "title": "Amazing Grace", "lyrics": "..." }
 */
```

**Component Documentation:**
```javascript
/**
 * Component Name
 * Purpose and key features
 *
 * @component
 * @param {Object} props - Component props
 * @param {Song} props.song - Song object to display
 * @param {boolean} [props.showPlayButton=true] - Show play button
 * @param {Function} [props.onPlay] - Play callback
 * @returns {JSX.Element} Rendered component
 */
```

**See:** `backend/STYLE_GUIDE.md` and `frontend/STYLE_GUIDE.md` for comprehensive standards.

### Redux Patterns

```javascript
// Slice definition (src/store/slices/user.slice.js)
export const userSlice = createSlice({
  name: 'user',
  initialState: { currentUser: null, adminType: null },
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

### React Router Pattern (v6)

```javascript
// Page with data loading
export const loader = async ({ params }) => {
  const song = await getSongById(params.id);
  return { song };
};

export const action = async ({ request }) => {
  const formData = await request.formData();
  await createSong(formData);
  return redirect('/songs');
};

const SongPage = () => {
  const { song } = useLoaderData();
  // ...
};
```

### Error Handling

**Backend:** Custom error classes with centralized handler
```javascript
// Custom errors thrown in controllers
throw new ClientFaultError('Invalid song title');
throw new NotFoundError('Song not found');

// Global error handler in index.js sends safe messages
```

**Frontend:** API utilities throw structured errors
```javascript
if (!response.ok) {
  throw { message: data.message, status: response.status };
}
```

### Styling

- **Tailwind CSS** for utility-first styling
- **Flowbite React** for pre-built components
- **Custom colors** in `tailwind.config.js`: primary, secondary, success, warning, error

---

## Database Models

### User
```javascript
{
  _id: String,                    // Unique user ID
  email: String (unique, required, lowercase, validated),
  name: String (required, trimmed),
  password: String (hashed, optional for OAuth),
  searchHistory: [ObjectId],      // References SearchHistory
  favorites: [String],            // Song IDs
  photo: String (URL),
  role: 'public' | 'member' | 'admin' | 'super-admin',
  createdAt: Date,
  updatedAt: Date
}
```

### Song
```javascript
{
  _id: String,                    // Unique song ID
  title: String (required, indexed, trimmed),
  lyrics: String (required, trimmed),
  musicElements: {
    chord: String,                // Chord progression
    tempo: Number,                // BPM
    rythm: String                 // Rhythm pattern
  },
  createdAt: String,              // Year added (defaults to current year)
  updatedAt: Date,
  songFilePath: String,           // Path to audio file
  youtubeLink: String,            // YouTube video URL
  albums: [String]                // Album IDs
}
```

### Album
```javascript
{
  _id: String,                    // Unique album ID
  name: String (required),
  createdAt: String,              // Year created
  photoPath: String,              // Path to cover image
  photoLink: String,              // URL to cover image
  songs: [String]                 // Song IDs
}
```

### Playlist
```javascript
{
  _id: String,                    // Unique playlist ID
  name: String (required, indexed),
  visibility: 'private' | 'members' | 'public',
  createdAt: Date,
  updatedAt: Date,
  creator: ObjectId,              // Reference to User
  songs: [String]                 // Song IDs
}
```

### Service Logbook
```javascript
{
  _id: String,                    // Unique log entry ID
  churchName: String (required),  // Church/service name
  serviceDate: Date (required),
  songList: [String],             // Song IDs performed
  cancelled: Boolean,             // Cancellation flag
  createdAt: Date,
  updatedAt: Date
}
```

### OTP
```javascript
{
  email: String (required),
  otp: Number (6-digit),
  createdAt: Date                 // Expiration time
}
```

### SearchHistory
```javascript
{
  user: ObjectId,                 // Reference to User
  query: String,
  createdAt: Date
}
```

---

## User Roles

| Role | Permissions |
|------|-------------|
| **public** | View public songs, albums, and playlists |
| **member** | + Create playlists, view logbook, create service records |
| **admin** | + Create/edit/delete songs, albums, manage users |
| **super-admin** | Full access including admin role management |

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `backend/index.js` | Express server setup, middleware, error handling |
| `backend/config/db.js` | MongoDB connection |
| `backend/config/passport.config.js` | JWT and Local strategy setup |
| `backend/config/nodemailer.config.js` | Email transport configuration |
| `backend/routes/index.js` | API router aggregation |
| `frontend/src/main.jsx` | Router config, Redux provider, route definitions |
| `frontend/src/App.jsx` | Root layout with Header, AudioPlayer, Outlet |
| `frontend/src/store/store.js` | Redux store configuration (user, configs, playlist slices) |

---

## Common Tasks

### Adding a New API Endpoint

1. Create model in `backend/models/` (if needed)
2. Create controller in `backend/controllers/`
3. Create router in `backend/routes/`
4. Import and mount router in `backend/routes/index.js`
5. Create API utility in `frontend/src/utils/api/`

### Adding a New Page

1. Create page component in `frontend/src/pages/` (use `.page.jsx` extension)
2. Export `loader` and/or `action` for data fetching
3. Add route to `frontend/src/main.jsx` router configuration
4. Wrap with `<ProtectedRoute>` if admin/member-only

### Adding a Redux Slice

1. Create slice in `frontend/src/store/slices/`
2. Define state shape and reducers using `createSlice`
3. Import and add reducer to `frontend/src/store/store.js`
4. Use `useSelector` and `useDispatch` in components

---

## Known Issues

1. **Typo in protected route**: `"memeber"` should be `"member"` in `frontend/src/main.jsx`
2. **Inconsistent documentation**: Page components and hooks lack JSDoc coverage
3. **Missing type annotations**: Some functions need complete JSDoc types

---

## Quick Commands

```bash
# Backend
cd backend
npm run dev      # Start with nodemon
npm start        # Start production

# Frontend
cd frontend
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint check
npm run preview  # Preview production build
```

---

## Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview and setup guide |
| `backend/README.md` | Backend API documentation |
| `backend/STYLE_GUIDE.md` | Backend JSDoc standards |
| `backend/TEMPLATES.md` | Backend documentation templates |
| `frontend/README.md` | Frontend application documentation |
| `frontend/STYLE_GUIDE.md` | Frontend documentation standards |
| `frontend/TEMPLATES.md` | Frontend documentation templates |

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-03-09 | Updated with playlist, logbook, and streaming features |
| 1.0.0 | 2026-03-09 | Initial project context documentation |
