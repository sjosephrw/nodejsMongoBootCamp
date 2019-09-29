//Models
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');

//utils
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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

    if (!tour){
        return next(new AppError('There is no tour with that name', 404));
    }

    res.status(200).render('tour', {
        title: `${tour.name} tour`,
        tour: tour

    });
});

//if we are using async functions wrapped in catchAsync we must use a next parameter
exports.getLoginForm = (req, res) => {

    res.status(200).render('login', {
        title: `Log into your account`
    });
};

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: `Your account.`
    });
};

exports.getMyTours = catchAsync ( async (req, res, next) => {
    //Get all bookings
    const bookings = await Booking.find({ user: req.user.id })
    //Get tours with the returned IDS
    const tourIDs = bookings.map(el => el.tour);

    const tours = await Tour.find({ _id: { $in: tourIDs } });//tourIDs is a array find all the tours with the IDS in tourIDs    


    res.status(200).render('overview', {
        title: 'My Tours.',
        tours: tours
    });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(//this does not update passwords because that does n't run the save MW that encrypts the password
    //we have a seperate form and route to update passwords.    
     req.user.id,
      {
        name: req.body.name,
        email: req.body.email
      },
      {
        new: true,//get the newly updated doc.
        runValidators: true//run validators
      }
    );
  
    res.status(200).render('account', {
      title: 'Your account',
      user: updatedUser
    });
  });