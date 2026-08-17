const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  getUserOrders,
  getWallet,
  addToWallet
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/').get(authorize('admin'), getUsers);
router.route('/wishlist').post(addToWishlist).get(getWishlist);
router.route('/wishlist/:foodId').delete(removeFromWishlist);
router.route('/orders').get(getUserOrders);
router.route('/wallet').get(getWallet).post(addToWallet);
router.route('/:id').get(getUser).put(updateUser).delete(authorize('admin'), deleteUser);

module.exports = router;
