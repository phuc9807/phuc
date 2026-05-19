const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

// Lấy giỏ hàng của user
const getCart = async (req, res) => {
  const { user_id } = req.params;
  const cart = await Cart.findOne({ user_id: Number(user_id) });
  if (!cart) return res.json([]);

  const items = await CartItem.find({ cart_id: cart.cart_id });
  res.json(items);
};

// Thêm vào giỏ hàng
const addToCart = async (req, res) => {
  const { user_id, product_id, quantity } = req.body;

  // Kiểm tra tồn kho
  const product = await Product.findOne({ product_id: Number(product_id) });
  if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
  if (product.stock < quantity) return res.status(400).json({ message: 'Không đủ hàng trong kho' });

  let cart = await Cart.findOne({ user_id: Number(user_id) });
  if (!cart) {
    const cart_id = Math.floor(Math.random() * 900000) + 100000;
    cart = await Cart.create({ cart_id, user_id: Number(user_id) });
  }

  const existing = await CartItem.findOne({ cart_id: cart.cart_id, product_id: Number(product_id) });
  if (existing) {
    // Kiểm tra tồn kho đủ cho tổng số lượng mới
    if (product.stock < quantity) return res.status(400).json({ message: 'Không đủ hàng trong kho' });
    existing.quantity += quantity;
    await existing.save();
    // Trừ stock
    await Product.findOneAndUpdate(
      { product_id: Number(product_id) },
      { $inc: { stock: -quantity } }
    );
    return res.json(existing);
  }

  const cart_item_id = Math.floor(Math.random() * 900000) + 100000;
  const item = await CartItem.create({
    cart_item_id, cart_id: cart.cart_id,
    product_id: Number(product_id), quantity,
  });

  // Trừ stock
  await Product.findOneAndUpdate(
    { product_id: Number(product_id) },
    { $inc: { stock: -quantity } }
  );

  res.status(201).json(item);
};

// Xóa khỏi giỏ hàng
const removeFromCart = async (req, res) => {
  const item = await CartItem.findOne({ cart_item_id: Number(req.params.cart_item_id) });
  if (item) {
    // Hoàn lại stock
    await Product.findOneAndUpdate(
      { product_id: item.product_id },
      { $inc: { stock: item.quantity } }
    );
    await item.deleteOne();
  }
  res.json({ message: 'Đã xóa khỏi giỏ hàng' });
};

// Cập nhật số lượng item trong giỏ (và đồng bộ stock)
const updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const cart_item_id = Number(req.params.cart_item_id);

  const item = await CartItem.findOne({ cart_item_id });
  if (!item) return res.status(404).json({ message: 'Không tìm thấy item' });

  const diff = quantity - item.quantity; // dương = tăng, âm = giảm
  if (diff === 0) return res.json(item);

  const product = await Product.findOne({ product_id: item.product_id });
  if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

  // Nếu tăng, kiểm tra stock còn đủ không
  if (diff > 0 && product.stock < diff)
    return res.status(400).json({ message: 'Không đủ hàng trong kho' });

  item.quantity = quantity;
  await item.save();

  // Trừ hoặc hoàn lại stock theo chiều thay đổi
  await Product.findOneAndUpdate(
    { product_id: item.product_id },
    { $inc: { stock: -diff } }
  );

  res.json(item);
};

module.exports = { getCart, addToCart, removeFromCart, updateCartItem };