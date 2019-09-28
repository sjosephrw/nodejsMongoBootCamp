const express = require('express');
// const multer = require('multer');//to parse multipart form data (IMAGE UPLOADS) - moved to userController

//My Custom Modules
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

//moved to userController
//BODY PARSER IS NOT SUFFICIENT TO HANDLE FILE UPLOADS SO WE HAVE TO USE ANOTHER PACKAGE CALLED MULTER
//configuring multer (IMAGE UPLOADER), dest- path to upload images to (we can specify no path but then the image will be uploaded to memory)
// const upload = multer( {dest: 'public/img/users'} );

const router = express.Router();//these have to be up here not below the route methods

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);



router.use(authController.protect);

//below authController.protect was replaced by the code above because middle ware runs in the order defined - router.use(authController.protect);
router.patch('/updateMyPassword', /*authController.protect,*/ authController.updatePassword);

router.get('/me', /*authController.protect,*/ userController.getMe, userController.getUser);

//multer MW WAS LETER MOVED TO USERCONTROLLER.JS
//******IMPORTANT - */multer is a package that is used to handle multipart form data
//upload multer is used as a middle ware to upload images
//single to upload a single image, photo - the name of the field that holds the image in the form
router.patch('/updateMe', 
    userController.uploadUserPhoto,/*upload.single('photo'),*/ /*authController.protect*/ 
    userController.resizeUserPhoto,
    userController.updateMe
);

router.delete('/deleteMe', /*authController.protect*/ userController.deleteMe);

router.use(authController.restrictTo('admin'));

router
.route('/')
.get(userController.getAllUsers)
.post(userController.createUser);

router
.route('/:id')
.get(userController.getUser)
.patch(userController.updateUser)
.delete(userController.deleteUser);


module.exports = router;