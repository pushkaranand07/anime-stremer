const jwt = require('jsonwebtoken');
const User = require('../../models/User.model');
const userRepository = require('../../repositories/user.repository');
const ApiError = require('../../utils/ApiError');
const jwtConfig = require('../../config/jwt.config');

class AuthService {
  async register(userData) {
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new ApiError(400, 'Email already exists');
    }

    const existingUsername = await userRepository.findByUsername(userData.username);
    if (existingUsername) {
      throw new ApiError(400, 'Username already exists');
    }

    const user = await userRepository.create({
      username: userData.username,
      email: userData.email,
      passwordHash: userData.password, // hashed by model pre-save hook
    });

    const { token, refreshToken } = this.generateTokens(user);

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
      refreshToken,
    };
  }

  async login(email, password) {
    // Use User model directly to get the full Mongoose document (needed for comparePassword method)
    const userDoc = await User.findOne({ email }).select('+passwordHash');
    if (!userDoc) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isMatch = await userDoc.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const user = userDoc.toObject();
    const { token, refreshToken } = this.generateTokens(user);

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken) {
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret);
    } catch (err) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      throw new ApiError(401, 'User not found for this refresh token');
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiry }
    );

    return { token };
  }

  generateTokens(user) {
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiry }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      jwtConfig.refreshSecret,
      { expiresIn: jwtConfig.refreshExpiry }
    );

    return { token, refreshToken };
  }
}

module.exports = new AuthService();
