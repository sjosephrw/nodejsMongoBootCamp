//core modules
//const fs = require('fs');

//models
const Tour = require('../models/tourModel');

//utils
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//used in tourROutes.js as a middleware function
exports.aliasTopTours = (req, res, next) => {//changing the req objs. nested query obj query property values
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    console.log(`aliasTopTours ${req.query}`)
    next();
};

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

//we created checkID middleware to validate ID 
// exports.checkID = (req, res, next, val) => {
//     if (req.params.id >= tours.length){
//         //we are returning to stop code execution continuing
//         return res.status(404).json({
//             status: 'fail',
//             message: 'Invalid ID'
//         });        
//     }
//     next();//if we dont call next the request will get stuck here and we will never get a response.
// };

// exports.checkBody = (req, res, next) => {
//     if (!req.body.name || !req.body.price){   
//         //we are returning to stop code execution continuing
//         return res.status(404).json({
//             status: 'fail',
//             message: 'No Name and Price.'
//         });         
//     }

//     next();//if we dont call next the request will get stuck here and we will never get a response.
// };

exports.getAllTours = catchAsync(async (req, res, next) => {

    // try {    
    //console.log(req.requestTime);
    //console.log(req.query);

    // const queryObj = {...req.query};
    // const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // excludedFields.forEach(el => delete queryObj[el]);



        // const tours = await Tour.find({
        //     duration: 5,
        //     difficulty: 'easy'
        // });

        // const tours = await Tour.find().where('duration').equals(5).where('difficulty').equals('easy');
        // const tours = await Tour.find(req.query);
        // const tours = await Tour.find(queryObj);
        //it has to be done as below, because we have to chain paginate and other methods later
        
        //filtering data - duration greater than or equal to 5 price less than 1500   
        //127.0.0.1:3000/api/v1/tours?duration[gte]=5&difficulty=easy&price[lt]=1500
       
       //queryStr produces = { duration: { gte: '5' },difficulty: 'easy',price: { lt: '1500' } }

        // let queryStr = JSON.stringify(queryObj);

        // //127.0.0.1:3000/api/v1/tours?duration[gte]=5&difficulty=easy&price[lt]=1500
        // //in this is what it should look like Tour.find({ duration: { '$gte': '5' },difficulty: 'easy',price: { '$lt': '1500' } })

        // //we are using a regex to put a '$' sign in front of any gt or gte or lt or lte strings 
        // queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);
        // console.log(JSON.parse(queryStr));
        
        // let query = Tour.find(JSON.parse(queryStr));
        
        // if (req.query.sort){
        //     //127.0.0.1:3000/api/v1/tours?sort=-price,ratingAverage
        //     const sortBy = req.query.sort.split(',').join(' ');//this is to get this - { sort: '-price ratingAverage' }
        //     console.log(`sortBy ${sortBy}`);
        //     //query.sort(req.query.sort);
        //     query.sort(sortBy);
        // } else {
        //     //if no sort query param the sort by createdAt descending
        //     query.sort('-createdAt'); // '-' is for sorting by descending order            
        // }
        
        // if (req.query.fields){
        //     //127.0.0.1:3000/api/v1/tours?fields=name,price,duration,difficulty//to display only these fields
        //     const fields = req.query.fields.split(',').join(' ');//to get this { fields: 'name price duration difficulty' }
        //     console.log(`fields ${fields}`);
            
        //     query.select(fields);
        // } else {
        //     //if no field query param the exclude the __v field '-' means exclude
        //     query.select('-__v');            
        // }

        //4. PAGINATION
        // || 1 means a default value of 1
        // const page = req.query.page * 1 || 1;//we are multiplying by 1 to turn the string value into a number
        
        // // || 100 means a default value of 100
        // const limit = req.query.limit * 1 || 100;//we are multiplying by 1 to turn the string value into a number
                
        // const skip = (page - 1) * limit;

        // //127.0.0.1:3000/api/v1/tours?page=2&limit=4 , IF WE HAVE LIMIT 10 then 1 to 10 (page 1), 11 to 20 (page 2), 21 to 30 (page 3)
        // query = query.skip(skip).limit(limit);//skip - page number, limit - results per page

        // if(req.query.page){
        //     const numTours = await Tour.countDocuments();
        //     if(skip >= numTours) throw new Error('That page does not exist!');
        // }

    //     const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();
        
    //     // const tours = await query;
    //     const tours = await features.query;


    //     res.status(200).json(
    //         {
    //         status: 'success', 
    //         requestedAt: req.requestTime,
    //         results: tours.length,
    //         data: {
    //             tours: tours
    //         }
    //     });
    // }catch(err){
    //     //should n't the below be a 400 = bad request
    //     res.status(404).json({
    //         status: 'fail',
    //         message : err
    //         //message: 'Invalid data sent!'
    //     });
    // }

    const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();
        
    // const tours = await query;
    const tours = await features.query;


    res.status(200).json(
        {
        status: 'success', 
        requestedAt: req.requestTime,
        results: tours.length,
        data: {
            tours: tours
        }
    });

});


