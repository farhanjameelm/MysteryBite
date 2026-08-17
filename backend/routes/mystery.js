const express = require('express');
const router = express.Router();
const {
  getMysteryDetails,
  createMysteryOrder,
  submitGuess,
  getMysteryHistory,
  getLeaderboard
} = require('../controllers/mysteryController');
const { protect } = require('../middleware/auth');

router.route('/restaurant/:restaurantId').get(protect, getMysteryDetails);
router.route('/order').post(protect, createMysteryOrder);
router.route('/guess').post(protect, submitGuess);
router.route('/history').get(protect, getMysteryHistory);
router.route('/leaderboard').get(getLeaderboard);

module.exports = router;
