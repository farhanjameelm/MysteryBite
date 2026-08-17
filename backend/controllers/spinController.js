const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const SpinHistory = require('../models/SpinHistory');
const User = require('../models/User');

// @desc    Get spin mode details for restaurant
// @route   GET /api/spin/restaurant/:restaurantId
// @access  Private
exports.getSpinDetails = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId)
      .populate('spinMode.availableItems', 'name image price');

    if (!restaurant || !restaurant.spinMode.enabled) {
      return res.status(404).json({ message: 'Spin mode not available for this restaurant' });
    }

    res.status(200).json({
      success: true,
      spinPrice: restaurant.spinMode.spinPrice,
      availableItems: restaurant.spinMode.availableItems,
      probabilities: restaurant.spinMode.probabilities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Spin the wheel
// @route   POST /api/spin
// @access  Private
exports.spinWheel = async (req, res, next) => {
  try {
    const { restaurantId, deliveryAddress, paymentMethod } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant || !restaurant.spinMode.enabled) {
      return res.status(404).json({ message: 'Spin mode not available' });
    }

    // Get available items
    const availableItems = await Food.find({
      _id: { $in: restaurant.spinMode.availableItems },
      isAvailable: true
    });

    if (availableItems.length === 0) {
      return res.status(400).json({ message: 'No items available for spin' });
    }

    // Calculate weighted random selection
    let totalWeight = 0;
    const weightedItems = availableItems.map(item => {
      const probability = restaurant.spinMode.probabilities.find(
        p => p.foodId.toString() === item._id.toString()
      )?.probability || 10;
      totalWeight += probability;
      return { item, probability, weight: totalWeight };
    });

    const random = Math.random() * totalWeight;
    let selectedItem = weightedItems[0].item;

    for (const weighted of weightedItems) {
      if (random <= weighted.weight) {
        selectedItem = weighted.item;
        break;
      }
    }

    const savings = selectedItem.price - restaurant.spinMode.spinPrice;

    // Create order
    const order = await Order.create({
      user: req.user.id,
      restaurant: restaurantId,
      items: [{
        food: selectedItem._id,
        name: selectedItem.name,
        quantity: 1,
        price: restaurant.spinMode.spinPrice
      }],
      deliveryAddress,
      paymentMethod,
      orderType: 'spin',
      pricing: {
        subtotal: restaurant.spinMode.spinPrice,
        deliveryFee: restaurant.deliveryInfo.fee,
        tax: restaurant.spinMode.spinPrice * 0.05,
        discount: 0,
        couponDiscount: 0,
        total: restaurant.spinMode.spinPrice + restaurant.deliveryInfo.fee + (restaurant.spinMode.spinPrice * 0.05)
      },
      spinResult: {
        spunFood: selectedItem._id,
        spinPrice: restaurant.spinMode.spinPrice
      },
      orderTimeline: [{
        status: 'pending',
        timestamp: new Date(),
        note: 'Spin order placed'
      }],
      estimatedDeliveryTime: restaurant.deliveryInfo.time
    });

    // Save spin history
    await SpinHistory.create({
      user: req.user.id,
      restaurant: restaurantId,
      order: order._id,
      spinPrice: restaurant.spinMode.spinPrice,
      spunFood: selectedItem._id,
      foodName: selectedItem.name,
      foodPrice: selectedItem.price,
      savings: savings > 0 ? savings : 0
    });

    // Emit socket event
    const io = req.app.get('io');
    io.to(`order-${order._id}`).emit('spin-result', {
      order,
      spunFood: selectedItem,
      savings
    });

    res.status(201).json({
      success: true,
      order,
      spunFood: selectedItem,
      savings: savings > 0 ? savings : 0
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user spin history
// @route   GET /api/spin/history
// @access  Private
exports.getSpinHistory = async (req, res, next) => {
  try {
    const history = await SpinHistory.find({ user: req.user.id })
      .populate('restaurant', 'name image')
      .populate('spunFood', 'name image')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    next(error);
  }
};
