const { Router } = require('express');
const authRoutes = require('../modules/auth/auth.routes');
const favoriteRoutes = require('../modules/favorites/favorite.routes');
const streamingRoutes = require('../modules/streaming/streaming.routes');
const mangaRoutes = require('../modules/manga/manga.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/streaming', streamingRoutes);
router.use('/manga', mangaRoutes);

// Health check
router.get('/health', (req, res) => res.json({ status: 'OK', version: 'v1' }));

module.exports = router;
