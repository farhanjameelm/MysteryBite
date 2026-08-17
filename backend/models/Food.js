const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide food name'],
    trim: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  images: [String],
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  dietary: [{
    type: String,
    enum: ['vegetarian', 'non-vegetarian', 'vegan', 'gluten-free', 'dairy-free']
  }],
  spiceLevel: {
    type: String,
    enum: ['mild', 'medium', 'spicy', 'extra-spicy'],
    default: 'medium'
  },
  ingredients: [String],
  allergens: [String],
  nutritionInfo: {
    calories: Number,
    protein: String,
    carbs: String,
    fat: String,
    fiber: String
  },
  servingSize: {
    type: String,
    default: '1 serving'
  },
  preparationTime: {
    type: String,
    default: '15-20 mins'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isRecommended: {
    type: Boolean,
    default: false
  },
  tags: [String],
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  ordersCount: {
    type: Number,
    default: 0
  },
  customizations: [{
    name: String,
    options: [{
      name: String,
      price: Number
    }]
  }],
  spinWeight: {
    type: Number,
    default: 1
  },
  mysteryCategory: {
    type: String
  }
}, {
  timestamps: true
});

// Index for search
foodSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Food', foodSchema);
