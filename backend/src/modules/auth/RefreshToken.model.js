const mongoose = require('mongoose');

/**
 * Server-side refresh token store.
 * Enables explicit revocation on logout and prevents token reuse.
 * Uses a TTL index to auto-delete expired tokens (no manual cleanup needed).
 */
const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // MongoDB TTL index — auto-deletes when expired
  },
  isRevoked: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
