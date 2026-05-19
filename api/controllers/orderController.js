const Order = require('../models/Order');
const OrderDetail = require('../models/OrderDetail');
const CartItem = require('../models/CartItem');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Đặt hàng
const createOrder = async (req, res) => {
  const { user_id, address_id, items, total_amount } = req.body;

  const order_id = Math.floor(Math.random() * 900000) + 100000;

  const order = await Order.create({
    order_id, user_id: Number(user_id),
    address_id: Number(address_id),
    total_amount, status: 'pending',
  });

  for (const item of items) {
    const order_detail_id = Math.floor(Math.random() * 900000) + 100000;
    await OrderDetail.create({
      order_detail_id, order_id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    });
  }

  // Xóa giỏ hàng sau khi đặt
  // (stock đã bị trừ lúc thêm vào giỏ, không trừ thêm ở đây)
  const cart = await Cart.findOne({ user_id: Number(user_id) });
  if (cart) await CartItem.deleteMany({ cart_id: cart.cart_id });

  res.status(201).json(order);
};

// Lấy lịch sử đơn hàng của user
const getOrders = async (req, res) => {
  const orders = await Order.find({ user_id: Number(req.params.user_id) });
  res.json(orders);
};

// GET /api/orders/all — Lấy tất cả đơn hàng (admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ order_date: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// GET /api/orders/details/all — Lấy tất cả order_details (admin)
const getAllOrderDetails = async (req, res) => {
  try {
    const details = await OrderDetail.find().sort({ _id: -1 });
    res.json(details);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// GET /api/orders/:order_id/details — Lấy chi tiết sản phẩm trong đơn
const getOrderDetails = async (req, res) => {
  try {
    const details = await OrderDetail.find({ order_id: Number(req.params.order_id) });
    res.json(details);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// PUT /api/orders/:order_id/status — Cập nhật trạng thái đơn hàng (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    const order = await Order.findOne({ order_id: Number(req.params.order_id) });
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    // Nếu chuyển sang cancelled → hoàn lại stock
    if (status === 'cancelled' && order.status !== 'cancelled') {
      const details = await OrderDetail.find({ order_id: order.order_id });
      for (const detail of details) {
        await Product.findOneAndUpdate(
          { product_id: detail.product_id },
          { $inc: { stock: detail.quantity } }
        );
      }
    }

    // Nếu từ cancelled chuyển sang trạng thái khác → trừ lại stock
    if (order.status === 'cancelled' && status !== 'cancelled') {
      const details = await OrderDetail.find({ order_id: order.order_id });
      for (const detail of details) {
        await Product.findOneAndUpdate(
          { product_id: detail.product_id },
          { $inc: { stock: -detail.quantity } }
        );
      }
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { createOrder, getOrders, getAllOrders, getAllOrderDetails, getOrderDetails, updateOrderStatus };