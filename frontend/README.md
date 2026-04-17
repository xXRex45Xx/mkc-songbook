# MKC Choir Frontend

This is the frontend application for the MKC Choir Song Book, built with React and modern web technologies.

## Tech Stack

-   **React 18** - UI framework
-   **Vite** - Build tool and dev server
-   **React Router DOM** - Client-side routing
-   **Redux Toolkit** - State management
-   **Flowbite React** - UI components
-   **Tailwind CSS** - Styling
-   **@react-oauth/google** - Google OAuth integration
-   **React Loader Spinner** - Loading states
-   **@dnd-kit/core** - Drag and drop functionality

## Project Structure

```
frontend/
├── src/
│   ├── assets/         # Static assets (images, icons, SVGs)
│   ├── components/     # Reusable React components
│   ├── config/         # Configuration files
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components (routes)
│   ├── store/          # Redux store and slices
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main application component
│   ├── App.css         # Application styles
│   ├── main.jsx        # Application entry point
│   └── index.css       # Global styles
├── public/             # Public static files
└── package.json        # Project dependencies
```

## Key Features

### Authentication

-   Email/Password login with OTP verification
-   Google OAuth integration
-   JWT token-based authentication
-   Protected routes for authenticated users
-   Password reset functionality
-   Email verification

### Song Management

-   Browse and search songs
-   View song lyrics with chord notation
-   Audio playback with streaming support
-   YouTube video integration
-   Add/edit/delete songs (admin only)
-   Filter by album, tempo, rhythm

### Album Management

-   Browse and search albums
-   View album details with song lists
-   Upload album cover images
-   Create/edit/delete albums (admin only)

### Playlist Management

-   Create and manage playlists
-   Public, private, and members-only visibility
-   Add/remove songs from playlists
-   Drag-and-drop song ordering

### Service Logbook

-   Record choir service history
-   Track songs performed at services
-   Search and filter service logs

### User Management

-   User registration with email verification
-   Profile management
-   Favorite songs management
-   Admin user management (admin only)

## Pages

### Public Pages

-   **Home** (`/`) - Landing page with featured content
-   **Songs** (`/songs`) - Browse and search songs
-   **Song Lyrics** (`/lyrics/:id`) - View song lyrics and chords
-   **Albums** (`/albums`) - Browse albums
-   **Album** (`/album/:id`) - View album details
-   **Playlist** (`/playlist/:id`) - View playlist details
-   **Playlists** (`/playlists`) - Browse public playlists
-   **Authentication** (`/auth`) - Login/signup page

### Protected Pages

-   **Upload Song** (`/upload-song`) - Add new song (admin only)
-   **Edit Song** (`/edit-song/:id`) - Edit existing song (admin only)
-   **Upload Album** (`/upload-album`) - Create new album (admin only)
-   **Edit Album** (`/edit-album/:id`) - Edit existing album (admin only)
-   **New Playlist** (`/new-playlist`) - Create new playlist
-   **Edit Playlist** (`/edit-playlist/:id`) - Edit playlist
-   **Schedule** (`/schedule`) - Service scheduling
-   **New Schedule** (`/new-schedule`) - Create service log entry (admin only)
-   **Users** (`/users`) - User management (admin only)

### Utility Pages

-   **Error** (`/error`) - Error page for 404 and other errors

## Environment Variables

Create a `.env` file in the frontend directory with the following variables:

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

4. Preview production build:

```bash
npm run preview
```

5. Run linter:

```bash
npm run lint
```

## API Integration

The frontend communicates with the backend through RESTful APIs. Key API endpoints include:

### Authentication

-   `POST /api/user/login` - Email/password login
-   `POST /api/user/google/callback` - Google OAuth login
-   `POST /api/user/otp` - Request OTP
-   `POST /api/user/verify-otp` - Verify OTP
-   `POST /api/user` - Register user
-   `PUT /api/user/reset-password` - Reset password

