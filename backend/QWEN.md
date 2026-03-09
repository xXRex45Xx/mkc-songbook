# MKC Choir Backend

This is the backend server for the MKC Choir Song Book, built with Node.js, Express, and MongoDB. It provides RESTful APIs for managing songs, albums, and users in a choir context.

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

## Project Structure

```
backend/
├── config/           # Configuration files
├── controllers/      # Route controllers
├── middlewares/      # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── utils/           # Utility functions
├── uploads/         # File upload directory
└── index.js         # Application entry point
```

## API Endpoints

### Authentication

-   `POST /api/user/login` - Email/password login
    -   Requires: email, password
-   `POST /api/user/google/callback` - Google OAuth login
    -   Requires: Google access token
-   `POST /api/user/otp` - Request OTP for registration or password reset
    -   Requires: email
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
    -   Requires: JWT authentication, admin role
-   `PATCH /api/user/:id` - Update user role (admin only)
    -   Requires: JWT authentication, admin role

### Songs

-   `GET /api/song` - Get all songs or search songs
    -   Query params: q (search), page, type, all, sortBy
-   `POST /api/song` - Create new song (admin only)
    -   Requires: JWT authentication, admin role
    -   Body: id, title, lyrics, chord, tempo, rhythm, albums, audio-file
-   `GET /api/song/:id` - Get song by ID
-   `PUT /api/song/:id` - Update song (admin only)
    -   Requires: JWT authentication, admin role
    -   Body: same as POST
-   `DELETE /api/song/:id` - Delete song (admin only)
    -   Requires: JWT authentication, admin role

### Albums

-   `GET /api/album` - Get all albums or search albums
-   `POST /api/album` - Create new album (admin only)
    -   Requires: JWT authentication, admin role
    -   Body: id, title, songs, cover (image file)
-   `GET /api/album/:id` - Get album by ID
-   `PUT /api/album/:id` - Update album (admin only)
    -   Requires: JWT authentication, admin role
    -   Body: same as POST
-   `DELETE /api/album/:id` - Delete album (admin only)
    -   Requires: JWT authentication, admin role

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
  email: String,
  name: String,
  password: String,
  role: String,
  photo: String
}
```

### Song Model

```javascript
{
  title: String,
  lyrics: String,
  album: ObjectId,
  createdBy: ObjectId
}
```

### Album Model

```javascript
{
  name: String,
  description: String,
  createdBy: ObjectId
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

## Error Handling

The application uses a centralized error handling system:

-   `ClientFaultError` - 400 Bad Request
-   `UnauthorizedError` - 401 Unauthorized
-   `ForbiddenError` - 403 Forbidden
-   `NotFoundError` - 404 Not Found
-   `ServerFaultError` - 500 Internal Server Error

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

### Route Documentation Pattern

API route modules should include:
- Module description
- Description of the functionality handled

## Installation

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
node index.js
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request