exports.createTour = catchAsync(async (req, res, next) => {
    // console.log(req.body);
    // const newId = tours[tours.length - 1].id + 1;
    // const newTour = Object.assign({ id: newId }, req.body);

    // tours.push(newTour);

    // fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
    //     //************* IMPORTANT We cant send 2 responses at the same time
    //     res.status(201).json({
    //         status: 'success',
    //         data: {
    //             tour: newTour
    //         }
    //     }
    //     );
    // });

    //can create the tours this way also, but we are converting this controller method to a async function
    // const newTour = new Tour({});
    // newTour.save();

    //can create the tours this way also, but we are converting this controller method to a async function
    // Tour.create({})
    // .then()
    // .catch(err => {
    //     console.log(err);
    // });

    //But we can not do Tour.save();

    // try {

    //     const newTour = await Tour.create(req.body);

    //     res.status(201).json({
    //         status: 'success',
    //         data: {
    //             tour: newTour
    //         }
    //     });

    // }catch(err){

    //     //400 = bad request
    //     res.status(400).json({
    //         status: 'fail',
    //         message : err
    //         //message: 'Invalid data sent!'//if we have this instead of message: err we wont be able to see the actual error message
    //     });
    // }


    const newTour = await Tour.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            tour: newTour
        }
    });

});

exports.getTour = catchAsync(async (req, res, next) => {

    //console.log(req.params);

    // const tour = tours.forEach(t => {
    //     if (req.params.id === t.id){
    //         return t;
    //     }
    // });

    // res.status(200).json(
    //     {
    //     status: 'success', 
    //     results: tours.length,
    //     data: {
    //         tours: tours
    //     }
    // });

    // const id = req.params.id * 1;

    // const tour = tours.find(el => el.id === id);//req.params.id * 1 can also be used to convert string to a number

    // // if (id >= tours.length){
    // if (!tour){        
    //     //we are returning to stop code execution continuing
    //     return res.status(404).json({
    //         status: 'fail',
    //         message: 'Invalid ID'
    //     });        
    // }

    //find will return the condition if the requirement is met

    //we created checkID middleware to validate ID 
    // if (req.params.id >= tours.length){
    //     //we are returning to stop code execution continuing
    //     return res.status(404).json({
    //         status: 'fail',
    //         message: 'Invalid ID'
    //     });        
    // }    

    // try {
    //     //We can also use Tour.findOne({_id: req.params.id});
    //     const tour = await Tour.findById(req.params.id);

    //     res.status(200).json(
    //         {
    //         status: 'success', 
    //         data: {
    //             tour: tour
    //         }
    //     });

    // } catch(err){
    //     //should n't the below be a 400 = bad request
    //     res.status(404).json({
    //         status: 'fail',
    //         message : err
    //         //message: 'Invalid data sent!'
    //     });
    // }

        //We can also use Tour.findOne({_id: req.params.id});
        const tour = await Tour.findById(req.params.id);

        if(!tour){
            //when next receives anything it will jump directly into the global error handling MW
            return next(new AppError('No tour was found with that ID', 404));
        }

        res.status(200).json(
            {
            status: 'success', 
            data: {
                tour: tour
            }
        });

});

