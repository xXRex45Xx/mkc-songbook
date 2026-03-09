# MKC Choir Backend

This is the backend server for the MKC Choir Song Book, built with Node.js, Express, and MongoDB.

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
├── config/           # Configuration files (database, passport, nodemailer)
├── controllers/      # Route controllers
├── middlewares/      # Custom middleware (auth, validation, file upload)
├── models/           # Database models
├── routes/           # API routes
├── utils/            # Utility functions
├── uploads/          # File upload directory
├── init-db/          # Database initialization scripts
└── index.js          # Application entry point
```

## API Endpoints

### Authentication

-   `POST /api/user/login` - Email/password login
    -   Requires: email, password
-   `POST /api/user/google/callback` - Google OAuth login
    -   Requires: Google access token
-   `POST /api/user/otp` - Request OTP for registration or password reset
    -   Requires: email
    -   Query params: forgotPassword (optional boolean)
-   `POST /api/user/verify-otp` - Verify OTP code
    -   Requires: email, OTP
-   `PUT /api/user/reset-password` - Reset password with OTP
    -   Requires: email, new password, OTP

### User Management

-   `POST /api/user` - Register a new user with email verification
    -   Requires: email, name, password, OTP
-   `GET /api/user/current-user` - Get current user profile
    -   Requires: JWT authentication
-   `GET /api/user` - Get all users or search users (admin only)
    -   Requires: JWT authentication, admin/super-admin role
    -   Query params: q (search), page, type (name/email)
-   `PATCH /api/user/:id` - Update user role (admin only)
    -   Requires: JWT authentication, admin/super-admin role
    -   Body: role
-   `PUT /api/user/favorites` - Update user's favorite songs
    -   Requires: JWT authentication
    -   Body: favorites (array), addSongs (array), or removeSongs (array)
-   `GET /api/user/favorites` - Get user's favorite songs
    -   Requires: JWT authentication

### Songs

-   `GET /api/song` - Get all songs or search songs
    -   Query params: q (search), page, type (title/lyrics/id), all, sortBy
-   `POST /api/song` - Create new song (admin only)
    -   Requires: JWT authentication, admin/super-admin role
    -   Body: id, title, lyrics, chord, tempo, rythm, albums, video-link (optional)
    -   File: audio-file (optional, via multer)
-   `GET /api/song/:id` - Get song by ID
-   `PUT /api/song/:id` - Update song (admin only)
    -   Requires: JWT authentication, admin/super-admin role
    -   Body: same as POST
-   `DELETE /api/song/:id` - Delete song (admin only)
    -   Requires: JWT authentication, admin/super-admin role
-   `GET /api/song/:id/stream` - Stream song audio file
    -   Supports range requests for partial downloads

### Albums

-   `GET /api/album` - Get all albums or search albums
    -   Query params: q (search), names (return only names), page
-   `POST /api/album` - Create new album (admin only)
    -   Requires: JWT authentication, admin/super-admin role
    -   Body: id, title, songs, createdAt (optional)
    -   File: cover (image file, optional, via multer)
-   `GET /api/album/:id` - Get album by ID
-   `PUT /api/album/:id` - Update album (admin only)
    -   Requires: JWT authentication, admin/super-admin role
    -   Body: same as POST
-   `DELETE /api/album/:id` - Delete album (admin only)
    -   Requires: JWT authentication, admin/super-admin role

### Playlists

-   `GET /api/playlist` - Get all playlists or search playlists
    -   Query params: q (search), page, myPlaylists
    -   Authentication: Optional (public access for public playlists)
-   `POST /api/playlist` - Create new playlist
    -   Requires: JWT authentication
    -   Body: name, songs (optional), visibility (optional: "public", "private", "members")
-   `GET /api/playlist/:id` - Get playlist by ID
    -   Authentication: Optional (access depends on visibility)
-   `PUT /api/playlist/:id` - Update playlist
    -   Requires: JWT authentication (playlist creator only)
    -   Body: name, visibility, songs
-   `PATCH /api/playlist/:id` - Partially update playlist
    -   Requires: JWT authentication (playlist creator only)
    -   Body: visibility (optional), addSongs (optional), removeSongs (optional)
-   `DELETE /api/playlist/:id` - Delete playlist
    -   Requires: JWT authentication (playlist creator only)

### Service Logbook

-   `GET /api/logbook` - Get all service logbook entries or search
    -   Requires: JWT authentication, member/admin/super-admin role
    -   Query params: q (search), page, type (location/date)
-   `POST /api/logbook` - Create new logbook entry (admin only)
    -   Requires: JWT authentication, admin/super-admin role
    -   Body: location, timestamp, songs
-   `PUT /api/logbook/:id` - Update logbook entry (admin only)
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

# Default Admin User
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

The application uses a centralized error handling system:

-   `ClientFaultError` - 400 Bad Request
-   `UnauthorizedError` - 401 Unauthorized
-   `ForbiddenError` - 403 Forbidden
-   `NotFoundError` - 404 Not Found
-   `ServerFaultError` - 500 Internal Server Error

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
