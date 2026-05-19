const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  category_id: Number,
  category_name: String,
  description: String,
});

module.exports = mongoose.model('Category', categorySchema, 'categories');