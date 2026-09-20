const router = require('express').Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    connector: 'Movies & TV for Muse',
    version: '1.0.0',
    powered_by: 'TMDB (The Movie Database)',
    capabilities: [
      'search_movies',
      'search_tv_shows',
      'get_movie_details',
      'get_tv_details',
      'trending_movies',
      'trending_tv',
      'now_playing',
      'upcoming_movies',
      'top_rated',
      'search_person',
    ],
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
