const User = require('../models/User.model');

class UserRepository {
  async findById(id) {
    return await User.findById(id).lean();
  }

  async findByEmail(email) {
    return await User.findOne({ email }).lean();
  }

  async findByUsername(username) {
    return await User.findOne({ username }).lean();
  }

  async create(userData) {
    const user = new User(userData);
    const savedUser = await user.save();
    return savedUser.toObject();
  }

  async updateById(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { new: true }).lean();
  }
}

module.exports = new UserRepository();