exports.updateTour = catchAsync(async (req, res, next) => {
//we created checkID middleware to validate ID 
//     if (req.params.id >= tours.length){
//        //we are returning to stop code execution continuing
//        return res.status(404).json({
//            status: 'fail',
//            message: 'Invalid ID'
//        });        
//    }

   //find will return the condition if the requirement is met

//    try {
    
//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//         new: true, //This will return the updated document, rather than the original
//         runValidators: true
//     });

//     res.status(200).json(
//         {
//         status: 'success', 
//         data: {
//             tour: tour
//         }
//     });

//     } catch(err){
//         //should n't the below be a 400 = bad request
//         res.status(404).json({
//             status: 'fail',
//             message : err
//             //message: 'Invalid data sent!'
//         });
//     }
    
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true, //This will return the updated document, rather than the original
        runValidators: true
    });

    if(!tour){
        //when next receives anything it will jump directly into the global error handling MW
        return next(new AppError('No tour was found with that ID', 404));
    }

    res.status(200).json(
        {
        status: 'success', 
        data: {
            tour: tour
        }
    });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
//we created checkID middleware to validate ID 
//     if (req.params.id >= tours.length){
//        //we are returning to stop code execution continuing
//        return res.status(404).json({
//            status: 'fail',
//            message: 'Invalid ID'
//        });        
//    }

   //find will return the condition if the requirement is met

//    try {
    
//     await Tour.findByIdAndDelete(req.params.id);

//     res.status(204).json(
//         {
//         status: 'success', 
//         //when we are deleting we don't send data back we send null and status 204
//         data: null
//     });

//     } catch(err){
//         //should n't the below be a 400 = bad request
//         res.status(404).json({
//             status: 'fail',
//             message : err
//             //message: 'Invalid data sent!'
//         });
//     }

    const tour = await Tour.findByIdAndDelete(req.params.id);

    if(!tour){
        //when next receives anything it will jump directly into the global error handling MW
        return next(new AppError('No tour was found with that ID', 404));
    }

    res.status(204).json(
        {
        status: 'success', 
        //when we are deleting we don't send data back we send null and status 204
        data: null
    });


});

