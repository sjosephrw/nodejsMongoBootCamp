//core modules
// const fs = require('fs');
const path = require('path');

//3rd party modules
const morgan = require('morgan');
const express = require('express');
const rateLimit = require('express-rate-limit');//to prevent DOS and Brute Force attacks
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');//to parse all incoming cookies ex - JWT
const compression = require('compression');//to compress all text (JSON etc) thats sent to the client
const cors = require('cors');//to implement Cross Origin Resource Sharing

//My Custom Modules
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');


const app = express();

app.enable('trust proxy');//heroku uses proxies so to make it work with heroku

app.set('view engine', 'pug');//setting the type of view templating engine ex. ejs, handlebars, pug
app.set('views', path.join(__dirname, 'views'));//can also do it like this app.set('views', './views'); but with __dirname it is safer
//and no need to specify slashes in the path '/'

//MIDDLE WARE FUNCTIONS
/////////////////////////////////THE REQUEST RESPONSE CYCLE (This happens for every request)

//https://github.com/expressjs/cors
//allow everyone to consume our API
app.use(cors());////to implement Cross Origin Resource Sharing

app.options('*', cors());//allow delete and patch requests to all routes

//MW to serve static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));


//to create several http security headers
app.use(helmet());

//1 ST THE REQUEST

//2ND MIDDLE WARE
//***********IMPORTANT MIDDLE WARE */
//WHEN SOME ONE HITS OUR A SERVER THE SERVER CREATES A REQUEST OBJ. and a RESPONSE OBJ. THAT DATA WILL BE PROCESSED INORDER TO GENERATE A MEANINGFUL RESPONSE.
//WE USE MIDDLE WARE FOR THIS MIDDLE WARE CAN MANIPULATE THE REQ. OR RES. OBJS., MIDDLE WARE DOES NOT NEED TO BE ABOUT REQ, RES, OBJS. BUT IT'S MOSTLY ABOUT REQ.
//app.use(express.json()); WE USED THIS ABOVE, IT'S ALSO MIDDLE WARE, IN EXPRESS EVERYTHING IS A MIDDLE WARE EVEN THE ROUTES
//ALL THE MIDDLE WARE IS CALLED THE MIDDLE WARE STACK, AND THE M.W. FUNCTIONS ARE EXECUTED IN THE ORDER THEY WERE DEFINED
//EACH REQUEST AND RESPONSE OBJS. PASS THROUGH THE MW STACK FUNCTIONS WHERE THEY ARE ALTERED OR SOME OTHER DATA IS PROCESSED
//THE  next() function causes the exact same req. and res. objs to pass on to the next MW function in the stack.

//3RD RESPONSE
//when it exits the final MW function the final RESPONSE is generated by the server.


if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));//Morgan logs the URL the REPONSE STATUS 404 etc. the time of the response.
}

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
// app.set('trust proxy', 1);
 
//to prevent DOS and brute force attacks
const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 60 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, try again in 1 hour.'
});

//to prevent DOS and brute force attacks   
//  apply to all requests
app.use('/api', limiter);

//body parser, reading data from body, into req.body { limit: '10kb' } - limit body data to 10 kb
app.use(express.json({ limit: '10kb' }));
//to parse form body data
app.use(express.urlencoded({ extended: true, limit: '10kb' }));//extended to parse more complicated data
//coockie parser, reads all cookie data
app.use(cookieParser());

//data sanitization against NoSql query injection
app.use(mongoSanitize());
//data sanitization against XSS (mongoose validation protects against XSS but this adds a extra level of protection)
app.use(xss());
//prevent parameter pollution (when multiple parameters are provided in the URL)
//HTTP Parameter Pollution, as implied by the name, pollutes the HTTP parameters of a web application in order to perform or achieve a specific malicious task/attack different from the intended behavior of the web application.
app.use(hpp({
    whitelist: [//allows us to search by multiple parameters ex- /tours?duration=5&duration=9, and also preventing parameter pollution
        'duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price'
    ]
}));

//test middleware
app.use((req, res, next) => {
    console.log('Hello from the Middle Ware.');
    next();//if we dont call next the request will get stuck here and we will never get a response.
});

app.use(compression());//to compress all text (JSON etc) thats sent to the client

//test middleware
app.use((req, res, next) => {
    //Modifying the req obj. and adding a custom requestTime property to it that holds a date time value.
    req.requestTime = new Date().toISOString();
    // console.log('APP.js------------')
    // console.log(req.headers);
    //console.log(req.cookies);//outputs the JSON web
    next();//if we dont call next the request will get stuck here and we will never get a response.
});






// app.get('/', (req, res) => {
//     res.status(200).json({message: 'Hello from the server side!', app: 'Natours'});
// });


// app.post('/', (req, res) => {
//     res.status(200).send(`You can post here...`);
// });

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

// const getAllTours = (req, res) => {

//     console.log(req.requestTime);

//     res.status(200).json(
//         {
//         status: 'success', 
//         requestedAt: req.requestTime,
//         results: tours.length,
//         data: {
//             tours: tours
//         }
//     });
// };

// const createTour = (req, res) => {
//     // console.log(req.body);
//     const newId = tours[tours.length - 1].id + 1;
//     const newTour = Object.assign({ id: newId }, req.body);

//     tours.push(newTour);

