# MKC Choir Song Book Web Application

A comprehensive web application for managing choir songs, lyrics, and related media files. Built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

### For Choir Members

-   **Song Management**

    -   Create and edit song lyrics
    -   Organize songs into albums
    -   Upload and manage media files
    -   Search and filter songs

-   **Service Logbook**
    -   Record choir services
    -   Track songs performed
    -   Maintain service history

### For Public Users

-   **Song Access**
    -   View song lyrics
    -   Search through song database
    -   Access public media files

## Tech Stack

### Frontend

-   React 18 with Vite
-   Redux Toolkit for state management
-   React Router DOM for routing
-   Flowbite React for UI components
-   Tailwind CSS for styling
-   @react-oauth/google for Google authentication
-   React Loader Spinner for loading states

### Backend

-   Node.js with Express
-   MongoDB with Mongoose
-   Passport.js for authentication (JWT and Local strategies)
-   Joi for validation
-   Multer for file uploads
-   Nodemailer for email notifications
-   Helmet for security headers
-   Morgan for logging

## Getting Started

### Prerequisites

-   Node.js (v14 or higher)
-   MongoDB
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
```

Frontend (.env):

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Environment Configuration Details

#### Email Configuration

The application uses SMTP for sending emails:

-   Verification emails
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

Backend:

```bash
cd backend
node index.js
```

Frontend:

```bash
cd frontend
npm run dev
```

## Project Structure

```
mkc-songbook/
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── assets/    # Static assets
│   │   ├── components/# React components
│   │   ├── config/    # Configuration files
│   │   ├── pages/     # Page components
│   │   ├── store/     # Redux store
│   │   └── utils/     # Utility functions
│   └── package.json
│
└── backend/           # Node.js backend server
    ├── config/       # Configuration files
    ├── controllers/  # Route controllers
    ├── middlewares/  # Custom middleware
    ├── models/      # Database models
    ├── routes/      # API routes
    ├── utils/       # Utility functions
    ├── uploads/     # File upload directory
    └── index.js     # Application entry point
```

## API Documentation

### Authentication Endpoints

-   `POST /api/user/login` - Email/password login
-   `POST /api/user/google/callback` - Google OAuth login
-   `POST /api/user/register` - User registration
-   `POST /api/user/verify` - Email verification
-   `POST /api/user/reset-password` - Password reset

### User Management

-   `GET /api/user/me` - Get current user profile
-   `PUT /api/user/profile` - Update user profile

### Songs

-   `GET /api/songs` - Get all songs
-   `POST /api/songs` - Create new song
-   `GET /api/songs/:id` - Get song by ID
-   `PUT /api/songs/:id` - Update song
-   `DELETE /api/songs/:id` - Delete song

### Albums

-   `GET /api/albums` - Get all albums
-   `POST /api/albums` - Create new album
-   `GET /api/albums/:id` - Get album by ID
-   `PUT /api/albums/:id` - Update album
-   `DELETE /api/albums/:id` - Delete album

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Acknowledgments

-   [React](https://reactjs.org/)
-   [Express](https://expressjs.com/)
-   [MongoDB](https://www.mongodb.com/)
-   [Flowbite React](https://flowbite-react.com/)
-   [Tailwind CSS](https://tailwindcss.com/)
