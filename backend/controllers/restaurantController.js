const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const Order = require('../models/Order');

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
exports.getRestaurants = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { isActive: true };

    // Filter by cuisine
    if (req.query.cuisine) {
      query.cuisine = { $in: req.query.cuisine.split(',') };
    }

    // Filter by price range
    if (req.query.priceRange) {
      query.priceRange = req.query.priceRange;
    }

    // Search by name
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }

    // Location-based search
    if (req.query.lat && req.query.lng && req.query.radius) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(req.query.lng), parseFloat(req.query.lat)]
          },
          $maxDistance: parseFloat(req.query.radius) * 1000
        }
      };
    }

    const restaurants = await Restaurant.find(query)
      .populate('categories', 'name')
      .skip(skip)
      .limit(limit)
      .sort('-rating.average');

    const total = await Restaurant.countDocuments(query);

    res.status(200).json({
      success: true,
      count: restaurants.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      restaurants
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single restaurant
// @route   GET /api/restaurants/:id
// @access  Public
exports.getRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('categories', 'name icon')
      .populate('owner', 'name phone');

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.status(200).json({
      success: true,
      restaurant
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create restaurant
// @route   POST /api/restaurants
// @access  Private/Restaurant Owner
exports.createRestaurant = async (req, res, next) => {
  try {
    req.body.owner = req.user.id;

    const restaurant = await Restaurant.create(req.body);

    res.status(201).json({
      success: true,
      restaurant
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private/Restaurant Owner
exports.updateRestaurant = async (req, res, next) => {
  try {
    let restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Check ownership
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this restaurant' });
    }

    restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      restaurant
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private/Restaurant Owner
exports.deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Check ownership
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this restaurant' });
    }

    await restaurant.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Restaurant deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get restaurant foods
// @route   GET /api/restaurants/:id/foods
// @access  Public
exports.getRestaurantFoods = async (req, res, next) => {
  try {
    const foods = await Food.find({
      restaurant: req.params.id,
      isAvailable: true
    }).populate('category', 'name');

    res.status(200).json({
      success: true,
      count: foods.length,
      foods
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get restaurant orders
// @route   GET /api/restaurants/:id/orders
// @access  Private/Restaurant Owner
exports.getRestaurantOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ restaurant: req.params.id })
      .populate('user', 'name phone')
      .populate('items.food', 'name price')
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

// @desc    Get restaurant stats
// @route   GET /api/restaurants/:id/stats
// @access  Private/Restaurant Owner
exports.getRestaurantStats = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const orders = await Order.find({ restaurant: req.params.id });
    const totalRevenue = orders.reduce((sum, order) => sum + order.pricing.total, 0);
    const completedOrders = orders.filter(order => order.status === 'delivered').length;

    res.status(200).json({
      success: true,
      stats: {
        totalOrders: orders.length,
        completedOrders,
        totalRevenue,
        rating: restaurant.rating,
        monthlyRevenue: restaurant.stats.monthlyRevenue
      }
    });
  } catch (error) {
    next(error);
  }
};
