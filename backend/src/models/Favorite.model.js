const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  animeId: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  malId: {
    type: String,
  },
  score: {
    type: Number,
  },
  episodes: {
    type: Number,
  },
  type: {
    type: String,
  },
  genres: [{
    type: String,
  }],
  addedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

// Compound unique index: a user can only favorite an anime once
favoriteSchema.index({ userId: 1, animeId: 1 }, { unique: true });

favoriteSchema.plugin(mongoosePaginate);

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;
