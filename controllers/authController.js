//core modules
//const util = require('util');//can do it like this also but we only need the promisify method so we use desctructuring
const { promisify } = require('util');
const crypto = require('crypto');

//other modules
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

//https://stackoverflow.com/questions/33109103/object-prototype-function-to-test-if-it-is-defined-not-null
Object.exists = function(obj) {
    return typeof obj !== "undefined" && obj !== null;
}



const signToken = id => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode, req, res) => {

    const token = signToken(user._id);

    const cookieOptions = {
        expires: 
        new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
    };

    //if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    //req.secure = https, req.headers['x-forwarded-proto']= to make it work with heroku
    //if (req.secure || req.headers['x-forwarded-proto'] === 'https') cookieOptions.secure = true;//moved to the line above



    res.cookie('jwt', token, cookieOptions);

    //to remove the password from the output when creating the user, we blocked it from showing the password earlier when getting users
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token: token,
        data: {
            user
        }
    });
}

exports.signup =  catchAsync( async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt
    });

    // const url = 'http://localhost:3000/me';
    const url = `${req.protocol}://${req.hostname}:${req.port}/me`;//my account
    // console.log(url);

    await new Email(newUser, url).sendWelcome();
    // const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    //     expiresIn: process.env.JWT_EXPIRES_IN
    // });

    createSendToken(newUser, 201, req, res);

    // const token = signToken(newUser._id);

    // res.status(201).json({
    //     status: 'success',
    //     token: token,
    //     data: {
    //         user: newUser
    //     }
    // });
});

exports.login = catchAsync( async (req, res, next) => {
    //doing it differently using es6 destructuring
    const { email, password } = req.body;

    //1. check if the email and password exist in the request body
    if (!email || !password){
        return next(new AppError('Please provide a email and a password', 400));
    }

    //2. check if the user exists and the password is correct
    const user = await User.findOne({ email }).select('+password');//by default the password wont appear in any out put because we set select: false for the password in the model, but we need it here so select('+password')
    // console.log(`authController - login `);
    //console.log(user);


    if (!user || !(await user.correctPassword(password, user.password))){
        return next(new AppError('Incorrect email or password', 401));//401 - unauthorized
    }

    //3. if every thing is OK, send the request to the client
    createSendToken(user, 200, req, res);

    // const token = signToken(user._id);

    // res.status(200).json({
    //     status: 'success',
    //     token: token
    // });
});

exports.logout = (req, res) => {
    //to log the user out we create a new cookie but instead of the real JWT we put in some dummy text
    //saying 'loggedout'
    //and give that cookie a short expiration time of 10 seconds
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
        secure: false//since it has no sensitive data, we set secure to false
    });
    res.status(200).json({
        status: 'success'
    });
};

//used in tourROutes.js as a middleware function
exports.protect = catchAsync ( async (req, res, next) => {
    //1. get token and check if it exists
    let token;
 
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        //const is block scpoped meaning it can not be used outside of thei if statement so using let.
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt){//making it possible to read JWT from cookies
        token = req.cookies.jwt;
    }

    // console.log(token);

    if (!token){
        return next(new AppError('You are not logged in please login to get access', 401));//401 - unauthorized        
    }
    //2. check if token is valid
    //the function below takes a 3rd parameter a callback function but jonas uses the promisify method 
    //from the util core module to make it a async function
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //console.log(decoded);
    //3. check if user still exists (if the user has been deleted after the token was issued)
    const currentUser = await User.findById(decoded.id);

    if (!currentUser){
        return next(new AppError('The user belonging to this token does no longer exist.', 401));//401 - unauthorized        
    }    

    //4. check if the user chnaged the password after the token was issued
    if(currentUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('User recently changed password!, Please login again.', 401));//401 - unauthorized        
    }

    req.user = currentUser;
    //making the user object accessible by the pug templates res.locals makes it acessible
    res.locals.user = currentUser;
    next();//sends us back to the next route handler.
});

