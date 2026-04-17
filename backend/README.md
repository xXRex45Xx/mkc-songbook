# MKC Choir Backend

This is the backend server for the MKC Choir Song Book, built with Node.js, Express, and MongoDB.

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **Passport.js** - Authentication middleware (JWT and Local strategies)
- **JWT** - JSON Web Tokens for authentication
- **Joi** - Data validation
- **Multer** - File upload handling
- **Nodemailer** - Email notifications
- **Helmet** - Security headers
- **Morgan** - HTTP request logging
- **UUID** - Unique ID generation
- **bcrypt** - Password hashing
- **cors** - Cross-origin resource sharing
- **compression** - Gzip compression for eligible responses

## Project Structure

```
backend/
├── config/           # Configuration files (database, passport, nodemailer, multer)
├── controllers/      # Route controllers
├── middlewares/      # Custom middleware (auth, validation, file upload)
├── models/           # Database models and validation schemas
├── routes/           # API routes
├── utils/            # Utility functions
├── jest/             # Test config, helpers, fixtures, factories, mocks
├── __tests__/        # Automated test suites
├── uploads/          # File upload directory
├── init-db/          # Database initialization scripts
├── index.js          # Express app and server bootstrap
└── TESTING.md        # Testing guide
```

## API Endpoints

### Authentication

- `POST /api/user/login` - Email/password login
  - Requires: `email`, `password`
- `POST /api/user/google/callback` - Google OAuth login
  - Requires: Google access token
- `POST /api/user/otp` - Request OTP for registration or password reset
  - Requires: `email`
  - Query params: `forgotPassword` (optional boolean)
- `POST /api/user/verify-otp` - Verify OTP code
  - Requires: `email`, `otp`
- `PUT /api/user/reset-password` - Reset password with OTP
  - Requires: `email`, `password`, `otp`

### User Management

- `POST /api/user` - Register a new user with email verification
  - Requires: `email`, `name`, `password`, `otp`
- `GET /api/user/current-user` - Get current user profile
  - Requires: JWT authentication
- `GET /api/user` - Get all users or search users (admin only)
  - Requires: JWT authentication, admin/super-admin role
  - Query params: `q`, `page`, `type` (`all`, `name`, `email`)
- `PATCH /api/user/:id` - Update user role (admin only)
  - Requires: JWT authentication, admin/super-admin role
  - Body: `role`
- `GET /api/user/favorites` - Get the current user's favorites playlist
  - Requires: JWT authentication
- `PATCH /api/user/update-favorites` - Update the current user's favorites
  - Requires: JWT authentication
  - Body: `favorites` (replace all), or `addSongs` / `removeSongs`

### Songs

- `GET /api/song` - Get all songs or search songs
  - Query params: `q`, `page`, `type` (`all`, `title`, `lyrics`, `id`), `all`, `sortBy`
  - `type=all` returns grouped title and lyrics matches; `all=true` returns the full song list without pagination metadata
- `POST /api/song` - Create new song (admin only)
  - Requires: JWT authentication, admin/super-admin role
  - Body: `id`, `title`, `lyrics`, `chord`, `tempo`, `rythm`, `albums`, `video-link` (optional)
  - File: `audio-file` (optional)
- `GET /api/song/:id` - Get song by ID
- `PUT /api/song/:id` - Update song (admin only)
  - Requires: JWT authentication, admin/super-admin role
  - Body: same as POST
- `PATCH /api/song/:id` - Partially update a song (admin only)
  - Requires: JWT authentication, admin/super-admin role
  - Body: `video-link` (optional)
  - File: `audio-file` (optional)
- `DELETE /api/song/:id` - Delete song (admin only)
  - Requires: JWT authentication, admin/super-admin role
- `GET /api/song/:id/audio` - Stream song audio file
  - Supports range requests for partial playback/downloads

### Albums

- `GET /api/album` - Get all albums or search albums
  - Query params: `q`, `names`
- `POST /api/album` - Create new album (admin only)
  - Requires: JWT authentication, admin/super-admin role
  - Body: `id`, `title`, `songs`, `createdAt` (optional)
  - File: `cover` (optional image upload)
- `GET /api/album/:id` - Get album by ID
- `PUT /api/album/:id` - Update album (admin only)
  - Requires: JWT authentication, admin/super-admin role
  - Body: same as POST
- `DELETE /api/album/:id` - Delete album (admin only)
  - Requires: JWT authentication, admin/super-admin role

### Playlists

- `GET /api/playlist` - Get all playlists or search playlists
  - Query params: `q`, `page`, `myPlaylists`
  - Authentication: optional; visibility rules still apply
- `POST /api/playlist` - Create new playlist
  - Requires: JWT authentication
  - Body: `name`, `songs`, `visibility` (`public`, `private`, `members`)
- `GET /api/playlist/:id` - Get playlist by ID
  - Authentication: optional; access depends on visibility and ownership
