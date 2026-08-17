const mongoose = require('mongoose');

const mysteryChallengeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  orderedFood: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true
  },
  orderedFoodName: String,
  deliveredFood: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true
  },
  deliveredFoodName: String,
  options: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food'
  }],
  userGuess: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food'
  },
  isCorrect: {
    type: Boolean
  },
  timeTaken: {
    type: Number
  },
  reward: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reward'
  },
  rewardType: {
    type: String,
    enum: ['discount', 'points', 'cashback', 'free_delivery']
  },
  rewardValue: {
    type: Number
  },
  streak: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MysteryChallenge', mysteryChallengeSchema);
