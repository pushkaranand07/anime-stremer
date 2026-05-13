const { Router } = require('express');
const authController = require('./auth.controller');
const validate = require('../../middlewares/validate.middleware');
const { signupSchema, loginSchema } = require('./auth.validator');

const router = Router();

router.post('/signup', validate(signupSchema), authController.signup);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', authController.refreshToken);

module.exports = router;
