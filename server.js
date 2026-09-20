require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3002;

// ── Middleware ────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '200'),
  message: { error: 'Too many requests, please slow down.' },
});
app.use(limiter);

// ── Public Routes (no auth) ───────────────────────────────────────
app.get('/', (req, res) => res.json({
  name: 'Movies & TV Muse Connector',
  powered_by: 'TMDB (The Movie Database)',
  version: '1.0.0',
  endpoints: {
    health:   'GET /health',
    search:   'GET /search?q=inception',
    movies:   'GET /movies/search?q=...',
    movie:    'GET /movies/:id',
    trending: 'GET /movies/trending',
    now:      'GET /movies/now-playing',
    upcoming: 'GET /movies/upcoming',
    top:      'GET /movies/top-rated',
    tv:       'GET /tv/search?q=...',
    tvShow:   'GET /tv/:id',
    tvPop:    'GET /tv/popular',
    person:   'GET /search/person?q=...',
  },
}));

app.get('/privacy', (req, res) => res.send(`
  <h1>Privacy Policy — Movies & TV Muse Connector</h1>
  <p>This connector retrieves publicly available movie and TV show data from The Movie Database (TMDB).</p>
  <p>We do not collect, store, or sell any personal user data.</p>
  <p>All data is sourced from TMDB's public API. See <a href="https://www.themoviedb.org/privacy-policy">TMDB Privacy Policy</a>.</p>
  <p>Contact: support@tmdb-muse-connector.com</p>
`));

app.get('/terms', (req, res) => res.send(`
  <h1>Terms of Service — Movies & TV Muse Connector</h1>
  <p>This connector is provided as-is for use within the Muse AI platform.</p>
  <p>Movie and TV data is provided by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
  <p>By using this connector, you agree to TMDB's <a href="https://www.themoviedb.org/terms-of-use">Terms of Use</a>.</p>
`));

app.use('/health', require('./routes/health'));

// ── Protected Routes (Muse auth required) ─────────────────────────
app.use('/search', auth, require('./routes/search'));
app.use('/movies', auth, require('./routes/movies'));
app.use('/tv', auth, require('./routes/tv'));

// ── 404 ───────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// ── Export for Vercel ─────────────────────────────────────────────
module.exports = app;

if (process.env.NODE_ENV !== 'production' || process.env.IS_LOCAL) {
  app.listen(PORT, () => {
    console.log(`\n🎬 TMDB Muse Connector running on port ${PORT}`);
    console.log(`🔗 Health: http://localhost:${PORT}/health`);
    console.log(`🔍 Search: http://localhost:${PORT}/search?q=inception\n`);
  });
}
