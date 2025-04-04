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
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/user/google/callback

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
