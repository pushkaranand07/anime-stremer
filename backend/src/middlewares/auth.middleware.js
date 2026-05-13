const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const jwtConfig = require('../config/jwt.config');

const verifyJWT = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return next(new ApiError(401, 'Unauthorized request'));
  }

  try {
    const decodedToken = jwt.verify(token, jwtConfig.secret);
    req.user = decodedToken;
    next();
  } catch (error) {
    return next(new ApiError(401, 'Invalid access token'));
  }
};

module.exports = verifyJWT;
