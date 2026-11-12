/**
 * Application API configuration.
 * Resolves the backend API base URL using Vite environment variables.
 * In development: defaults to 'http://localhost:3000'
 * In production: defaults to '/api' (same-origin reverse proxy)
 */
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== ""
    ? import.meta.env.VITE_API_URL
    : (import.meta.env.DEV ? "http://localhost:3000" : "/api")
).replace(/\/+$/, "");

export default API_BASE_URL;
