const express = require('express');
const router = express.Router();
const {
  getUserRewards,
  getLoyaltyPoints,
  redeemPoints,
  referFriend
} = require('../controllers/rewardController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getUserRewards);
router.get('/points', getLoyaltyPoints);
router.post('/redeem', redeemPoints);
router.post('/referral', referFriend);

module.exports = router;
