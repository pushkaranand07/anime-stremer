const { Router } = require('express');
const streamingController = require('./streaming.controller');
const verifyJWT = require('../auth/auth.middleware');
const { proxyGuard } = require('./proxyGuard.middleware');

const router = Router();

// ─── Public endpoints ────────────────────────────────────────────────────────
router.get('/info', streamingController.getInfo);
router.get('/watch/:episodeId', streamingController.getWatch);

// Public proxy — used for streaming segments and subtitles.
// Protected by SSRF guard + URL allowlist (NOT by JWT).
router.get('/proxy', proxyGuard, streamingController.proxyStream);

// ─── Authenticated endpoints ──────────────────────────────────────────────────
// Torrent streaming is privileged — require login to prevent bandwidth abuse.
router.get('/torrent', verifyJWT, streamingController.streamTorrent);

module.exports = router;
