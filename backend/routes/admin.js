const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAllRestaurants,
  verifyRestaurant,
  getAllOrders,
  createCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.get('/restaurants', getAllRestaurants);
router.put('/restaurants/:id/verify', verifyRestaurant);
router.get('/orders', getAllOrders);
router.post('/coupons', createCoupon);
router.get('/coupons', getCoupons);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

module.exports = router;
