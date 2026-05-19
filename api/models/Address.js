const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  address_id: Number,
  user_id: Number,
  receiver_name: String,
  phone: Number,
  address_detail: String,
});

module.exports = mongoose.model('Address', addressSchema, 'addresses');