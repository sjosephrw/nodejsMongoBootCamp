//3rd part packages
const multer = require('multer');//to parse multipart form data (IMAGE UPLOADS) - moved to userController
const sharp = require('sharp');//to resize images uploaded by multer
//models
const User = require('../models/userModel');

//utils
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//controllers
const factory = require('./handlerFactory');

//*********IMPORTANT after using sharp to resize image Jonas said it would be better to hold the image in memory and then resize instead of wrting it to the disk and then resizing it */
//so we are not using the code below this function anymore
const multerStorage = multer.memoryStorage();

//we also need to create a multer storage and filter (READ THE DOCS ON GITHUB)
// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => { //this destination function has access to the req. obj. the file uploaded and cb is similar to the next function but we call it cb here
//         //1st arg is the error if there is one or just null
//         //2nd arg is the path to save images to
//         cb(null, 'public/img/users')
//     },
//     filename: function (req, file, cb) {
      
//       //the console.log(req.file) output in updateMe shows us a obj. of the uploaded file
//       //mimetype val. holds image/jpeg to get only jpeg
//       const ext = file.mimetype.split('/')[1];  
//       const currentTimeStamp = Date.now();
//       const userId = req.user.id;  

//       cb(null, `user-${userId}-${currentTimeStamp}.${ext}`)//specifying the name we want the image to be saved in//user-userId-currentTimestamp.ext        
//     }    
// });

//GOT THIS FROM THE DOCUMENTATION on GITHUB
//to filter what files are excepted and what are not
const multerFilter = (req, file, cb) => {

    // // The function should call `cb` with a boolean
    // // to indicate if the file should be accepted
  
    // // To reject this file pass `false`, like so:
    // cb(null, false)
  
    // // To accept the file pass `true`, like so:
    // cb(null, true)
  
    // // You can always pass an error if something goes wrong:
    // cb(new Error('I don\'t have a clue!'))

    //I wrote the code below my self
    // const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];

    //the console.log(req.file) output in updateMe shows us a obj. of the uploaded file
    //mimetype val. holds image/jpeg to get only jpeg
    // const ext = file.mimetype.split('/')[1]; 

    //https://www.w3schools.com/jsref/jsref_includes_array.asp
    // if (allowedExtensions.includes(ext)){ 
    //     cb(null, true);
    // } else if (!allowedExtensions.includes(ext)){
    //     cb(null, false);
    // } else {
    //     cb();
    // }

    //I wrote the code above my self

    if (file.mimetype.startsWith('image')){ 
        cb(null, true);
    } else {
        cb(new AppError('That is not a image, Please upload a valid image', 400), false);
    }

  }

//moved to userController
//BODY PARSER IS NOT SUFFICIENT TO HANDLE FILE UPLOADS SO WE HAVE TO USE ANOTHER PACKAGE CALLED MULTER
//configuring multer (IMAGE UPLOADER), dest- path to upload images to (we can specify no path but then the image will be uploaded to memory)
//**************** */NOT SURE but may be if you want to upload to a different folder ex- tours in the tourController
//const upload = multer( {dest: 'public/img/tours'} );
const upload = multer( { storage: multerStorage, fileFilter: multerFilter } );

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });

    return newObj;
}

// exports.getAllUsers =  catchAsync(async (req, res, next) => {

//     console.log(req.requestTime);
//     const users = await User.find();

//     res.status(200).json(
//         {
//         status: 'success', 
//         requestedAt: req.requestTime,
//         results: users.length,
//         data: {
//             users: users
//         }
//     });
// });

//******IMPORTANT - */multer is a package that is used to handle multipart form data
//upload multer is used as a middle ware to upload images
//single to upload a single image, photo - the name of the field that holds the image in the form
exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync ( async (req, res, next) => {
    if (!req.file) return next();
    
    //I wrote the code below
    // await sharp(req.file).resize(200, 200).toBuffer(function(err, buf) {
    //     if (err) return next(err)
      
    //     // Do whatever you want with `buf`
    //   });
    //I wrote the code above

    const currentTimeStamp = Date.now();
    const userId = req.user.id;  
    //we are saving this into req.file.filename because we commented out multerStorage function above and the next MW in line 
    //that is updateMe needs the req.file.filename value so
    req.file.filename = `user-${userId}-${currentTimeStamp}.jpeg`;

    await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({quality: 90})//to compress it to 90% of it's original quality
    .toFile(`public/img/users/${req.file.filename}`, function(err) {
        if (err) return next(new AppError('Something went wrong resizing the image, Please try again', 400));
        // output.jpg is a 300 pixels wide and 200 pixels high image
        // containing a scaled and cropped version of input.jpg
    });
    
    next();  

});

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}

exports.updateMe = catchAsync ( async (req, res, next) => {

    // console.log(req.file);//has to be used with the multer package (for file uploads)
    // console.log(req.body);

    if (req.body.password || req.body.passwordConfirm){
        return next(new AppError('This route is not for password updates. Please use /updateMyPassword', 400));//403 - forbidden        
    }

    //to permit only name and email to be updated otherwise he can update his access level (role) also
    const filteredBody = filterObj(req.body, 'name', 'email');
  
    if (req.file) filteredBody.photo = req.file.filename; //file.filename holds the new file name modified by the multerStorage function defined above

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

exports.getAllUsers =  factory.getAll(User);

exports.getUser = factory.getOne(User); 

//(req, res) => {

//     console.log(req.requestTime);

//     res.status(500).json(
//         {
//         status: 'error', 
//         message: 'Method not defined.'
//     });
// };

exports.createUser = (req, res) => {

    console.log(req.requestTime);

    res.status(500).json(
        {
        status: 'error', 
        message: 'Method not defined. Please use /signup instead.'
    });
};

exports.updateUser = factory.updateOne(User);

// exports.updateUser = (req, res) => {

//     console.log(req.requestTime);

//     res.status(500).json(
//         {
//         status: 'error', 
//         message: 'Method not defined.'
//     });
// };

exports.deleteUser = factory.deleteOne(User);

// exports.deleteUser = (req, res) => {

//     console.log(req.requestTime);

//     res.status(500).json(
//         {
//         status: 'error', 
//         message: 'Method not defined.'
//     });
// };