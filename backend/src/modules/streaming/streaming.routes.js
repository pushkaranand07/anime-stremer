const { Router } = require('express');
const streamingController = require('./streaming.controller');

const router = Router();

router.get('/info', streamingController.getInfo);
router.get('/watch/:episodeId', streamingController.getWatch);

module.exports = router;
