const express = require('express');
const { 
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  acceptOrder,
  addFeedback,
  getAvailableOrders,
  getOrderTimeline
} = require('../controllers/order.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Wszystkie trasy wymagają uwierzytelnienia
router.use(protect);

// Trasy dla wszystkich użytkowników
router.route('/')
  .get(getOrders)
  .post(authorize('client'), createOrder);

router.route('/available')
  .get(authorize('booster'), getAvailableOrders);

router.route('/:id')
  .get(getOrder)
  .put(updateOrder);

router.route('/:id/accept')
  .post(authorize('booster'), acceptOrder);

router.route('/:id/feedback')
  .post(authorize('client'), addFeedback);

router.route('/:id/timeline')
  .get(getOrderTimeline);

module.exports = router;