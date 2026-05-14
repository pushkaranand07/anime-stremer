const express = require('express');
const router = express.Router();
const mangaController = require('./manga.controller');

// Manga endpoints use query params for IDs to avoid path encoding issues with slash-containing provider IDs
router.get('/search', mangaController.searchManga);
router.get('/info', mangaController.getMangaInfo);
router.get('/read', mangaController.getChapterPages);

module.exports = router;
