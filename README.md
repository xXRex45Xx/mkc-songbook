# MKC Choir Song Book Web

## Repository Name: `mkc-choir-songs-app`

## Description:

The MKC Choir Song Book Application is a comprehensive platform designed to manage, view, and share choir songs, lyrics, and related media files. Developed using the MERN stack (MongoDB, Express, React, and Node.js), this application serves both choir members and public users by providing robust functionality for accessing and managing choir resources.

## Key Features:

-   **Song Lyrics Viewer:**

    -   View song lyrics in alphabetical and chronological order.
    -   Display music elements like chords, tempo, and rhythm.
    -   Adjustable font size for better readability.
    -   Share songs and associated media on social media and via email.

-   **Audio and Video Playback:**

    -   Stream songs directly from the web app.
    -   Sync with a cloud-based media repository to update song lists and media files.

-   **Search Functionality:**
    -   Search for songs by title or within the full lyrics.
    -   Highlight search results with context and display the number of matching songs.
-   **Choir Service Logbook:**
    -   Maintain an electronic logbook of choir services, tracking church name, service date, and songs performed.
    -   Synchronize the logbook with a cloud database for easy access by choir members.
-   **User Roles and Access Control:**
    -   Differentiate between public and internal users, restricting access to certain features for internal use only.

## Technology Stack:

-   **Frontend:**
    -   **React:** For building recative web applications with a consistent and smooth user interface.
-   **Backend:**

    -   **Node.js:** For building a scalable, high-performance server to handle application logic.
    -   **Express.js:** For setting up a robust RESTful API to manage requests from the frontend and interact with the database.

-   **Database:**

    -   **MongoDB:** A flexible NoSQL database to manage and store song lyrics, media files, and user data efficiently.

-   **Authentication:**
    -   **JWT (JSON Web Tokens):** For secure user authentication and role-based access control.

## Installation and Setup:

1. **Clone the Repository:**
    ```
    git clone https://github.com/xXRex45Xx/mkc-songbook.git
    ```
2. **Navigate to the Project Repository:**
    ```
    cd mkc-songbook
    ```
3. **Install Backend Dependencies:**
    ```
    cd backend
    npm install
    ```
4. **Install Frontend Dependencies:**
    ```
    cd ../frontend
    npm install
    ```
5. **Set Up Environment Variables:**
    - Create a `.env` file in the backend directory and configure the following environment variables:
    ```
    DB_URI: database connection uri
    PORT: server port
    ```
6. **Run the Application**

    - Backend:
        ```
        cd backend
        npm start
        ```
    - Frontend:

        ```
        cd ../frontend
        npm start

        ```
