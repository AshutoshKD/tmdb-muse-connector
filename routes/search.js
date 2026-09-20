const router = require('express').Router();
const { client, formatMovie, formatTV, img } = require('../utils/tmdbClient');

// ── Multi Search (movies + TV + people) ──────────────────────────
// GET /search?q=tom+hanks
router.get('/', async (req, res) => {
  const { q, query, page = 1 } = req.query;
  const searchQuery = q || query;

  if (!searchQuery) {
    return res.status(400).json({ error: 'Missing query parameter: q or query' });
  }

  try {
    const { data } = await client.get('/search/multi', {
      params: { query: searchQuery, page },
    });

    const results = data.results.map(item => {
      if (item.media_type === 'movie') return { type: 'movie', ...formatMovie(item) };
      if (item.media_type === 'tv') return { type: 'tv', ...formatTV(item) };
      if (item.media_type === 'person') {
        return {
          type: 'person',
          id: item.id,
          name: item.name,
          known_for_department: item.known_for_department,
          photo: img(item.profile_path),
          popularity: item.popularity,
          known_for: item.known_for?.map(k =>
            k.media_type === 'movie' ? formatMovie(k) : formatTV(k)
          ),
        };
      }
      return item;
    });

    res.json({
      query: searchQuery,
      page: data.page,
      total_results: data.total_results,
      total_pages: data.total_pages,
      results,
    });
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

// ── Search Person ─────────────────────────────────────────────────
// GET /search/person?q=tom+hanks
router.get('/person', async (req, res) => {
  const { q, query, page = 1 } = req.query;
  const searchQuery = q || query;

  if (!searchQuery) {
    return res.status(400).json({ error: 'Missing query parameter: q or query' });
  }

  try {
    const { data } = await client.get('/search/person', {
      params: { query: searchQuery, page },
    });

    const results = data.results.map(p => ({
      id: p.id,
      name: p.name,
      known_for_department: p.known_for_department,
      photo: img(p.profile_path),
      popularity: p.popularity,
      known_for: p.known_for?.map(k =>
        k.media_type === 'movie' ? formatMovie(k) : formatTV(k)
      ),
    }));

    res.json({
      query: searchQuery,
      page: data.page,
      total_results: data.total_results,
      results,
    });
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

module.exports = router;
