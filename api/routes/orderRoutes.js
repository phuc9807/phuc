const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getAllOrders, getAllOrderDetails, updateOrderStatus, getOrderDetails } = require('../controllers/orderController');

router.post('/', createOrder);

// QUAN TRỌNG: /all và /details/all phải đặt TRƯỚC /:user_id
router.get('/all', getAllOrders);
router.get('/details/all', getAllOrderDetails);
router.put('/:order_id/status', updateOrderStatus);
router.get('/:order_id/details', getOrderDetails);
router.get('/:user_id', getOrders);

module.exports = router;