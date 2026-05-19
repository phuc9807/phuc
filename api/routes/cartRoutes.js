const express = require('express');
const router = express.Router();
const { getCart, addToCart, removeFromCart, updateCartItem } = require('../controllers/cartController');

router.get('/:user_id', getCart);
router.post('/', addToCart);
router.delete('/:cart_item_id', removeFromCart);
router.put('/:cart_item_id', updateCartItem);

module.exports = router;