//     fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
//         //************* IMPORTANT We cant send 2 responses at the same time
//         res.status(201).json({
//             status: 'success',
//             data: {
//                 tour: newTour
//             }
//         }
//         );
//     });
// };

// const getTour = (req, res) => {

//     console.log(req.params);

//     // const tour = tours.forEach(t => {
//     //     if (req.params.id === t.id){
//     //         return t;
//     //     }
//     // });

//     // res.status(200).json(
//     //     {
//     //     status: 'success', 
//     //     results: tours.length,
//     //     data: {
//     //         tours: tours
//     //     }
//     // });

//     const id = req.params.id * 1;

//     const tour = tours.find(el => el.id === id);//req.params.id * 1 can also be used to convert string to a number

//     // if (id >= tours.length){
//     if (!tour){        
//         //we are returning to stop code execution continuing
//         return res.status(404).json({
//             status: 'fail',
//             message: 'Invalid ID'
//         });        
//     }

//     //find will return the condition if the requirement is met

//     res.status(200).json(
//         {
//         status: 'success', 
//         data: {
//             tour: tour
//         }
//     });

// };

// const updateTour = (req, res) => {

//     if (req.params.id >= tours.length){
//        //we are returning to stop code execution continuing
//        return res.status(404).json({
//            status: 'fail',
//            message: 'Invalid ID'
//        });        
//    }

//    //find will return the condition if the requirement is met

//    res.status(200).json(
//        {
//        status: 'success', 
//        data: {
//            tour: '<Updated tour here...>'
//        }
//    });
// };

// const deleteTour = (req, res) => {

//     if (req.params.id >= tours.length){
//        //we are returning to stop code execution continuing
//        return res.status(404).json({
//            status: 'fail',
//            message: 'Invalid ID'
//        });        
//    }

//    //find will return the condition if the requirement is met

//    res.status(204).json(
//        {
//        status: 'success', 
//        //when we are deleting we don't send data back we send null and status 204
//        data: null
//    });
// };

// const getAllUsers = (req, res) => {

//     console.log(req.requestTime);

//     res.status(500).json(
//         {
//         status: 'error', 
//         message: 'Method not defined.'
//     });
// };

// const getUser = (req, res) => {

//     console.log(req.requestTime);

//     res.status(500).json(
//         {
//         status: 'error', 
//         message: 'Method not defined.'
//     });
// };

// const createUser = (req, res) => {

//     console.log(req.requestTime);

//     res.status(500).json(
//         {
//         status: 'error', 
//         message: 'Method not defined.'
//     });
// };

// const updateUser = (req, res) => {

//     console.log(req.requestTime);

//     res.status(500).json(
//         {
//         status: 'error', 
//         message: 'Method not defined.'
//     });
// };

// const deleteUser = (req, res) => {

//     console.log(req.requestTime);

//     res.status(500).json(
//         {
//         status: 'error', 
//         message: 'Method not defined.'
//     });
// };

// app.get('/api/v1/tours', getAllTours);

// //**********IMPORTANT to get request body data we need middle ware functions
// app.post('/api/v1/tours', createTour);

// // to define  multiple URL params '/api/v1/tours/:id/:x/:y'
// // to define  a optional URL param use a '?' mark like this '/api/v1/tours/:id/:x?/:y?'
// app.get('/api/v1/tours/:id', getTour);

// app.patch('/api/v1/tours/:id', updateTour);

// app.delete('/api/v1/tours/:id', deleteTour);


//FRONT END
app.use('/', viewRouter);

//API
app.use('/api/v1/tours', tourRouter);

app.use('/api/v1/users', userRouter);

app.use('/api/v1/reviews', reviewRouter);

app.use('/api/v1/bookings', bookingRouter);

//error handling middle ware - if either the tourRouter or userRouter were not able to handle it it is a error 
//thats why we put it below tour and user routers
//.all() - all http requests, * - means routes not handled before, if this was put below const app = express(), then it will show up for all routes
//because .all means all http requests
app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status: 'fail',
    //     message: `Can't find ${req.originalUrl} on this Server.`
    // });

    // const err = new Error(`Can't find ${req.originalUrl} on this Server.`);
    // err.status = 'Fail';
    // err.statusCode = 404;
    // next(err);//if next has a error parameter then it will skip all other MW and proceed to the Global Error MW
    //defined below.

    next(new AppError(`Can't find ${req.originalUrl} on this Server.`));
});

//GLOBAL error handling middle ware to handle both operational errors 404 etc and programming errors
//when we specify 4 parameters for a middle ware function express knows its a error handling middleware 
app.use(globalErrorHandler); 

//The routes are also middle wares if we put this MW below the above routes it will not get executed
//if any of the above routes are called because 
//MW functions will be executed in the order they are defined

// app.use((req, res, next) => {
//     console.log('Hello from the Middle Ware.');
//     next();//if we dont call next the request will get stuck here and we will never get a response.
// });

// const port = 3000;

// //app.use() is used to generate MW functions in our app.

// app.listen(port, ()=>{
//     console.log(`App running on port ${port}`);
// });

module.exports = app;    

//https://stackoverflow.com/questions/35530930/nodemon-not-working-bash-nodemon-command-not-found
/*

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://process.env.DATABASE_USERNAME:process.env.DATABASE_PASSWORD@cluster0-opo2t.mongodb.net/natours-app?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  //const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});

*/