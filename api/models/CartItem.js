const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  cart_item_id: Number,
  cart_id: Number,
  product_id: Number,
  quantity: Number,
});

module.exports = mongoose.model('CartItem', cartItemSchema, 'cart_items');