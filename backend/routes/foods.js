const express = require('express');
const router = express.Router();
const {
  getFoods,
  getFood,
  createFood,
  updateFood,
  deleteFood,
  getPopularFoods,
  getRecommendedFoods
} = require('../controllers/foodController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getFoods)
  .post(protect, authorize('restaurant_owner', 'admin'), createFood);

router.route('/popular').get(getPopularFoods);
router.route('/recommended').get(protect, getRecommendedFoods);

router.route('/:id')
  .get(getFood)
  .put(protect, authorize('restaurant_owner', 'admin'), updateFood)
  .delete(protect, authorize('restaurant_owner', 'admin'), deleteFood);

module.exports = router;
