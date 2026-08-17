const Order = require('../models/Order');
const Food = require('../models/Food');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const Coupon = require('../models/Coupon');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const {
      items,
      restaurant,
      deliveryAddress,
      paymentMethod,
      orderType,
      couponCode,
      specialInstructions
    } = req.body;

    // Validate restaurant
    const restaurantDoc = await Restaurant.findById(restaurant);
    if (!restaurantDoc) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Calculate pricing
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const food = await Food.findById(item.food);
      if (!food) {
        return res.status(404).json({ message: `Food not found: ${item.food}` });
      }

      if (!food.isAvailable) {
        return res.status(400).json({ message: `${food.name} is not available` });
      }

      const itemTotal = food.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        food: food._id,
        name: food.name,
        quantity: item.quantity,
        price: food.price,
        customizations: item.customizations || []
      });

      // Update food orders count
      food.ordersCount += item.quantity;
      await food.save();
    }

    // Check minimum order value
    if (subtotal < restaurantDoc.deliveryInfo.minimumOrder) {
      return res.status(400).json({
        message: `Minimum order value is ${restaurantDoc.deliveryInfo.minimumOrder}`
      });
    }

    // Calculate delivery fee
    const deliveryFee = restaurantDoc.deliveryInfo.fee;
    const tax = subtotal * 0.05; // 5% tax

    // Apply coupon if provided
    let couponDiscount = 0;
    let coupon = null;

    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() }
      });

      if (coupon) {
        if (coupon.minOrderValue > subtotal) {
          return res.status(400).json({
            message: `Minimum order value for this coupon is ${coupon.minOrderValue}`
          });
        }

        if (coupon.discountType === 'percentage') {
          couponDiscount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscount && couponDiscount > coupon.maxDiscount) {
            couponDiscount = coupon.maxDiscount;
          }
        } else if (coupon.discountType === 'flat') {
          couponDiscount = coupon.discountValue;
        } else if (coupon.discountType === 'free_delivery') {
          couponDiscount = deliveryFee;
        }

        coupon.usedCount++;
        await coupon.save();
      }
    }

    const total = subtotal + deliveryFee + tax - couponDiscount;

    // Create order
    const order = await Order.create({
      user: req.user.id,
      restaurant,
      items: orderItems,
      deliveryAddress,
      paymentMethod,
      orderType: orderType || 'safe',
      coupon: coupon?._id,
      pricing: {
        subtotal,
        deliveryFee,
        tax,
        discount: 0,
        couponDiscount,
        total
      },
      specialInstructions,
      orderTimeline: [{
        status: 'pending',
        timestamp: new Date(),
        note: 'Order placed'
      }],
      estimatedDeliveryTime: restaurantDoc.deliveryInfo.time
    });

    // Emit socket event
    const io = req.app.get('io');
    io.to(`order-${order._id}`).emit('order-created', order);

    res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin/Restaurant Owner)
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'customer') {
      query.user = req.user.id;
    } else if (req.user.role === 'restaurant_owner') {
      const restaurants = await Restaurant.find({ owner: req.user.id }).select('_id');
      query.restaurant = { $in: restaurants.map(r => r._id) };
    }

    const orders = await Order.find(query)
      .populate('user', 'name phone email')
      .populate('restaurant', 'name image')
      .populate('items.food', 'name image')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name phone email address')
      .populate('restaurant', 'name image address contact')
      .populate('items.food', 'name image description')
      .populate('coupon', 'code discountValue');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization
    if (order.user._id.toString() !== req.user.id && 
        order.restaurant.owner?.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Restaurant Owner
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify restaurant ownership
    const restaurant = await Restaurant.findById(order.restaurant);
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    order.status = status;
    order.orderTimeline.push({
      status,
      timestamp: new Date(),
      note: note || `Order status updated to ${status}`
    });

    if (status === 'delivered') {
      order.actualDeliveryTime = new Date();
      
      // Update restaurant stats
      restaurant.stats.totalOrders++;
      restaurant.stats.totalRevenue += order.pricing.total;
      await restaurant.save();

      // Award loyalty points to user
      const user = await User.findById(order.user);
      user.loyaltyPoints += Math.floor(order.pricing.total / 10);
      await user.save();

      order.loyaltyPointsEarned = Math.floor(order.pricing.total / 10);
    }

    await order.save();

    // Emit socket event
    const io = req.app.get('io');
    io.to(`order-${order._id}`).emit('order-updated', order);

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    }

    // Check authorization
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    order.status = 'cancelled';
    order.cancellationReason = reason;
    order.orderTimeline.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: reason || 'Order cancelled by user'
    });

    await order.save();

    // Emit socket event
    const io = req.app.get('io');
    io.to(`order-${order._id}`).emit('order-cancelled', order);

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rate order
// @route   POST /api/orders/:id/rate
// @access  Private
exports.rateOrder = async (req, res, next) => {
  try {
    const { food, delivery, overall, review } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to rate this order' });
    }

    // Check if order is delivered
    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Order must be delivered to rate' });
    }

    order.rating = {
      food: food || 0,
      delivery: delivery || 0,
      overall: overall || 0,
      review
    };

    await order.save();

    // Update restaurant rating
    const restaurant = await Restaurant.findById(order.restaurant);
    const deliveredOrders = await Order.countDocuments({
      restaurant: order.restaurant,
      status: 'delivered',
      'rating.overall': { $exists: true }
    });

    const totalRating = await Order.aggregate([
      { $match: { restaurant: order.restaurant, status: 'delivered', 'rating.overall': { $exists: true } } },
      { $group: { _id: null, avgRating: { $avg: '$rating.overall' } } }
    ]);

    restaurant.rating.average = totalRating[0]?.avgRating || 0;
    restaurant.rating.count = deliveredOrders;
    await restaurant.save();

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};
