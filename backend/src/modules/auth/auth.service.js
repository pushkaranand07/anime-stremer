const jwt = require('jsonwebtoken');
const User = require('../../models/User.model');
const RefreshToken = require('../../models/RefreshToken.model');
const userRepository = require('../../repositories/user.repository');
const ApiError = require('../../utils/ApiError');
const jwtConfig = require('../../config/jwt.config');

class AuthService {
  async register(userData) {
    // Parallel existence checks — faster than sequential
    const [existingEmail, existingUsername] = await Promise.all([
      userRepository.findByEmail(userData.email),
      userRepository.findByUsername(userData.username),
    ]);

    if (existingEmail) throw new ApiError(400, 'Email already in use');
    if (existingUsername) throw new ApiError(400, 'Username already taken');

    const user = await userRepository.create({
      username: userData.username,
      email: userData.email,
      passwordHash: userData.password, // pre-save hook will hash this
    });

    const { accessToken, refreshToken } = await this.generateTokens(user);
    return { user: this._safeUser(user), accessToken, refreshToken };
  }

  async login(email, password) {
    // Use User model directly to get Mongoose document (needed for comparePassword method)
    const userDoc = await User.findOne({ email }).select('+passwordHash');
    if (!userDoc) throw new ApiError(401, 'Invalid credentials');

    const isMatch = await userDoc.comparePassword(password);
    if (!isMatch) throw new ApiError(401, 'Invalid credentials');

    // Update last login timestamp
    userDoc.lastLoginAt = new Date();
    await userDoc.save({ validateModifiedOnly: true });

    const user = userDoc.toObject();
    const { accessToken, refreshToken } = await this.generateTokens(user);
    return { user: this._safeUser(user), accessToken, refreshToken };
  }

  async refreshAccessToken(rawRefreshToken) {
    // 1. Verify JWT signature
    let decoded;
    try {
      decoded = jwt.verify(rawRefreshToken, jwtConfig.refreshSecret);
    } catch {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    // 2. Check server-side store — is this token still valid?
    const tokenRecord = await RefreshToken.findOne({ token: rawRefreshToken });
    if (!tokenRecord || tokenRecord.isRevoked) {
      throw new ApiError(401, 'Refresh token has been revoked');
    }

    // 3. Verify user still exists
    const user = await userRepository.findById(decoded.userId);
    if (!user) throw new ApiError(401, 'User no longer exists');

    // 4. Issue new access token only (refresh token stays the same)
    const accessToken = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiry }
    );

    return { accessToken };
  }

  async logout(rawRefreshToken) {
    if (!rawRefreshToken) return; // Graceful no-op

    // Mark the refresh token as revoked in the store
    await RefreshToken.findOneAndUpdate(
      { token: rawRefreshToken },
      { isRevoked: true }
    );
  }

  async generateTokens(user) {
    const accessToken = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiry }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      jwtConfig.refreshSecret,
      { expiresIn: jwtConfig.refreshExpiry }
    );

    // Store the refresh token server-side for revocation support
    const expiryMs = this._parseExpiry(jwtConfig.refreshExpiry);
    await RefreshToken.create({
      token: refreshToken,
      userId: user._id,
      expiresAt: new Date(Date.now() + expiryMs),
    });

    return { accessToken, refreshToken };
  }

  _parseExpiry(expiry) {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1), 10);
    const map = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    return value * (map[unit] || 1000);
  }

  _safeUser(user) {
    return { id: user._id, username: user.username, email: user.email, role: user.role };
  }
}

module.exports = new AuthService();