### User Management

-   `GET /api/user/current-user` - Get current user profile
-   `GET /api/user/favorites` - Get user's favorite songs
-   `PUT /api/user/favorites` - Update favorites

### Songs

-   `GET /api/song` - Get all/search songs
-   `GET /api/song/:id` - Get song by ID
-   `GET /api/song/:id/stream` - Stream song audio
-   `POST /api/song` - Create song (admin)
-   `PUT /api/song/:id` - Update song (admin)
-   `DELETE /api/song/:id` - Delete song (admin)

### Albums

-   `GET /api/album` - Get all/search albums
-   `GET /api/album/:id` - Get album by ID
-   `POST /api/album` - Create album (admin)
-   `PUT /api/album/:id` - Update album (admin)
-   `DELETE /api/album/:id` - Delete album (admin)

### Playlists

-   `GET /api/playlist` - Get all/search playlists
-   `GET /api/playlist/:id` - Get playlist by ID
-   `POST /api/playlist` - Create playlist
-   `PUT /api/playlist/:id` - Update playlist
-   `PATCH /api/playlist/:id` - Partial update playlist
-   `DELETE /api/playlist/:id` - Delete playlist

### Service Logbook

-   `GET /api/logbook` - Get service logs
-   `POST /api/logbook` - Create log entry (admin)
-   `PUT /api/logbook/:id` - Update log entry (admin)

## State Management

The application uses Redux Toolkit for state management with the following slices:

### `userSlice`

Manages user authentication state:
-   User profile information
-   Authentication token
-   Login/logout status
-   User favorites

### `configsSlice`

Manages app-wide configuration settings:
-   Font size preferences
-   Window dimensions
-   UI theme settings

### `playlistSlice`

Manages song queue and playback state:
-   Current playlist
-   Playing song
-   Playback controls
-   Queue management

## Component Structure

### Layout Components

-   `header.component.jsx` - Main navigation header
-   `main-body-container.component.jsx` - Main content wrapper
-   `auth-main-container.component.jsx` - Authentication page wrapper
-   `protected-route.component.jsx` - Route protection wrapper

### UI Components

-   `custom-table.component.jsx` - Reusable table component
-   `custom-row.component.jsx` - Table row component
-   `custom-slider.component.jsx` - Slider/carousel component
-   `custom-tail-spin.component.jsx` - Loading spinner
-   `search-bar.component.jsx` - Search input component
-   `sort-dropdown.component.jsx` - Sort options dropdown

### Feature Components

-   `song-form.component.jsx` - Song creation/editing form
-   `album-form.component.jsx` - Album creation/editing form
-   `playlist-form.component.jsx` - Playlist creation/editing form
-   `login-form.component.jsx` - Login form
-   `sign-up-form.component.jsx` - Registration form
-   `forgot-password-form.component.jsx` - Password reset request form
-   `create-password-form.component.jsx` - Password creation form
-   `verify-email-form.component.jsx` - Email verification form

### Media Components

-   `audio-player.component.jsx` - Audio player with controls
-   `audio-player-toolbox.component.jsx` - Audio player controls
-   `audio-controls.component.jsx` - Playback controls
-   `lyric-viewer.component.jsx` - Lyrics display component
-   `album-viewer.component.jsx` - Album display component
-   `playlist-viewer.component.jsx` - Playlist display component

### Card Components

-   `song-card.component.jsx` - Song display card
-   `album-card.component.jsx` - Album display card
-   `horizontal-album-card.component.jsx` - Horizontal album card
-   `playlist-card.component.jsx` - Playlist card
-   `horizontal-playlist-card.component.jsx` - Horizontal playlist card

## Styling

The application uses Tailwind CSS for styling with Flowbite React components:

-   **Tailwind CSS** - Utility-first CSS framework
-   **Flowbite React** - Pre-built React components
-   **Custom CSS** - Application-specific styles in `App.css` and `index.css`

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request
