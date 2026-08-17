const Reward = require('../models/Reward');
const User = require('../models/User');

// @desc    Get user rewards
// @route   GET /api/rewards
// @access  Private
exports.getUserRewards = async (req, res, next) => {
  try {
    const rewards = await Reward.find({ user: req.user.id })
      .populate('coupon', 'code discountValue validUntil')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: rewards.length,
      rewards
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user loyalty points
// @route   GET /api/rewards/points
// @access  Private
exports.getLoyaltyPoints = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('loyaltyPoints');

    res.status(200).json({
      success: true,
      loyaltyPoints: user.loyaltyPoints
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Redeem loyalty points
// @route   POST /api/rewards/redeem
// @access  Private
exports.redeemPoints = async (req, res, next) => {
  try {
    const { points } = req.body;

    const user = await User.findById(req.user.id);

    if (user.loyaltyPoints < points) {
      return res.status(400).json({ message: 'Insufficient loyalty points' });
    }

    user.loyaltyPoints -= points;
    user.wallet.balance += points;
    user.wallet.transactions.push({
      type: 'credit',
      amount: points,
      description: 'Loyalty points redeemed'
    });

    await user.save();

    res.status(200).json({
      success: true,
      loyaltyPoints: user.loyaltyPoints,
      walletBalance: user.wallet.balance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refer a friend
// @route   POST /api/rewards/referral
// @access  Private
exports.referFriend = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      referralCode: user.referralCode,
      referralLink: `${process.env.FRONTEND_URL}/referral/${user.referralCode}`
    });
  } catch (error) {
    next(error);
  }
};
