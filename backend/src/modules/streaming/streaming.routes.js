const { Router } = require('express');
const streamingController = require('./streaming.controller');
const verifyJWT = require('../../middlewares/auth.middleware');

const router = Router();

router.get('/info', streamingController.getInfo);
router.get('/watch/:episodeId', streamingController.getWatch);
router.get('/proxy', verifyJWT, streamingController.proxyStream);
router.get('/torrent', streamingController.streamTorrent);

module.exports = router;
