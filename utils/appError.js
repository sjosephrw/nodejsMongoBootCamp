class AppError extends Error {
    constructor(message, statusCode){
        super(message);//we are calling super because we are extending the parent class (Error) and the parent class excepts only 1 parameter that is message
    
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';//4 means 404 etc errors else 500
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);

    }

}

module.exports = AppError;