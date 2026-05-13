const express = require('express');
const router = express.Router();
const consumetService = require('../services/consumetService');

// GET /api/streaming/info?q=<title>
router.get('/info', async (req, res) => {
  const query = (req.query.q || '').trim();
  if (!query) return res.status(400).json({ error: 'Query parameter ?q= is required' });

  try {
    const info = await consumetService.getAnimeInfo(query);
    return res.json(info);
  } catch (err) {
    console.error('[Streaming Route] Info error:', err.message);
    return res.status(503).json({
      error: 'All streaming providers are currently unavailable.',
      details: err.message,
    });
  }
});

// GET /api/streaming/watch/:episodeId?provider=<name>&subOrDub=sub|dub
router.get('/watch/:episodeId', async (req, res) => {
  const { episodeId } = req.params;
  const preferredProvider = req.query.provider || 'Hianime';
  const subOrDub = req.query.subOrDub === 'dub' ? 'dub' : 'sub';

  if (!episodeId) return res.status(400).json({ error: 'Episode ID is required' });

  try {
    const sources = await consumetService.getEpisodeSources(episodeId, preferredProvider, subOrDub);
    return res.json(sources);
  } catch (err) {
    console.error('[Streaming Route] Watch error:', err.message);
    return res.status(503).json({
      error: 'Unable to fetch video sources.',
      details: err.message,
    });
  }
});

module.exports = router;
