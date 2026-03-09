# MKC Choir Backend

This is the backend server for the MKC Choir Song Book, built with Node.js, Express, and MongoDB. It provides RESTful APIs for managing songs, albums, playlists, service logbooks, and users in a choir context.

## Tech Stack

-   **Node.js** - Runtime environment
-   **Express.js** - Web framework
-   **MongoDB** - Database
-   **Mongoose** - MongoDB ODM
-   **Passport.js** - Authentication middleware (JWT and Local strategies)
-   **JWT** - JSON Web Tokens for authentication
-   **Joi** - Data validation
-   **Multer** - File upload handling
-   **Nodemailer** - Email notifications
-   **Helmet** - Security headers
-   **Morgan** - HTTP request logging
-   **UUID** - Unique ID generation
-   **bcrypt** - Password hashing
-   **cors** - Cross-origin resource sharing

## Project Structure

```
backend/
├── config/           # Configuration files (db, passport, nodemailer, multer)
├── controllers/      # Route controllers (song, album, user, playlist, logbook)
├── middlewares/      # Custom middleware (auth, validation, file upload)
├── models/           # Database models + validation-schemas/
├── routes/           # API routes
├── utils/            # Utility functions (error classes, OTP, Amharic mapping)
├── uploads/          # File upload directory (images, audio)
├── init-db/          # Database initialization scripts
└── index.js          # Application entry point
```

## API Endpoints

### Authentication (`/api/user`)

-   `POST /login` - Email/password login
    -   Requires: email, password
    -   Returns: JWT token, user object
-   `POST /google/callback` - Google OAuth login
    -   Requires: accessToken (Google OAuth token)
    -   Returns: JWT token, user object
-   `POST /otp` - Request OTP for registration or password reset
    -   Requires: email
    -   Query params: forgotPassword (optional boolean)
-   `POST /verify-otp` - Verify OTP code
    -   Requires: email, otp (6-digit number)
-   `PUT /reset-password` - Reset password with OTP
    -   Requires: email, password, otp

### User Management (`/api/user`)

-   `POST /` - Register a new user with email verification
    -   Requires: email, name, password, otp
-   `GET /current-user` - Get current user profile
    -   Requires: JWT authentication
-   `GET /` - Get all users or search users (admin only)
    -   Requires: JWT authentication, admin/super-admin role
    -   Query params: q (search), page, type (name/email)
-   `PATCH /:id` - Update user role (admin only)
    -   Requires: JWT authentication, admin/super-admin role
    -   Body: role
-   `GET /favorites` - Get user's favorite songs
    -   Requires: JWT authentication
-   `PUT /favorites` - Update user's favorite songs
    -   Requires: JWT authentication
    -   Body: favorites (array), addSongs (array), or removeSongs (array)

### Songs (`/api/song`)

-   `GET /` - Get all songs or search songs
    -   Query params: q (search), page, type (title/lyrics/id), all, sortBy
-   `POST /` - Create new song (admin only)
    -   Requires: JWT authentication, admin/super-admin role
    -   Body: id, title, lyrics, chord, tempo, rythm, albums, video-link (optional)
    -   File: audio-file (optional, via multer)
-   `GET /:id` - Get song by ID
-   `PUT /:id` - Update song (admin only)
    -   Requires: JWT authentication, admin/super-admin role
    -   Body: same as POST
-   `DELETE /:id` - Delete song (admin only)
    -   Requires: JWT authentication, admin/super-admin role
-   `GET /:id/stream` - Stream song audio file
    -   Supports range requests for partial downloads (500KB chunks)

### Albums (`/api/album`)

-   `GET /` - Get all albums or search albums
    -   Query params: q (search), names (return only names), page
-   `POST /` - Create new album (admin only)
    -   Requires: JWT authentication, admin/super-admin role
    -   Body: id, title, songs, createdAt (optional)
    -   File: cover (image file, optional, via multer)
-   `GET /:id` - Get album by ID
-   `PUT /:id` - Update album (admin only)
    -   Requires: JWT authentication, admin/super-admin role
    -   Body: same as POST
-   `DELETE /:id` - Delete album (admin only)
    -   Requires: JWT authentication, admin/super-admin role

### Playlists (`/api/playlist`)

-   `GET /` - Get all playlists or search playlists
    -   Query params: q (search), page, myPlaylists
    -   Authentication: Optional (public access for public playlists)
-   `POST /` - Create new playlist
    -   Requires: JWT authentication
    -   Body: name, songs (optional), visibility (optional: "public", "private", "members")
-   `GET /:id` - Get playlist by ID
    -   Authentication: Optional (access depends on visibility)
-   `PUT /:id` - Update playlist
    -   Requires: JWT authentication (playlist creator only)
    -   Body: name, visibility, songs
-   `PATCH /:id` - Partially update playlist
    -   Requires: JWT authentication (playlist creator only)
    -   Body: visibility (optional), addSongs (optional), removeSongs (optional)
-   `DELETE /:id` - Delete playlist
    -   Requires: JWT authentication (playlist creator only)

### Service Logbook (`/api/logbook`)

-   `GET /` - Get all service logbook entries or search
    -   Requires: JWT authentication, member/admin/super-admin role
    -   Query params: q (search), page, type (location/date)
-   `POST /` - Create new logbook entry (admin only)
    -   Requires: JWT authentication, admin/super-admin role
    -   Body: location, timestamp, songs
-   `PUT /:id` - Update logbook entry (admin only)
    -   Requires: JWT authentication, admin/super-admin role
    -   Body: location, timestamp, songs

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=5000
DB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
SMTP_FROM=your_email@gmail.com

# Client URLs (for CORS)
ALLOWED_ORIGINS=http://localhost:5173,https://your-production-domain.com

