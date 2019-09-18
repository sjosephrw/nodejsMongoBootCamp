const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.deleteOne = Model => catchAsync(async (req, res, next) => {

    const doc = await Model.findByIdAndDelete(req.params.id);

    if(!doc){
        //when next receives anything it will jump directly into the global error handling MW
        return next(new AppError('No document was found with that ID', 404));
    }

    res.status(204).json(
        {
        status: 'success', 
        //when we are deleting we don't send data back we send null and status 204
        data: null
    });
    
});

exports.updateOne = Model => catchAsync(async (req, res, next) => {
        
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true, //This will return the updated document, rather than the original
            runValidators: true//check for validation as specified in mongoose model
        });
    
        if(!doc){
            //when next receives anything it will jump directly into the global error handling MW
            return next(new AppError('No document was found with that ID', 404));
        }
    
        res.status(200).json(
            {
            status: 'success', 
            data: {
                data: doc
            }
        });
});

exports.createOne = Model => catchAsync(async (req, res, next) => {

    const doc = await Model.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            data: doc
        }
    });

});