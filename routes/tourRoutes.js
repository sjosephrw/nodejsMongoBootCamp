//core modules

//3rd party modules
const express = require('express');

//My Custom Modules
const tourController = require('./../controllers/tourController');
const authController = require('../controllers/authController');

const router = express.Router();//these have to be up here not below the route methods

//creating a router middle ware this middle ware has a 4th argument value, 
//This Middle ware will run only if there is a ID URL parameter
// router.param('id', (req, res, next, val) => {
//     console.log(`Tour ID is ${val} in tourRoutes.js`);
//     next();//if we dont call next the request will get stuck here and we will never get a response.
// });

//ALIASING
router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);

//AGGREGATION
router.route('/tour-stats').get(tourController.getTourStats);

//UNWINDING
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

// router.param('id', tourController.checkID);

router
.route('/')
.get(authController.protect, tourController.getAllTours)
.post(/*tourController.checkBody, */tourController.createTour);

router
.route('/:id')
.get(tourController.getTour)
.patch(tourController.updateTour)
.delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour);

module.exports = router;