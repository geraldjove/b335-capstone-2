const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../auth');
const { verify , verifyAdmin } = auth;

router.post('/checkout', verify, orderController.userCheckout);
router.post('/my-orders', verify, orderController.getUserOrders);
router.get('/all-orders', verify, verifyAdmin, orderController.getAllOrders);

module.exports = router;