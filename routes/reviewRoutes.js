//core modules

//3rd party modules
const express = require('express');

//My Custom Modules
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({
    //POST /tours/212345/reviews
    mergeParams: true//to get access to the /:tourId from the route('/:tourId/reviews') 
});//these have to be up here not below the route methods


router
.route('/')
.get(reviewController.getAllReviews)
.post(authController.protect, authController.restrictTo('user'), reviewController.createReview);
// .patch(reviewController.updateReview)
// .delete(reviewController.deleteReview);

module.exports = router;