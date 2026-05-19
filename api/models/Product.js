const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  product_id: Number,
  category_id: Number,
  product_name: String,
  price: Number,
  stock: Number,
  description: String,
  image: String,
  slug: String,
  created_at: Date,
  on_sale: { type: Boolean, default: false },
  sale_price: { type: Number, default: null },
});

module.exports = mongoose.model('Product', productSchema, 'products');