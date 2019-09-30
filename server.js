const mongoose = require('mongoose');
const dotenv = require('dotenv');

//to handle uncaught exception errors
process.on('uncaughtException', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    console.log(err);//I am logging this to see the entire error stack
    //server.close(()=> {//at this poin the server is undefined so we have no other alternative but to shutdown abruptly
        process.exit(1);
    //});
    //process.exit(1);//( SHUTTING DOWN ABRUPTLY ) to shutdown the application, 1 - uncaught exception, 0 - success 
});

dotenv.config({path: './config.env'});//*************IMPORTANT - THE CONFIG FILE MUST BE IMPORTED BEFORE const app = require('./app');*/

const app = require('./app');

// console.log(process.env);//logs the environment vars.
// console.log(process.env.NODE_ENV);//logs the NODE_ENV environment var.
// console.log(app.get('env'));//logs the mode either development or production

const port = process.env.PORT || 3000;

//https://stackoverflow.com/questions/16576983/replace-multiple-characters-in-one-replace-call
String.prototype.allReplace = function(obj) {
    var retStr = this;
    for (var x in obj) {
        retStr = retStr.replace(new RegExp(x, 'g'), obj[x]);
    }
    return retStr;
};

const DB = process.env.DATABASE.allReplace({'<USERNAME>': process.env.DATABASE_USERNAME, '<PASSWORD>': process.env.DATABASE_PASSWORD});

// console.log(DB);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false    
})
.then(conn => {
    //console.log(conn.connections);
    console.log('DB Connection successful.');
});

//***********we created the model in the server.js to create a Tour just by reloading the server and not by calling a route */
// const tourSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: [true, 'A tour must have a Name'],
//         unique: true
//     },
//     rating: {
//         type: Number,
//         default: 4.5
//     },
//     price: {
//         type: Number,
//         required: [true, 'A tour must have a Price']
//     }
// });

// const Tour = mongoose.model('Tour', tourSchema);

// const testTour = new Tour({
//     name: 'The Park Camper',
//     price: 997
// });

// testTour.save()
// .then(doc => {
//     console.log(doc);
// })
// .catch(err => {
//     console.log(err);
// });

const server = app.listen(port, ()=>{
    console.log(`App running on port ${port}`);
});

//to handle unhandled promise rejection errors
process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    console.log(err);//I am logging this to see the entire error stack
    server.close(()=> {
        process.exit(1);//( SHUTTING DOWN PROPERLY - because its inside server.close ) to shutdown the application, 1 - uncaught exception, 0 - success 
    });
    //process.exit(1);//( SHUTTING DOWN ABRUPTLY ) to shutdown the application, 1 - uncaught exception, 0 - success 
});

//to handle heroku sigterm signals
//these signals shutdown the app from time to time, but the shutdown can be very abrupt to handle the
//shtdown gracefully

process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
      console.log('💥 Process terminated!');
    });
  });