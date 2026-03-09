/**
 * @fileoverview Backend URL configuration
 * Exports the backend API URL from environment variables
 * Used for all API client requests throughout the application
 * @type {string}
 */
const backendURL = import.meta.env.VITE_BACKEND_URL;

/**
 * Backend API URL for HTTP requests
 * @type {string}
 */
export default backendURL;