- `PUT /api/playlist/:id` - Update playlist
  - Requires: JWT authentication (playlist creator only)
  - Body: `name`, `visibility`, `songs`
- `PATCH /api/playlist/:id` - Partially update playlist
  - Requires: JWT authentication (playlist creator only)
  - Body: `visibility`, `addSongs`, `removeSongs`
- `DELETE /api/playlist/:id` - Delete playlist
  - Requires: JWT authentication (playlist creator only)

### Service Logbook

- `GET /api/logbook` - Get all service logbook entries or search
  - Requires: JWT authentication, member/admin/super-admin role
  - Query params: `q`, `page`, `type` (`location`, `date`)
- `POST /api/logbook` - Create new logbook entry (admin only)
  - Requires: JWT authentication, admin/super-admin role
  - Body: `location`, `timestamp`, `songs`

Note: the service logbook request body uses `location` and `timestamp`, while the persisted MongoDB model stores related values as `churchName`, `serviceDate`, and `songList`.

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

# Default Admin User
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_NAME=Admin
DEFAULT_ADMIN_PHOTO_LINK=https://example.com/photo.jpg
```

### SMTP Configuration

The application uses SMTP for sending emails such as verification and password reset emails. For Gmail:

1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `SMTP_PASS`

### Client URLs

Configure allowed origins for CORS:

- Development: `http://localhost:5173`
- Production: your deployed frontend origin
- Multiple origins can be comma-separated

## Response Compression

- The Express app uses the `compression` middleware for compressible text and JSON responses.
- Compression is applied before static and API handlers so regular API responses can be gzipped when clients send `Accept-Encoding` headers.
- The audio streaming endpoint at `GET /api/song/:id/audio` is excluded from compression because it serves ranged byte responses for playback.
- Frontend asset compression is handled by the separate static host, such as Cloudflare Pages, rather than this backend.

## Database Models

### User Model

```javascript
{
  email: String,                  // Unique, lowercase, validated email
  name: String,                   // User's full name
  password: String,               // Hashed password (optional for OAuth users)
  searchHistory: [ObjectId],      // References to SearchHistory entries
  favorites: [String],            // Array of song IDs
  photo: String,                  // URL to profile photo
  role: String                    // 'public' | 'member' | 'admin' | 'super-admin'
}
```

### Song Model

```javascript
{
  _id: String,                    // Unique song ID
  title: String,                  // Song title
  lyrics: String,                 // Song lyrics
  musicElements: {
    chord: String,
    tempo: Number,
    rythm: String
  },
  createdAt: String,              // Year added
  updatedAt: Date,
  songFilePath: String,           // Stored audio file path (optional)
  youtubeLink: String,            // YouTube video link (optional)
  albums: [String]                // Album IDs
}
```

### Album Model

```javascript
{
  _id: String,                    // Unique album ID
  name: String,                   // Album name
  createdAt: String,              // Year created
  photoPath: String,              // Stored cover file path (optional)
  photoLink: String,              // Public cover URL (optional)
  songs: [String]                 // Song IDs
}
```

### Playlist Model

```javascript
{
  name: String,                   // Playlist name
  visibility: String,             // 'private' | 'members' | 'public'
  createdAt: Date,
  updatedAt: Date,
  creator: ObjectId,              // Reference to User
  songs: [String]                 // Song IDs
}
```

### Service Logbook Model

```javascript
{
  churchName: String,
  serviceDate: Date,
  songList: [String],
  cancelled: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### OTP Model

```javascript
{
  email: String,
  otp: Number,
  createdAt: Date
}
```

### Search History Model

```javascript
{
  userId: ObjectId,               // Reference to User
  searchTerm: String,
  resultCount: Number,
  timestamp: Date
}
```

## Authentication Flow

1. **Email/Password Login**
   - User submits credentials
   - Server validates them and returns a JWT

2. **Google OAuth**
   - Frontend obtains a Google access token
   - Backend verifies the token and creates or updates the user
   - Backend returns a JWT

3. **OTP-based Registration**
   - User requests an OTP via email
   - User verifies the OTP
   - User registers with email, name, password, and OTP

## Error Handling

The application uses a centralized error handling system:

- `ClientFaultError` - 400 Bad Request
- `UnauthorizedError` - 401 Unauthorized
- `ForbiddenError` - 403 Forbidden
- `NotFoundError` - 404 Not Found
- `ServerFaultError` - 500 Internal Server Error

## Installation

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
# Production
npm start

# Development
npm run dev
```

## Testing

- Run `npm test` for the full suite with coverage.
- See `backend/TESTING.md` for the current testing workflow, helpers, and integration test patterns.
- In test mode, `backend/index.js` exports the Express app without starting the HTTP server.
- Coverage is collected for runtime source files only; test support code under `backend/jest/`, `backend/__tests__/`, and `backend/init-db/` is excluded from the coverage report.

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run tests locally
4. Submit a pull request
