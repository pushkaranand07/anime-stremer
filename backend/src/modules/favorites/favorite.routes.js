const { Router } = require('express');
const favoriteController = require('./favorite.controller');
const verifyJWT = require('../auth/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { addFavoriteSchema } = require('./favorite.validator');

const router = Router();

router.use(verifyJWT); // All favorite routes require authentication

router.get('/', favoriteController.getFavorites);
router.post('/', validate(addFavoriteSchema), favoriteController.addFavorite);
router.delete('/:animeId', favoriteController.removeFavorite);

module.exports = router;
