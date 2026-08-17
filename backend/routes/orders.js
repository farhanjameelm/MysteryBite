const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  rateOrder
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getOrders)
  .post(protect, createOrder);

router.route('/:id')
  .get(protect, getOrder);

router.route('/:id/status')
  .put(protect, updateOrderStatus);

router.route('/:id/cancel')
  .put(protect, cancelOrder);

router.route('/:id/rate')
  .post(protect, rateOrder);

module.exports = router;