exports.getTourStats = catchAsync(async (req, res, next) => {
    // try {

    //     //Tour.find() returns a query Tour.aggregate() returns a aggregate obj.

    //     const stats = await Tour.aggregate([
    //         {
    //             $match: { ratingsAverage: {$gte: 4.5} }//match is a preliminary stage to prepare for the other stages that follow
    //         },
    //         {
    //             $group: { 
    //                 //_id: null,//calculate for all the tours
    //                 // _id: '$difficulty',//group all the tours by the difficulty levels
    //                 _id: { $toUpper: '$difficulty' },//group all the tours by the difficulty levels, and display the difficulty level in uppercase letters
    //                 num: { $sum: 1 },//Get the total num. of tours, add 1 for each document
    //                 numRatings: { $sum: '$ratingsQuantity' }, 
    //                 avgRating: { $avg: '$ratingsAverage' },//for the $avg operator the field name has to be specified with a $ in front $ratingsAverage
    //                 avgPrice: { $avg: '$price' },//for the $avg operator the field name has to be specified with a $ in front $price
    //                 minPrice: { $min: '$price' },//for the $avg operator the field name has to be specified with a $ in front $ratingsAverage
    //                 maxPrice: { $max: '$price' }                
    //             }//group allows us to group documnets according to accumulators
    //         },
    //         {
    //             $sort: { avgPrice: 1 }
    //         }//,
    //         // {   //matching multiple times
    //         //     $match: { _id: { $ne: 'EASY' } }//where the diffifulty level is not equal to easy
    //         // }
    //     ], 
    //     function (err, res)
    //     {
    //         if (err) {console.log(err); } // TODO handle error 
    //         console.log(res); 
    //     });

    //     res.status(200).json(
    //         {
    //         status: 'success', 
    //         data: { stats }
    //     });

    // } catch (err){
    //     // console.log(err);
    //     //should n't the below be a 400 = bad request
    //     res.status(404).json({
    //         status: 'fail',
    //         message : err
    //         //message: 'Invalid data sent!'
    //     });        
    // }


    //Tour.find() returns a query Tour.aggregate() returns a aggregate obj.

    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: {$gte: 4.5} }//match is a preliminary stage to prepare for the other stages that follow
        },
        {
            $group: { 
                //_id: null,//calculate for all the tours
                // _id: '$difficulty',//group all the tours by the difficulty levels
                _id: { $toUpper: '$difficulty' },//group all the tours by the difficulty levels, and display the difficulty level in uppercase letters
                num: { $sum: 1 },//Get the total num. of tours, add 1 for each document
                numRatings: { $sum: '$ratingsQuantity' }, 
                avgRating: { $avg: '$ratingsAverage' },//for the $avg operator the field name has to be specified with a $ in front $ratingsAverage
                avgPrice: { $avg: '$price' },//for the $avg operator the field name has to be specified with a $ in front $price
                minPrice: { $min: '$price' },//for the $avg operator the field name has to be specified with a $ in front $ratingsAverage
                maxPrice: { $max: '$price' }                
            }//group allows us to group documnets according to accumulators
        },
        {
            $sort: { avgPrice: 1 }
        }//,
        // {   //matching multiple times
        //     $match: { _id: { $ne: 'EASY' } }//where the diffifulty level is not equal to easy
        // }
    ], 
    function (err, res)
    {
        if (err) {console.log(err); } // TODO handle error 
        console.log(res); 
    });

    res.status(200).json(
        {
        status: 'success', 
        data: { stats }
    });

});
//get the number of tours in a given month
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    // try{
    //     const year = req.params.year * 1;

    //     const plan = await Tour.aggregate([
    //         {
    //             $unwind: '$startDates'
    //         },
    //         {
    //             $match: {
    //                 //all tours within 2021
    //                 startDates: {
    //                     $gte: new Date(`${year}-01-01`),
    //                     $lte: new Date(`${year}-12-31`)
    //                 } 
    //             }
    //         },
    //         {
    //             $group: {
    //                 _id: { $month: '$startDates' },
    //                 numTourStarts: { $sum: 1 },//the number of tours that start in that month
    //                 tours: { $push: '$name' }//get the name os the tours that exist in each month into a array
    //             }
    //         },
    //         {
    //             $addFields: { month: '$_id' }
    //         },
    //         {
    //             $project: {
    //                 _id: 0//hide the _id field from the result if it was 1 instead of 0 it will show 
    //             }
    //         },
    //         {
    //             $sort: { numTourStarts: -1 } //sort by descending = -1
    //         },
    //         {
    //             $limit: 12
    //         }
    //     ]);

    //     res.status(200).json(
    //         {
    //         status: 'success', 
    //         data: { plan }
    //     });
    // }
    // catch (err){
    //      // console.log(err);
    //     //should n't the below be a 400 = bad request
    //     res.status(404).json({
    //         status: 'fail',
    //         message : err
    //         //message: 'Invalid data sent!'
    //     });        
    // }
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                //all tours within 2021
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                } 
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },//the number of tours that start in that month
                tours: { $push: '$name' }//get the name os the tours that exist in each month into a array
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: {
                _id: 0//hide the _id field from the result if it was 1 instead of 0 it will show 
            }
        },
        {
            $sort: { numTourStarts: -1 } //sort by descending = -1
        },
        {
            $limit: 12
        }
    ]);

    res.status(200).json(
        {
        status: 'success', 
        data: { plan }
    });

});