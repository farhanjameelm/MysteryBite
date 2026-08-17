const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  items: [{
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
      required: true
    },
    name: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    customizations: [{
      name: String,
      option: String,
      price: Number
    }]
  }],
  orderType: {
    type: String,
    enum: ['safe', 'spin', 'mystery'],
    required: true,
    default: 'safe'
  },
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'wallet', 'cod'],
    required: true
  },
  paymentDetails: {
    paymentId: String,
    orderId: String,
    signature: String,
    status: String
  },
  pricing: {
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponDiscount: { type: Number, default: 0 },
    total: { type: Number, required: true }
  },
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  orderTimeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }],
  deliveryPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  estimatedDeliveryTime: {
    type: String
  },
  actualDeliveryTime: {
    type: Date
  },
  specialInstructions: String,
  rating: {
    food: { type: Number, min: 1, max: 5 },
    delivery: { type: Number, min: 1, max: 5 },
    overall: { type: Number, min: 1, max: 5 },
    review: String
  },
  // Spin mode specific
  spinResult: {
    spunFood: { type: mongoose.Schema.Types.ObjectId, ref: 'Food' },
    spinPrice: Number
  },
  // Mystery mode specific
  mysteryChallenge: {
    orderedFood: { type: mongoose.Schema.Types.ObjectId, ref: 'Food' },
    deliveredFood: { type: mongoose.Schema.Types.ObjectId, ref: 'Food' },
    userGuess: { type: mongoose.Schema.Types.ObjectId, ref: 'Food' },
    isCorrect: Boolean,
    rewardEarned: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reward'
    }
  },
  loyaltyPointsEarned: {
    type: Number,
    default: 0
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  cancellationReason: String,
  refundAmount: Number,
  refundStatus: {
    type: String,
    enum: ['pending', 'processed', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
