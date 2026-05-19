const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  cart_id: Number,
  user_id: Number,
});

module.exports = mongoose.model('Cart', cartSchema, 'cart');