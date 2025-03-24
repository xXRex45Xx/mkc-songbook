# MKC Choir Frontend

This is the frontend application for the MKC Choir Song Book, built with React and modern web technologies.

## Tech Stack

-   **React 18** - UI framework
-   **React Router DOM** - Client-side routing
-   **Redux Toolkit** - State management
-   **Flowbite React** - UI components
-   **Tailwind CSS** - Styling
-   **@react-oauth/google** - Google OAuth integration

## Project Structure

```
frontend/
├── src/
│   ├── assets/         # Static assets (images, icons)
│   ├── components/     # Reusable React components
│   ├── config/         # Configuration files
│   ├── pages/          # Page components
│   ├── store/          # Redux store and slices
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main application component
│   └── main.jsx        # Application entry point
├── public/             # Public static files
└── package.json        # Project dependencies
```

## Key Features

### Authentication

-   Email/Password login
-   Google OAuth integration
-   JWT token-based authentication
-   Protected routes

### User Management

-   User registration with email verification
-   Password reset functionality
-   Profile management

### UI Components

-   Responsive design
-   Modern UI with Flowbite React
-   Custom form components
-   Loading states and error handling

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

## API Integration

The frontend communicates with the backend through RESTful APIs. Key API endpoints include:

-   Authentication: `/api/user/login`, `/api/user/google/callback`
-   User Management: `/api/user/register`, `/api/user/verify`
-   Profile: `/api/user/me`

## State Management

The application uses Redux Toolkit for state management with the following slices:

-   `userSlice`: Manages user authentication state
-   `songSlice`: Handles song-related state
-   `albumSlice`: Manages album-related state

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request
