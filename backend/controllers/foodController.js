const Food = require('../models/Food');
const Restaurant = require('../models/Restaurant');

// @desc    Get all foods
// @route   GET /api/foods
// @access  Public
exports.getFoods = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { isAvailable: true };

    // Filter by restaurant
    if (req.query.restaurant) {
      query.restaurant = req.query.restaurant;
    }

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by dietary
    if (req.query.dietary) {
      query.dietary = { $in: req.query.dietary.split(',') };
    }

    // Search
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Sort options
    let sort = {};
    if (req.query.sort === 'price-asc') sort = { price: 1 };
    else if (req.query.sort === 'price-desc') sort = { price: -1 };
    else if (req.query.sort === 'rating') sort = { 'rating.average': -1 };
    else if (req.query.sort === 'popular') sort = { ordersCount: -1 };
    else sort = { createdAt: -1 };

    const foods = await Food.find(query)
      .populate('restaurant', 'name image rating deliveryInfo')
      .populate('category', 'name')
      .skip(skip)
      .limit(limit)
      .sort(sort);

    const total = await Food.countDocuments(query);

    res.status(200).json({
      success: true,
      count: foods.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      foods
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single food
// @route   GET /api/foods/:id
// @access  Public
exports.getFood = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id)
      .populate('restaurant', 'name image rating deliveryInfo address')
      .populate('category', 'name');

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    res.status(200).json({
      success: true,
      food
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create food
// @route   POST /api/foods
// @access  Private/Restaurant Owner
exports.createFood = async (req, res, next) => {
  try {
    // Verify restaurant ownership
    const restaurant = await Restaurant.findById(req.body.restaurant);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to add food to this restaurant' });
    }

    const food = await Food.create(req.body);

    res.status(201).json({
      success: true,
      food
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update food
// @route   PUT /api/foods/:id
// @access  Private/Restaurant Owner
exports.updateFood = async (req, res, next) => {
  try {
    let food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Verify restaurant ownership
    const restaurant = await Restaurant.findById(food.restaurant);
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this food' });
    }

    food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      food
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete food
// @route   DELETE /api/foods/:id
// @access  Private/Restaurant Owner
exports.deleteFood = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Verify restaurant ownership
    const restaurant = await Restaurant.findById(food.restaurant);
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this food' });
    }

    await food.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Food deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get popular foods
// @route   GET /api/foods/popular
// @access  Public
exports.getPopularFoods = async (req, res, next) => {
  try {
    const foods = await Food.find({ isAvailable: true, isPopular: true })
      .populate('restaurant', 'name image')
      .populate('category', 'name')
      .limit(20)
      .sort('-ordersCount');

    res.status(200).json({
      success: true,
      count: foods.length,
      foods
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recommended foods
// @route   GET /api/foods/recommended
// @access  Private
exports.getRecommendedFoods = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Get user preferences
    const dietary = user.preferences?.dietary || [];
    const cuisines = user.preferences?.cuisines || [];

    const query = { isAvailable: true };
    
    if (dietary.length > 0) {
      query.dietary = { $in: dietary };
    }

    const foods = await Food.find(query)
      .populate('restaurant', 'name image cuisine')
      .populate('category', 'name')
      .limit(20)
      .sort('-rating.average');

    res.status(200).json({
      success: true,
      count: foods.length,
      foods
    });
  } catch (error) {
    next(error);
  }
};
