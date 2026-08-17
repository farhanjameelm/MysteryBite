const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide restaurant name'],
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: 'default-restaurant.jpg'
  },
  coverImage: {
    type: String
  },
  cuisine: [{
    type: String,
    required: true
  }],
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  contact: {
    phone: { type: String, required: true },
    email: { type: String },
    website: String
  },
  timings: {
    open: { type: String, required: true },
    close: { type: String, required: true },
    isOpen: { type: Boolean, default: true }
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  priceRange: {
    type: String,
    enum: ['$', '$$', '$$$', '$$$$'],
    default: '$$'
  },
  deliveryInfo: {
    time: { type: String, default: '30-45 mins' },
    fee: { type: Number, default: 2.99 },
    minimumOrder: { type: Number, default: 10 }
  },
  features: [{
    type: String,
    enum: ['veg-only', 'non-veg', 'delivery', 'takeout', 'dine-in', 'pet-friendly', 'wifi', 'parking']
  }],
  spinMode: {
    enabled: { type: Boolean, default: true },
    spinPrice: { type: Number, default: 15 },
    availableItems: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food'
    }],
    probabilities: [{
      foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food' },
      probability: { type: Number, default: 10 }
    }]
  },
  mysteryMode: {
    enabled: { type: Boolean, default: true },
    availableCategories: [String]
  },
  stats: {
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    monthlyRevenue: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  documents: {
    fssaiLicense: String,
    gstNumber: String,
    panNumber: String
  }
}, {
  timestamps: true
});

// Create geospatial index for location-based queries
restaurantSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Restaurant', restaurantSchema);
