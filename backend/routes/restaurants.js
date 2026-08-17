const express = require('express');
const router = express.Router();
const {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantFoods,
  getRestaurantOrders,
  getRestaurantStats
} = require('../controllers/restaurantController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getRestaurants)
  .post(protect, authorize('restaurant_owner', 'admin'), createRestaurant);

router.route('/:id')
  .get(getRestaurant)
  .put(protect, authorize('restaurant_owner', 'admin'), updateRestaurant)
  .delete(protect, authorize('restaurant_owner', 'admin'), deleteRestaurant);

router.route('/:id/foods').get(getRestaurantFoods);
router.route('/:id/orders').get(protect, authorize('restaurant_owner', 'admin'), getRestaurantOrders);
router.route('/:id/stats').get(protect, authorize('restaurant_owner', 'admin'), getRestaurantStats);

module.exports = router;
