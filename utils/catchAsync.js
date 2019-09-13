//this was created to get rid of the try catch blocks
module.exports = fn => {
    return (req, res, next) => {//this was entered otherwise fn() below can not receive the req, res, next from the createTour function
        fn(req, res, next).catch(err => next(err));
    };
};