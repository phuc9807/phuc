const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user_id: Number,
  full_name: String,
  email: String,
  password: String,
  phone: Number,
  role: { type: String, default: 'customer' },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema, 'users');