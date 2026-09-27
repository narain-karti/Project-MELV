/**
 * Application API configuration helper
 * In development, points to http://localhost:8000 (or VITE_API_URL if configured).
 * In production or deployed behind reverse-proxy, uses relative paths or configured environment variable.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL !== undefined 
  ? import.meta.env.VITE_API_URL 
  : (import.meta.env.DEV ? 'http://localhost:8000' : '');

export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};
