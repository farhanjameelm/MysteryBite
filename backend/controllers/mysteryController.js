const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const MysteryChallenge = require('../models/MysteryChallenge');
const Reward = require('../models/Reward');
const Coupon = require('../models/Coupon');
const User = require('../models/User');

// @desc    Get mystery mode details for restaurant
// @route   GET /api/mystery/restaurant/:restaurantId
// @access  Private
exports.getMysteryDetails = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    
    if (!restaurant || !restaurant.mysteryMode.enabled) {
      return res.status(404).json({ message: 'Mystery mode not available for this restaurant' });
    }

    res.status(200).json({
      success: true,
      enabled: true,
      availableCategories: restaurant.mysteryMode.availableCategories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create mystery challenge order
// @route   POST /api/mystery/order
// @access  Private
exports.createMysteryOrder = async (req, res, next) => {
  try {
    const { restaurantId, orderedFoodId, deliveryAddress, paymentMethod } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant || !restaurant.mysteryMode.enabled) {
      return res.status(404).json({ message: 'Mystery mode not available' });
    }

    const orderedFood = await Food.findById(orderedFoodId);
    if (!orderedFood) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Get random food from same category
    const categoryFoods = await Food.find({
      restaurant: restaurantId,
      category: orderedFood.category,
      _id: { $ne: orderedFoodId },
      isAvailable: true
    });

    if (categoryFoods.length === 0) {
      return res.status(400).json({ message: 'Not enough foods in this category for mystery mode' });
    }

    const deliveredFood = categoryFoods[Math.floor(Math.random() * categoryFoods.length)];

    // Create order
    const order = await Order.create({
      user: req.user.id,
      restaurant: restaurantId,
      items: [{
        food: orderedFood._id,
        name: orderedFood.name,
        quantity: 1,
        price: orderedFood.price
      }],
      deliveryAddress,
      paymentMethod,
      orderType: 'mystery',
      pricing: {
        subtotal: orderedFood.price,
        deliveryFee: restaurant.deliveryInfo.fee,
        tax: orderedFood.price * 0.05,
        discount: 0,
        couponDiscount: 0,
        total: orderedFood.price + restaurant.deliveryInfo.fee + (orderedFood.price * 0.05)
      },
      mysteryChallenge: {
        orderedFood: orderedFood._id,
        deliveredFood: deliveredFood._id
      },
      orderTimeline: [{
        status: 'pending',
        timestamp: new Date(),
        note: 'Mystery challenge order placed'
      }],
      estimatedDeliveryTime: restaurant.deliveryInfo.time
    });

    // Create mystery challenge
    const challenge = await MysteryChallenge.create({
      user: req.user.id,
      order: order._id,
      restaurant: restaurantId,
      orderedFood: orderedFood._id,
      orderedFoodName: orderedFood.name,
      deliveredFood: deliveredFood._id,
      deliveredFoodName: deliveredFood.name,
      options: [orderedFood, ...categoryFoods.slice(0, 3)]
    });

    res.status(201).json({
      success: true,
      order,
      challengeId: challenge._id
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit mystery challenge guess
// @route   POST /api/mystery/guess
// @access  Private
exports.submitGuess = async (req, res, next) => {
  try {
    const { challengeId, guessedFoodId, timeTaken } = req.body;

    const challenge = await MysteryChallenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    if (challenge.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (challenge.userGuess) {
      return res.status(400).json({ message: 'Already submitted guess' });
    }

    const isCorrect = challenge.deliveredFood.toString() === guessedFoodId;
    const order = await Order.findById(challenge.order);

    let reward = null;
    let rewardValue = 0;

    if (isCorrect) {
      // Calculate reward based on order size and streak
      const orderValue = order.pricing.total;
      const user = await User.findById(req.user.id);
      
      // Get current streak
      const recentChallenges = await MysteryChallenge.find({
        user: req.user.id,
        isCorrect: true,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }).sort('-createdAt');

      const streak = recentChallenges.length;
      challenge.streak = streak + 1;

      // Calculate reward
      rewardValue = Math.floor(orderValue * 0.1 * (1 + streak * 0.1)); // 10% base + streak bonus

      // Create coupon reward
      const coupon = await Coupon.create({
        code: `MYSTERY${Date.now().toString(36).toUpperCase()}`,
        description: 'Mystery Challenge Reward',
        discountType: 'flat',
        discountValue: rewardValue,
        minOrderValue: Math.floor(orderValue * 0.5),
        usageLimit: 1,
        userLimit: 1,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        applicableUsers: [req.user.id],
        isActive: true
      });

      reward = await Reward.create({
        user: req.user.id,
        type: 'coupon',
        value: rewardValue,
        description: `Mystery challenge correct guess! Streak: ${streak + 1}`,
        source: 'mystery_challenge',
        sourceId: challenge._id,
        coupon: coupon._id,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });

      // Update order
      order.mysteryChallenge.userGuess = guessedFoodId;
      order.mysteryChallenge.isCorrect = true;
      order.mysteryChallenge.rewardEarned = reward._id;
      await order.save();
    }

    challenge.userGuess = guessedFoodId;
    challenge.isCorrect = isCorrect;
    challenge.timeTaken = timeTaken;
    challenge.reward = reward?._id;
    challenge.rewardType = reward ? 'coupon' : null;
    challenge.rewardValue = rewardValue;
    await challenge.save();

    res.status(200).json({
      success: true,
      isCorrect,
      deliveredFood: challenge.deliveredFood,
      reward,
      rewardValue,
      streak: challenge.streak
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get mystery challenge history
// @route   GET /api/mystery/history
// @access  Private
exports.getMysteryHistory = async (req, res, next) => {
  try {
    const history = await MysteryChallenge.find({ user: req.user.id })
      .populate('restaurant', 'name image')
      .populate('orderedFood', 'name image')
      .populate('deliveredFood', 'name image')
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

// @desc    Get leaderboard
// @route   GET /api/mystery/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res, next) => {
  try {
    const leaderboard = await MysteryChallenge.aggregate([
      {
        $match: { isCorrect: true }
      },
      {
        $group: {
          _id: '$user',
          totalCorrect: { $sum: 1 },
          totalStreak: { $max: '$streak' },
          totalReward: { $sum: '$rewardValue' }
        }
      },
      {
        $sort: { totalCorrect: -1, totalStreak: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          'user.name': 1,
          'user.avatar': 1,
          totalCorrect: 1,
          totalStreak: 1,
          totalReward: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      leaderboard
    });
  } catch (error) {
    next(error);
  }
};
