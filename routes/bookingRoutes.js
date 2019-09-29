//core modules

//3rd party modules
const express = require('express');

//My Custom Modules
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();//these have to be up here not below the route methods

// router.get('/checkout-session/:tourId', authController.protect, bookingController.getCheckoutSession);
router.use(authController.protect);

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);


module.exports = router;