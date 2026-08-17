const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['points', 'discount', 'cashback', 'free_delivery', 'coupon'],
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  source: {
    type: String,
    enum: ['order', 'referral', 'mystery_challenge', 'daily_challenge', 'spin', 'signup'],
    required: true
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon'
  },
  expiryDate: {
    type: Date
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  usedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Reward', rewardSchema);
