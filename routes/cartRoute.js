const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const auth = require('../auth');
const { verify , verifyAdmin } = auth;

router.get('/get-cart', verify, cartController.getUserCart);
router.post('/add-to-cart', verify, cartController.addToCart);
router.patch('/update-cart-quantity', verify, cartController.updateCartQuantity);

module.exports = router;