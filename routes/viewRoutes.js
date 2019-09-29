const express = require('express');

const viewsController = require('../controllers/viewsController')
const authController = require('../controllers/authController')
const bookingController = require('../controllers/bookingController');

const router = express.Router();

//router middle ware, now all the routes below will acquire this MW to check whether the user is logged in,
//because it is defined above all those routes.
// router.use(authController.isLoggedIn);

//home page
router.get('/', bookingController.createBookingCheckout, authController.isLoggedIn, viewsController.getOverview);
//individual tour details page
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
//login page
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
//my account page lec 193
//authController.isLoggedIn and authController.protect do certain things in a similar way
//so we place protect here and isLoggedIn on top 
router.get('/me', authController.protect, viewsController.getAccount);

//my booked tours
router.get('/my-tours', authController.protect, viewsController.getMyTours);


router.post(
    '/submit-user-data',
    authController.protect,//only to let logged in user change his data.
    viewsController.updateUserData
);

module.exports = router;