//THIS IS USED IN SERVER SIDE RENDERED PAGES AND WILL NOT GENERATE ANY ERRORS, IT IS QUITE SIMILAR TO THE PROTECT ROUTE
//BUT BECAUSE IT WILL NOT GENERATE ANY ERRORS THE new AppError('') was removed
exports.isLoggedIn = catchAsync ( async (req, res, next) => {
    //if the jwt stores the value of logged out then pass on to the next MW
    //otherwise there will be a error when logging out lec 191, got this code from the Q and A 
    if (req.cookies.jwt === 'loggedout') return next();

    //IN THIS CASE THE TOKEN WILL BE PRESENT ONLY OIN THE COOKIES AND NOT THE HEADERS.
    if (req.cookies.jwt){//making it possible to read JWT from cookies
    //1. get token and check if it exists
    let token;
    token = req.cookies.jwt;
    
    // console.log(token);
    //2. check if token is valid
    //the function below takes a 3rd parameter a callback function but jonas uses the promisify method 
    //from the util core module to make it a async function
    const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

    //console.log(decoded);
    //3. check if user still exists (if the user has been deleted after the token was issued)
    const currentUser = await User.findById(decoded.id);

    if (!currentUser){
        return next();//401 - unauthorized        
    }    

    //4. check if the user chnaged the password after the token was issued
    if(currentUser.changedPasswordAfter(decoded.iat)){
        return next();//401 - unauthorized        
    }

    // req.user = currentUser;
    //making the user object accessible by the pug templates res.locals makes it acessible
    res.locals.user = currentUser;

    return next();//sends us back to the next route handler.
}
    //https://stackoverflow.com/questions/33109103/object-prototype-function-to-test-if-it-is-defined-not-null
    if (!Object.exists(res.cookie.jwt)) {
        // safely use myObject
        return next();
    }

    //next();//was generating a error, lec 189
});

//in order to pass parameters to a middleware function we have to create a wrapper function as below
//when we want to specify an unknown amount of arguments ...args
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        //if the roles array does not include the current users role then do not give access
        if (!roles.includes(req.user.role)){
            return next(new AppError('You are not authorized to perform this action.', 403));//403 - forbidden        
        }

        next();//sends us back to the next route handler.
    }
}

exports.forgotPassword = catchAsync( async (req, res, next) => {
    //1. get user based on posted email
    const user = await User.findOne({ email: req.body.email });

    if (!user){
        return next(new AppError('There is no user with that email.', 404));//403 - forbidden        
    }
    
    //2. generate a random reset token
    const resetToken = user.createPasswordResetToken();
    //we are saving the resetToken and the token expiry time in the DB, to prevent the other validation errors we set validateBeforeSave to false
    await user.save({ validateBeforeSave: false });
    //3. send it to the users email
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password submit a PATCH request to the url ${resetUrl} along with your password and confirm Password, if you did not request a reset just ignore this message.`

    // await sendEmail({
    //     email: user.email,//req.body.email - also valid
    //     subject: 'Reset email - valid for 10 minutes.',
    //     message
    // });


    await new Email(user, resetUrl).sendPasswordReset();

    try{
        res.status(200).json({
            status: 'success',
            message: 'Token sent to Email'
        }); 
    } catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError('Email could not be sent, try again.', 500));       
    }   

});

exports.resetPassword = catchAsync ( async (req, res, next) => {
    //1. Get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {$gt: Date.now() } 
    });
    //2. If the token has not expired, and there is a user, set the new password.

    if (!user){
        return next(new AppError('Token is invalid or has expired.', 400));//400 - bad request        
    }
    //3. Update the changedPasswordAt property for the user
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    //4. log the user in by sending a JWT
    createSendToken(user, 200, req, res);
    // const token = signToken(user._id);

    // res.status(200).json({
    //     status: 'success',
    //     token
    // });

});

exports.updatePassword = catchAsync ( async (req, res, next) => {
    //1. Get the user from the collection
    //the password is not in the out put because in the schema we defined - select: false so to use it here .select('+password');
    const user = await User.findById(req.user.id).select('+password');
    //2. Check if the posted current password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))){
        return next(new AppError('Your current password is wrong.', 403));//403 - forbidden        
    }
    //3. Update the password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();//the validation (whether the passwords match) will be done by the schema when we save
    //***********IMPORTANT CANT DO findByIdAndUpdate be cause the validation works only on create and save - refer to schema */
    
    //4. Login user send new JWT
    createSendToken(user, 200, req, res);
});