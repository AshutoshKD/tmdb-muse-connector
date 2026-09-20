const axios = require('axios');

const BASE_URL = process.env.TMDB_API_BASE_URL || 'https://api.themoviedb.org/3';
const IMAGE_BASE = process.env.TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500';

// TMDB recommends Bearer token (API Read Access Token) as the primary auth method
// Falls back to api_key query param if only API_KEY is set
const READ_TOKEN = process.env.TMDB_READ_TOKEN;
const API_KEY = process.env.TMDB_API_KEY;

const client = axios.create({
  baseURL: BASE_URL,
  // Use Bearer token (recommended by TMDB docs) or fallback to api_key
  headers: READ_TOKEN
    ? { Authorization: `Bearer ${READ_TOKEN}` }
    : {},
  params: {
    language: 'en-US',
    ...(READ_TOKEN ? {} : { api_key: API_KEY }),
  },
  timeout: 10000,
});

// Helper to build full image URLs
const img = (path) => path ? `${IMAGE_BASE}${path}` : null;

// Format movie for clean response
const formatMovie = (m) => ({
  id: m.id,
  title: m.title,
  overview: m.overview,
  release_date: m.release_date,
  rating: m.vote_average?.toFixed(1),
  vote_count: m.vote_count,
  poster: img(m.poster_path),
  backdrop: img(m.backdrop_path),
  genres: m.genres?.map(g => g.name) || [],
  genre_ids: m.genre_ids || [],
  popularity: m.popularity,
  adult: m.adult,
  original_language: m.original_language,
});

// Format TV show for clean response
const formatTV = (t) => ({
  id: t.id,
  name: t.name,
  overview: t.overview,
  first_air_date: t.first_air_date,
  rating: t.vote_average?.toFixed(1),
  vote_count: t.vote_count,
  poster: img(t.poster_path),
  backdrop: img(t.backdrop_path),
  genres: t.genres?.map(g => g.name) || [],
  genre_ids: t.genre_ids || [],
  popularity: t.popularity,
  original_language: t.original_language,
});

module.exports = { client, formatMovie, formatTV, img };
