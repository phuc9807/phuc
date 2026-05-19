const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  order_id: Number,
  user_id: Number,
  address_id: Number,
  order_date: { type: Date, default: Date.now },
  total_amount: Number,
  status: { type: String, default: 'pending' },
});

module.exports = mongoose.model('Order', orderSchema, 'orders');