const mongoose = require('mongoose');

const orderDetailSchema = new mongoose.Schema({
  order_detail_id: Number,
  order_id: Number,
  product_id: Number,
  quantity: Number,
  price: Number,
});

module.exports = mongoose.model('OrderDetail', orderDetailSchema, 'order_details');