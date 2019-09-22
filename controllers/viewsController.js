const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync ( async (req, res, next) => {
    //1. GET TOURS
    const tours = await Tour.find();
    //2. BUILD TEMPLATE

    //3. RENDER TEMPLATE WITH TOURS DATA

    res.status(200).render('overview', {
        title: 'Overview - Exciting tours for adventurous people.',
        tours: tours
    });
});

exports.getTour = catchAsync ( async  (req, res, next) => {

    //get tour data, reviews and guides 

    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    res.status(200).render('tour', {
        title: tour.name,
        tour: tour

    });
});