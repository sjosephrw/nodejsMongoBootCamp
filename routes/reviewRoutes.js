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

router.use(authController.protect);

router
.route('/')
.get(reviewController.getAllReviews)
.post(/*authController.protect,*/ authController.restrictTo('user'), reviewController.setTourUserIds, reviewController.createReview);
// .patch(reviewController.updateReview)

router.route('/:id')
.get(reviewController.getReview)
.patch(authController.restrictTo('user', 'admin'), reviewController.updateReview)
.delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview);

module.exports = router;