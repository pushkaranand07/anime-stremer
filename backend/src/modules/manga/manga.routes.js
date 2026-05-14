const express = require('express');
const router = express.Router();
const mangaController = require('./manga.controller');

router.get('/search', mangaController.searchManga);
router.get('/info/:id', mangaController.getMangaInfo);
router.get('/read/:chapterId', mangaController.getChapterPages);

module.exports = router;
