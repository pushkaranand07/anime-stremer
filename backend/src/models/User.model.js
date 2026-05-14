const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: {
    type: String, required: true, unique: true,
    trim: true, lowercase: true,
  },
  passwordHash: {
    type: String,
    required: true,
    select: false,        // NEVER returned by default queries
  },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  lastLoginAt: { type: Date },  // Useful for security auditing
}, { timestamps: true });

// Pre-save hook: hash password only when passwordHash field is modified
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = function(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
