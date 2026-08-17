const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPayment,
  processRefund
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);
router.post('/refund/:orderId', protect, authorize('admin'), processRefund);

module.exports = router;
