const express = require('express');
const router = express.Router();
const {
  getSpinDetails,
  spinWheel,
  getSpinHistory
} = require('../controllers/spinController');
const { protect } = require('../middleware/auth');

router.route('/restaurant/:restaurantId').get(protect, getSpinDetails);
router.route('/').post(protect, spinWheel);
router.route('/history').get(protect, getSpinHistory);

module.exports = router;
