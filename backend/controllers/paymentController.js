const Razorpay = require('razorpay');
const Order = require('../models/Order');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount, currency } = req.body;

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: currency || 'INR',
      receipt: `order_${Date.now()}`,
      payment_capture: 1
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.status(201).json({
      success: true,
      order: razorpayOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res, next) => {
  try {
    const { orderId, paymentId, signature, dbOrderId } = req.body;

    // Verify signature
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${orderId}|${paymentId}`);
    const digest = shasum.digest('hex');

    if (digest !== signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Update order
    const order = await Order.findById(dbOrderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.paymentDetails = {
      paymentId,
      orderId,
      signature,
      status: 'captured'
    };
    order.isPaid = true;
    order.status = 'confirmed';
    order.orderTimeline.push({
      status: 'confirmed',
      timestamp: new Date(),
      note: 'Payment verified'
    });

    await order.save();

    // Emit socket event
    const io = req.app.get('io');
    io.to(`order-${order._id}`).emit('payment-verified', order);

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process refund
// @route   POST /api/payments/refund/:orderId
// @access  Private/Admin
exports.processRefund = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.paymentDetails.paymentId) {
      return res.status(400).json({ message: 'No payment found for this order' });
    }

    const refund = await razorpay.payments.refund(order.paymentDetails.paymentId, {
      amount: order.pricing.total * 100
    });

    order.refundAmount = order.pricing.total;
    order.refundStatus = 'processed';
    await order.save();

    res.status(200).json({
      success: true,
      refund
    });
  } catch (error) {
    next(error);
  }
};
