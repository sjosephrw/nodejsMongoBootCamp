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

const sendErrorDev = (err, req, res) => {
    //req.originalUrl is the full url without the host
    if (req.originalUrl.startsWith('/api')){//if it's a api route show this error 
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } 
    return res.status(err.statusCode).render('error', {//if it is not then render a error page
        title: 'Something went wrong.',
        msg: err.message 
    });

}


const sendErrorProd = (err, req, res) => {
    //req.originalUrl is the full url without the host
    if (req.originalUrl.startsWith('/api')){
        //if it's a api route show this error 
        //in production we only wnat to show operational errors to the user,
        //programming errors and other unknown errors will display a generic response below in the else block
        if(err.isOperational){//in appError.js - this.isOperational
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            }); 
        } 
            //a special console.log - console.error() for errors, could have done a console.log 
            console.error(`errorController.js - sendErrorProd function`, err);
            console.error('ERROR 💥', err);
            //generic error message
            return res.status(500).json({
                status: 'error',
                message: 'Something went very wrong.'
            });        
        }
    
    //if it is not then render a error page
        //in production we only wnat to show operational errors to the user,
        //programming errors and other unknown errors will display a generic response below in the else block
        if(err.isOperational){//in appError.js - this.isOperational
            return res.status(err.statusCode).render('error', {
                status: 'Something went wrong.',
                msg: err.message
            }); 
        } 
        //a special console.log - console.error() for errors, could have done a console.log 
        console.error(`errorController.js - sendErrorProd function`, err);
        console.error('ERROR 💥', err);

        //generic error message
        return res.status(500).render('error', {//if it is not then render a error page
            title: 'Something went wrong.',
            msg: 'Please try again later.' 
        });
        
        
}

module.exports = (err, req, res, next) => {

    // console.log(err.stack);

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development'){
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production'){
        let error = {...err};
        //for some reason the error var. below was undefined so created it like this. 
        error.message = err.message;//this was causing the errors not to be displayed in production.

        if (err.name === 'CastError') error = handelCastErrorDB(error);
        if (err.name === 'ValidationError') error = handelValidationErrorDB(error);
        if (err.code === 11000) error = handelDuplicateFieldsDB(error);
        if (err.name === 'JsonWebTokenError') error = handleJWTError(); 
        if (err.name === 'TokenExpiredError') error = handleJWTExpiredError(); 

        sendErrorProd(error, req, res);
    }
}