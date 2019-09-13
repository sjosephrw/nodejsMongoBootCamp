const AppError = require('../utils/appError');

const handleJWTError = () => new AppError('Invalid token, please login again.', 401);//401 - unauthorized

const handleJWTExpiredError = () => new AppError('Your token has expired, please login again.', 401);//401 - unauthorized

//handling invalid database ID's
const handelCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}!`;
    return new AppError(message, 400);
}

//handling duplicate field values like 'The Forest Hiker'
const handelDuplicateFieldsDB = err => {
    //the forest hiker value will appear between '' so we are using a reg ex to acquire it
    //https://stackoverflow.com/questions/171480/regex-grabbing-values-between-quotation-marks
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    console.log(value);
    const message = `Duplicate field value ${value}, please use another value!`;
    return new AppError(message, 400);
}

//handling mongoose validation errors
const handelValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data! ${errors.join('. ')}`;
    return new AppError(message, 400); 
}

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    }); 
}


const sendErrorProd = (err, res) => {
    //in production we only wnat to show operational errors to the user,
    //programming errors and other unknown errors will display a generic response below in the else block
    if(err.isOperational){//in appError.js - this.isOperational
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        }); 
    } else {
        //a special console.log - console.error() for errors, could have done a console.log 
        console.error(`errorController.js - sendErrorProd function`, err);

        //generic error message
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong.'
        });        
    }    
}

module.exports = (err, req, res, next) => {

    // console.log(err.stack);

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development'){
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production'){
        let error = {...err};

        if (err.name === 'CastError') error = handelCastErrorDB(error);
        if (err.name === 'ValidationError') error = handelValidationErrorDB(error);
        if (err.code === 11000) error = handelDuplicateFieldsDB(error);
        if (err.name === 'JsonWebTokenError') error = handleJWTError(); 
        if (err.name === 'TokenExpiredError') error = handleJWTExpiredError(); 

        sendErrorProd(error, res);
    }
}