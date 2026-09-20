const router = require('express').Router();
const { client, formatMovie, img } = require('../utils/tmdbClient');

// ── Search Movies ─────────────────────────────────────────────────
// GET /movies/search?q=inception&page=1
router.get('/search', async (req, res) => {
  const { q, query, page = 1, year } = req.query;
  const searchQuery = q || query;

  if (!searchQuery) {
    return res.status(400).json({ error: 'Missing query parameter: q or query' });
  }

  try {
    const params = { query: searchQuery, page };
    if (year) params.year = year;

    const { data } = await client.get('/search/movie', { params });
    res.json({
      query: searchQuery,
      page: data.page,
      total_results: data.total_results,
      total_pages: data.total_pages,
      results: data.results.map(formatMovie),
    });
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

// ── Trending Movies ───────────────────────────────────────────────
// GET /movies/trending?time=week
router.get('/trending', async (req, res) => {
  const time = req.query.time || 'week';
  try {
    const { data } = await client.get(`/trending/movie/${time}`);
    res.json({
      time_window: time,
      total_results: data.total_results,
      results: data.results.map(formatMovie),
    });
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

// ── Now Playing ───────────────────────────────────────────────────
router.get('/now-playing', async (req, res) => {
  const { page = 1, region } = req.query;
  try {
    const params = { page };
    if (region) params.region = region;
    const { data } = await client.get('/movie/now_playing', { params });
    res.json({ page: data.page, total_results: data.total_results, dates: data.dates, results: data.results.map(formatMovie) });
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

// ── Upcoming Movies ───────────────────────────────────────────────
router.get('/upcoming', async (req, res) => {
  const { page = 1, region } = req.query;
  try {
    const params = { page };
    if (region) params.region = region;
    const { data } = await client.get('/movie/upcoming', { params });
    res.json({ page: data.page, total_results: data.total_results, dates: data.dates, results: data.results.map(formatMovie) });
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

// ── Top Rated Movies ──────────────────────────────────────────────
router.get('/top-rated', async (req, res) => {
  const { page = 1 } = req.query;
  try {
    const { data } = await client.get('/movie/top_rated', { params: { page } });
    res.json({ page: data.page, total_results: data.total_results, results: data.results.map(formatMovie) });
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

// ── Popular Movies ────────────────────────────────────────────────
router.get('/popular', async (req, res) => {
  const { page = 1 } = req.query;
  try {
    const { data } = await client.get('/movie/popular', { params: { page } });
    res.json({ page: data.page, total_results: data.total_results, results: data.results.map(formatMovie) });
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

// ── Get Movie Details ─────────────────────────────────────────────
// GET /movies/:id  (must be LAST to avoid catching named routes)
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [details, credits, videos] = await Promise.all([
      client.get(`/movie/${id}`),
      client.get(`/movie/${id}/credits`),
      client.get(`/movie/${id}/videos`),
    ]);

    const m = details.data;
    const cast = credits.data.cast?.slice(0, 10).map(c => ({
      name: c.name,
      character: c.character,
      photo: img(c.profile_path),
    }));
    const trailer = videos.data.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');

    res.json({
      ...formatMovie(m),
      runtime: m.runtime,
      status: m.status,
      budget: m.budget,
      revenue: m.revenue,
      tagline: m.tagline,
      genres: m.genres?.map(g => g.name),
      cast,
      trailer: trailer ? `https://youtube.com/watch?v=${trailer.key}` : null,
      homepage: m.homepage,
    });
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

module.exports = router;
