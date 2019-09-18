//core modules
//const fs = require('fs');

//models
const Review = require('../models/reviewModel');

//utils
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//controllers
const factory = require('./handlerFactory');

exports.getAllReviews = catchAsync(async (req, res, next) => {

        let filter = {};
        if (req.params.tourId) filter = { tour: req.params.tourId };
        const reviews = await Review.find(filter);

        if(!reviews){
            //when next receives anything it will jump directly into the global error handling MW
            return next(new AppError('No reviews were found for that tour', 404));
        }

        res.status(200).json(
            {
            status: 'success', 
            data: {
                reviews: reviews
            }
        });

});

exports.setTourUserIds = (req, res, next) => {
    //allow nested routes
    //Implementing nested routes like these
    //POST /tours/212345/reviews
    if (!req.body.tour) req.body.tour = req.params.tourId;//get the tourId from the url
    if (!req.body.user) req.body.user = req.user.id;//get the userId
    next();
}

exports.createReview = factory.createOne(Review);
// exports.createReview = catchAsync(async (req, res, next) => {
//     // //allow nested routes
//     // //Implementing nested routes like these
//     // //POST /tours/212345/reviews
//     // if (!req.body.tour) req.body.tour = req.params.tourId;//get the tourId from the url
//     // if (!req.body.user) req.body.user = req.user.id;//get the userId

//     const newReview = await Review.create(req.body);

//     res.status(201).json({
//         status: 'success',
//         data: {
//             review: newReview
//         }
//     });

// });

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);