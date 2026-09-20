const router = require('express').Router();
const { client, formatTV, img } = require('../utils/tmdbClient');

// ── Search TV Shows ───────────────────────────────────────────────
// GET /tv/search?q=breaking+bad
router.get('/search', async (req, res) => {
  const { q, query, page = 1 } = req.query;
  const searchQuery = q || query;

  if (!searchQuery) {
    return res.status(400).json({ error: 'Missing query parameter: q or query' });
  }

  try {
    const { data } = await client.get('/search/tv', {
      params: { query: searchQuery, page },
    });
    res.json({
      query: searchQuery,
      page: data.page,
      total_results: data.total_results,
      total_pages: data.total_pages,
      results: data.results.map(formatTV),
    });
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

// ── Get TV Show Details ───────────────────────────────────────────
// GET /tv/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [details, credits] = await Promise.all([
      client.get(`/tv/${id}`),
      client.get(`/tv/${id}/credits`),
    ]);

    const t = details.data;
    const cast = credits.data.cast?.slice(0, 10).map(c => ({
      name: c.name,
      character: c.character,
      photo: img(c.profile_path),
    }));

    res.json({
      ...formatTV(t),
      number_of_seasons: t.number_of_seasons,
      number_of_episodes: t.number_of_episodes,
      episode_run_time: t.episode_run_time,
      status: t.status,
      tagline: t.tagline,
      genres: t.genres?.map(g => g.name),
      networks: t.networks?.map(n => n.name),
      seasons: t.seasons?.map(s => ({
        season_number: s.season_number,
        name: s.name,
        episode_count: s.episode_count,
        air_date: s.air_date,
        poster: img(s.poster_path),
      })),
      cast,
      homepage: t.homepage,
    });
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

// ── Trending TV Shows ─────────────────────────────────────────────
// GET /tv/trending?time=week
router.get('/trending/:time_window?', async (req, res) => {
  const time = req.params.time_window || req.query.time || 'week';
  try {
    const { data } = await client.get(`/trending/tv/${time}`);
    res.json({
      time_window: time,
      total_results: data.total_results,
      results: data.results.map(formatTV),
    });
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

// ── Popular TV Shows ──────────────────────────────────────────────
// GET /tv/popular
router.get('/popular', async (req, res) => {
  const { page = 1 } = req.query;
  try {
    const { data } = await client.get('/tv/popular', { params: { page } });
    res.json({
      page: data.page,
      total_results: data.total_results,
      results: data.results.map(formatTV),
    });
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

// ── Top Rated TV Shows ────────────────────────────────────────────
// GET /tv/top-rated
router.get('/top-rated', async (req, res) => {
  const { page = 1 } = req.query;
  try {
    const { data } = await client.get('/tv/top_rated', { params: { page } });
    res.json({
      page: data.page,
      total_results: data.total_results,
      results: data.results.map(formatTV),
    });
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

// ── Airing Today ──────────────────────────────────────────────────
// GET /tv/airing-today
router.get('/airing-today', async (req, res) => {
  const { page = 1 } = req.query;
  try {
    const { data } = await client.get('/tv/airing_today', { params: { page } });
    res.json({
      page: data.page,
      total_results: data.total_results,
      results: data.results.map(formatTV),
    });
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

module.exports = router;