# Media Storage
IMAGE_STORAGE=path_to_image_storage
AUDIO_STORAGE=path_to_audio_storage

# Default Admin User (created on first run)
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_NAME=Admin
DEFAULT_ADMIN_PHOTO_LINK=https://example.com/photo.jpg
```

### SMTP Configuration

The application uses SMTP for sending emails (verification, password reset, etc.). For Gmail:

1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `SMTP_PASS`

### Client URLs

Configure allowed origins for CORS:

-   Development: `http://localhost:5173`
-   Production: Your production domain
-   Multiple origins can be comma-separated

## Database Models

### User Model

```javascript
{
  _id: String,                    // Unique user ID
  email: String,                  // Unique, lowercase, validated email
  name: String,                   // User's full name
  password: String,               // Hashed password (optional for OAuth users)
  searchHistory: [ObjectId],      // References to SearchHistory documents
  favorites: [String],            // Array of song IDs
  photo: String,                  // URL to profile photo
  role: String,                   // 'public' | 'member' | 'admin' | 'super-admin'
  createdAt: Date,
  updatedAt: Date
}
```

### Song Model

```javascript
{
  _id: String,                    // Unique song ID
  title: String,                  // Song title (indexed)
  lyrics: String,                 // Song lyrics
  musicElements: {
    chord: String,                // Chord progression (e.g., "C G Am F")
    tempo: Number,                // Tempo in BPM
    rythm: String                 // Rhythm pattern (e.g., "4/4")
  },
  createdAt: String,              // Year added (defaults to current year)
  updatedAt: Date,
  songFilePath: String,           // Path to audio file (optional)
  youtubeLink: String,            // YouTube video link (optional)
  albums: [String]                // Array of album IDs
}
```

### Album Model

```javascript
{
  _id: String,                    // Unique album ID
  name: String,                   // Album name
  createdAt: String,              // Year created (defaults to current year)
  photoPath: String,              // Path to cover image (optional)
  photoLink: String,              // URL to cover image (optional)
  songs: [String]                 // Array of song IDs
}
```

### Playlist Model

```javascript
{
  _id: String,                    // Unique playlist ID
  name: String,                   // Playlist name (indexed)
  visibility: String,             // 'private' | 'members' | 'public'
  createdAt: Date,
  updatedAt: Date,
  creator: ObjectId,              // Reference to User
  songs: [String]                 // Array of song IDs
}
```

### Service Logbook Model

```javascript
{
  _id: String,                    // Unique log entry ID
  churchName: String,             // Church/service name
  serviceDate: Date,              // Date of service
  songList: [String],             // Array of song IDs performed
  cancelled: Boolean,             // Whether service was cancelled
  createdAt: Date,
  updatedAt: Date
}
```

### OTP Model

```javascript
{
  email: String,                  // User's email
  otp: Number,                    // 6-digit verification code
  createdAt: Date                 // Expiration time
}
```

### Search History Model

```javascript
{
  user: ObjectId,                 // Reference to User
  query: String,                  // Search query
  createdAt: Date
}
```

## Authentication Flow

1. **Email/Password Login**
    - User submits credentials
    - Server validates and returns JWT
    - Frontend stores JWT in localStorage

2. **Google OAuth**
    - User clicks Google login
    - Frontend gets access token from Google
    - Backend verifies token and creates/updates user
    - Backend returns JWT

3. **OTP-based Registration**
    - User requests OTP via email
    - User verifies OTP
    - User registers with email, name, password, and OTP

## Error Handling

The application uses a centralized error handling system with custom error classes:

-   `ClientFaultError` - 400 Bad Request (invalid user input)
-   `UnauthorizedError` - 401 Unauthorized (authentication required)
-   `ForbiddenError` - 403 Forbidden (insufficient permissions)
-   `NotFoundError` - 404 Not Found (resource doesn't exist)
-   `ServerFaultError` - 500 Internal Server Error (server-side issues)

Global error handler in `index.js`:
-   Catches all errors from middleware and route handlers
-   Performs cleanup (deletes uploaded files on error)
-   Logs internal errors while sending safe messages to clients
-   Handles Multer file upload errors

## Documentation Style Guide

This project follows a consistent documentation style using JSDoc comments to ensure:

### Function Documentation

All exported functions must have comprehensive JSDoc documentation including:
- Brief description of the function purpose
- Parameter documentation with types and descriptions
- Return value documentation
- Error handling documentation
- Usage examples where appropriate

### Style Guide Reference

For detailed documentation standards, please refer to:
- `STYLE_GUIDE.md` - Comprehensive style guide for all JSDoc comments
- `TEMPLATES.md` - Documentation templates for consistent formatting

### Controller Function Pattern

```javascript
/**
 * [Brief description of function purpose]
 *
 * @param {Object} req - Express request object
 * @param {string} req.body.[parameter] - Description of parameter
 * @param {string} [req.query.[optional]] - Optional parameter description
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Description of what is returned
 * @throws {NotFoundError} Description of when NotFoundError occurs
 * @throws {ServerFaultError} Description of when ServerFaultError occurs
 * @throws {ClientFaultError} Description of when ClientFaultError occurs
 * @example
 * // Example usage:
 * POST /api/song
 * {
 *   "id": "song-123",
 *   "title": "Amazing Grace",
 *   "lyrics": "Amazing grace...",
 *   "albums": ["album-456"]
 * }
 */
```

### Model Documentation Pattern

For Mongoose schemas, documentation includes:
- Model name and description
- Schema property definitions with types and descriptions
- Optional properties with descriptions
- Relationship references

### Route Documentation Pattern

API route modules should include:
- Module description
- Description of the functionality handled
- Route parameter documentation
- Example requests and responses

## Installation

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
# Production
node index.js

# Development (with nodemon)
npm run dev
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request
