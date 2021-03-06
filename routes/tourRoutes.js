//core modules

//3rd party modules
const express = require('express');

//My Custom Modules
const tourController = require('./../controllers/tourController');
const authController = require('../controllers/authController');
// const reviewController = require('../controllers/reviewController');
const reviewRouter = require('../routes/reviewRoutes');

const router = express.Router();//these have to be up here not below the route methods

//creating a router middle ware this middle ware has a 4th argument value, 
//This Middle ware will run only if there is a ID URL parameter
// router.param('id', (req, res, next, val) => {
//     console.log(`Tour ID is ${val} in tourRoutes.js`);
//     next();//if we dont call next the request will get stuck here and we will never get a response.
// });

//Implementing nested routes like these
//POST /tours/212345/reviews
//GET  /tours/212345/reviews
//GET  /tours/212345/reviews/1092837

// router
// .route('/:tourId/reviews')
// .post(authController.protect, authController.restrictTo('user'), reviewController.createReview);
//router is also a MW so we can use .use on it //simplifying the code above below
router.use('/:tourId/reviews', reviewRouter);

//ALIASING
router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);

//AGGREGATION
router.route('/tour-stats').get(tourController.getTourStats);

//UNWINDING
router.route('/monthly-plan/:year').get(authController.protect, authController.restrictTo('admin', 'lead-guide', 'guide'), tourController.getMonthlyPlan);

// router.param('id', tourController.checkID);
//geo spatioal queries lec - 170
//can do it like this also - /tours-within?distance=100&center=1112222&unit=km , but the method below is cleaner
///tours-within/250/center/45,23/unit/miles
router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin);

//lec - 171 using geo spatial aggregation to calculate the distance to a tour from a certain point
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
.route('/')
.get(tourController.getAllTours)
.post(/*tourController.checkBody, */authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.createTour);

router
.route('/:id')
.get(tourController.getTour)
.patch(authController.protect, 
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages, 
    tourController.updateTour
)
.delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour);


module.exports = router;