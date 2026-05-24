const jwt = require('jsonwebtoken');
const ApiError = require('../../utils/ApiError');
const jwtConfig = require('./jwt.config');
const userRepository = require('./user.repository');

const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return next(new ApiError(401, 'No token provided'));

  let decoded;
  try {
    decoded = jwt.verify(token, jwtConfig.secret);
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    return next(new ApiError(401, msg));
  }

  // Verify user still exists in DB (lean query for speed)
  const user = await userRepository.findById(decoded.userId);
  if (!user) return next(new ApiError(401, 'User account no longer exists'));

  req.user = decoded;
  next();
};

module.exports = verifyJWT;
