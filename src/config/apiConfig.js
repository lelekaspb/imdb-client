// Centralized external API config constants for frontend usage.
//
// NOTE: Vite exposes env vars through import.meta.env
// Make sure your .env contains VITE_API_BASE and VITE_TMDB_API_KEY

export const API_BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || 'http://localhost:5079/api';

// TMDB image host (stable) — keep as a constant rather than reading from env
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// TMDB api key available via Vite env (if you need it client-side)
export const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '';

console.debug('[apiConfig] API_BASE=', API_BASE, 'TMDB_IMAGE_BASE=', TMDB_IMAGE_BASE);
