const mongoose = require('mongoose');

const cacheEntrySchema = new mongoose.Schema({
  cacheKey: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL index: MongoDB auto-deletes when current time > expiresAt
  }
}, {
  timestamps: true,
});

const CacheEntry = mongoose.model('CacheEntry', cacheEntrySchema);

module.exports = CacheEntry;
