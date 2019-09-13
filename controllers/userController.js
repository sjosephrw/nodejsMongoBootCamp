//models
const User = require('../models/userModel');

//utils
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });

    return newObj;
}

exports.getAllUsers =  catchAsync(async (req, res, next) => {

    console.log(req.requestTime);
    const users = await User.find();

    res.status(200).json(
        {
        status: 'success', 
        requestedAt: req.requestTime,
        results: users.length,
        data: {
            users: users
        }
    });
});

exports.updateMe = catchAsync ( async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm){
        return next(new AppError('This route is not for password updates. Please use /updateMyPassword', 400));//403 - forbidden        
    }

    //to permit only name and email to be updated otherwise he can update his access level (role) also
    const filteredBody = filterObj(req.body, 'name', 'email');
    const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,//return the updated document
        runValidators: true//also run validations 
    });
    //await user.save();//this wont work must use findByIdAndUpdate becuase we are not dealing with passwords here

    res.status(200).json({
        status: 'success',
        data: {
            user: updateUser
        }
    });    

});

exports.deleteMe = catchAsync( async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null
    }); 
    
});

exports.getUser = (req, res) => {

    console.log(req.requestTime);

    res.status(500).json(
        {
        status: 'error', 
        message: 'Method not defined.'
    });
};

exports.createUser = (req, res) => {

    console.log(req.requestTime);

    res.status(500).json(
        {
        status: 'error', 
        message: 'Method not defined.'
    });
};

exports.updateUser = (req, res) => {

    console.log(req.requestTime);

    res.status(500).json(
        {
        status: 'error', 
        message: 'Method not defined.'
    });
};

exports.deleteUser = (req, res) => {

    console.log(req.requestTime);

    res.status(500).json(
        {
        status: 'error', 
        message: 'Method not defined.'
    });
};