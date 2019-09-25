const express = require('express');

const viewsController = require('../controllers/viewsController')
const authController = require('../controllers/authController')

const router = express.Router();

//router middle ware, now all the routes below will acquire this MW to check whether the user is logged in,
//because it is defined above all those routes.
router.use(authController.isLoggedIn);

//home page
router.get('/', viewsController.getOverview);
//individual tour details page
router.get('/tour/:slug', viewsController.getTour);
//login page
router.get('/login', viewsController.getLoginForm);


module.exports = router;
