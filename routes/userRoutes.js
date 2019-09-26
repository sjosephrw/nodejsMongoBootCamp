const express = require('express');

//My Custom Modules
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');


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
router.patch('/updateMe', /*authController.protect*/ userController.updateMe);
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