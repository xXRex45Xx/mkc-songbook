# MKC Choir Song Book Web Application

A comprehensive web application for managing choir songs, lyrics, playlists, and service records. Built with the MERN stack (MongoDB, Express, React, Node.js) and Vite.

## Features

### For Choir Members

-   **Song Management**
    -   Create and edit song lyrics with chord notation
    -   Organize songs into albums
    -   Upload and manage audio files
    -   Search and filter songs by title, lyrics, or ID
    -   Stream audio with range request support

-   **Album Management**
    -   Create and edit albums with cover images
    -   Associate songs with multiple albums
    -   Browse albums with pagination

-   **Playlist Management**
    -   Create personal and shared playlists
    -   Set playlist visibility (private, members-only, public)
    -   Add/remove songs from playlists
    -   Drag-and-drop song ordering

-   **Service Logbook**
    -   Record choir services with date and location
    -   Track songs performed at each service
    -   Maintain service history with search functionality

-   **User Features**
    -   Save favorite songs
    -   View search history
    -   Manage profile settings

### For Public Users

-   **Song Access**
    -   View song lyrics and chord notation
    -   Search through song database
    -   Stream available audio files
    -   Access public playlists

-   **Album Browsing**
    -   Browse public albums
    -   View album details and song lists

## Tech Stack

### Frontend

-   React 18 with Vite
-   Redux Toolkit for state management
-   React Router DOM for routing
-   Flowbite React for UI components
-   Tailwind CSS for styling
-   @react-oauth/google for Google authentication
-   React Loader Spinner for loading states
-   @dnd-kit/core for drag-and-drop functionality

### Backend

-   Node.js with Express
-   MongoDB with Mongoose
-   Passport.js for authentication (JWT and Local strategies)
-   Joi for validation
-   Multer for file uploads
-   Nodemailer for email notifications
-   Helmet for security headers
-   Morgan for logging
-   bcrypt for password hashing
-   UUID for unique ID generation

## Getting Started

### Prerequisites

-   Node.js (v16 or higher)
-   MongoDB (local or Atlas)
-   Google OAuth credentials

### Installation

1. Clone the repository:

```bash
git clone https://github.com/xXRex45Xx/mkc-songbook.git
cd mkc-songbook
```

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

4. Set up environment variables:

Backend (.env):

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

Frontend (.env):

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Environment Configuration Details

#### Email Configuration

The application uses SMTP for sending emails:

-   OTP verification for registration
-   Password reset links
-   Important notifications

For Gmail SMTP:

1. Enable 2-factor authentication on your Google account
2. Generate an App Password in Google Account settings
3. Use the App Password in `SMTP_PASS`

#### CORS Configuration

Configure allowed origins for security:

-   Development: `http://localhost:5173`
-   Production: Your production domain
-   Multiple origins can be comma-separated in `ALLOWED_ORIGINS`

5. Start the development servers:

Backend (from `backend/` directory):

```bash
# Production
node index.js

# Development (with nodemon)
npm run dev
```

Frontend (from `frontend/` directory):

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Project Structure

```
mkc-songbook/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── assets/        # Static assets (images, icons, SVGs)
│   │   ├── components/    # React components (reusable UI)
│   │   ├── config/        # Configuration files
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components (routes)
│   │   ├── store/         # Redux store and slices
│   │   ├── utils/         # Utility functions
│   │   ├── App.jsx        # Main application component
│   │   └── main.jsx       # Application entry point
│   ├── public/            # Public static files
│   └── package.json
│
└── backend/               # Node.js backend server
    ├── config/            # Configuration (db, passport, nodemailer)
    ├── controllers/       # Route controllers
    ├── middlewares/       # Custom middleware (auth, validation)
    ├── models/            # Database models
    ├── routes/            # API routes
    ├── utils/             # Utility functions
    ├── uploads/           # File upload directory
    ├── init-db/           # Database initialization
    └── index.js           # Application entry point
```

## Database Models

### User
-   Email, name, hashed password
-   Role-based access (public, member, admin, super-admin)
-   Favorite songs, search history
-   Profile photo URL

### Song
-   Title, lyrics, chord notation
-   Music elements (tempo, rhythm)
-   Audio file path, YouTube link
-   Album associations

### Album
-   Name, description
-   Cover image
-   Song associations

### Playlist
-   Name, visibility (private/members/public)
-   Creator reference
-   Song list

### Service Logbook
-   Church/service name
-   Service date
-   Songs performed
-   Cancellation status

## API Documentation

Detailed API documentation is available in the [backend README](backend/README.md).

### Key Endpoints

#### Authentication
-   `POST /api/user/login` - Email/password login
-   `POST /api/user/google/callback` - Google OAuth
-   `POST /api/user/otp` - Request OTP
-   `POST /api/user/verify-otp` - Verify OTP
-   `POST /api/user` - Register user

#### Songs
-   `GET /api/song` - Get/search songs
-   `GET /api/song/:id` - Get song by ID
-   `GET /api/song/:id/stream` - Stream audio
-   `POST /api/song` - Create song (admin)
-   `PUT /api/song/:id` - Update song (admin)
-   `DELETE /api/song/:id` - Delete song (admin)

#### Albums
-   `GET /api/album` - Get/search albums
-   `GET /api/album/:id` - Get album by ID
-   `POST /api/album` - Create album (admin)
-   `PUT /api/album/:id` - Update album (admin)
-   `DELETE /api/album/:id` - Delete album (admin)

#### Playlists
-   `GET /api/playlist` - Get/search playlists
-   `GET /api/playlist/:id` - Get playlist by ID
-   `POST /api/playlist` - Create playlist
-   `PUT /api/playlist/:id` - Update playlist
-   `PATCH /api/playlist/:id` - Partial update
-   `DELETE /api/playlist/:id` - Delete playlist

#### Service Logbook
-   `GET /api/logbook` - Get service logs
-   `POST /api/logbook` - Create log entry (admin)
-   `PUT /api/logbook/:id` - Update log entry (admin)

See [backend/README.md](backend/README.md) for complete API documentation.

## User Roles

| Role | Permissions |
|------|-------------|
| **Public** | View public songs, albums, and playlists |
| **Member** | View member content, create playlists, access logbook |
| **Admin** | Full CRUD on songs, albums, logbook; manage users |
| **Super-Admin** | All admin permissions + can modify admin roles |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Development Guidelines

-   Follow the project's code style (see STYLE_GUIDE.md in each directory)
-   Write meaningful commit messages
-   Test your changes before submitting
-   Update documentation as needed

## Acknowledgments

-   [React](https://reactjs.org/)
-   [Express](https://expressjs.com/)
-   [MongoDB](https://www.mongodb.com/)
-   [Flowbite React](https://flowbite-react.com/)
-   [Tailwind CSS](https://tailwindcss.com/)
-   [Vite](https://vitejs.dev/)
