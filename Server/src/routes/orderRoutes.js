const express = require('express');
const { createOrder, getOrders, getOrderById, cancelOrder } = require('../controllers/orderController');

const router = express.Router();

router.get('/', getOrders);
router.get('/:orderId', getOrderById);
router.post('/:orderId/cancel', cancelOrder);
router.post('/', createOrder);

module.exports = router;
