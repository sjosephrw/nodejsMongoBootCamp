const mongoose = require('mongoose');
const slugify = require('slugify');
//const validator = require('validator');

//Models
// const User = require('./userModel');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a Name'],
        unique: true,
        trim: true, //to remove white space from the beginning and the end of the string
        maxlength: [40, 'A tour name can not be more than 40 characters.'],
        minlength: [10, 'A tour name can not be less than 10 characters.']/*,
        //custom validators
        validate: [validator.isAlpha, 'Tour name must contain only letters.']
        /*
        /*
          can do it like this also
        validate:{
            validator: validator.isAlpha,
            message: 'Tour name must contain only letters.'
        }
          
        */
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']        
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']        
    },  
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {//only for strings
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either easy, medium or difficult.'
        }        
    },  
    ratingsAverage: {
        type: Number,
        default: 4.5,
        max: [5, 'A rating can not be more than 5.0'],//can be used for dates as well
        min: [1, 'A rating can not be less than 1.0'],//can be used for dates as well        
        set: (val) => Math.round(val * 10)/10 //setter function to round up the ratingsAverage to the nearest 1st decimal place, Lec - 169 
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },    
    price: {
        type: Number,
        required: [true, 'A tour must have a Price']
    },
    priceDiscount: {
        type: Number,
        validate:{
            validator: function(val){
                //this only points to current DOC on new DOC creation
                return val < this.price;
            },
            message: 'Discount should be less than the ({VALUE}).'//function(val) value will be displayed in ({VALUE})
        } 
    },
    summary: {
        type: String,
        trim: true, //to remove white space from the beginning and the end of the string
        required: [true, 'A tour must have a summary']  
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a Cover Image']
    },
    images: [String], //an array of stings (Multiple images as  strings)
    createdAt: {
        type: Date,
        default: Date.now(),//give the date in milliseconds (Unix time stamp)
        select: false //we are hiding this from the output, this is a test(THis is how we hide sensitive data)
    },
    startDates: [Date], //an array of Dates
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        //GEOJSON - it has to be specified as below
        type: {
            type: String,
            default: 'Point',//other options - line, polygon
            enum: ['Point']//we dont wnat line and polygon only Point
        },
        coordinates: [Number],//expecting a array of Numbers
        address: String,//optional
        description: String//optional
    },
    locations: [
        {
            //GEOJSON - it has to be specified as below
            type: {
                type: String,
                default: 'Point',//other options - line, polygon
                enum: ['Point']//we dont wnat line and polygon only Point
            },
            coordinates: [Number],//expecting a array of Numbers
            address: String,//optional
            description: String,//optional            
            day: Number//optional 
        }
    ],
    //guides: Array
    guides: [
        { 
            type: mongoose.Schema.ObjectId,//ObjectId("5d...........")
            ref: 'User' //Child referencing, this comes from the User Collection(Happens behind the scenes), Not even necessary to import the User Model
        }
    ]//,
    //we could have created a ary here that will store all the review IDs but that could grow indefinitely
    // reviews: [//to get the reviews for a tour we could write a query to do it manually, but we are creating
    //     //a child ref. as a virtual property that will store the reviews data in a virtual array that
    //     //wont be persisted in the DB, but will only show in the output. 
    //     {
    //         type: mongoose.Schema.ObjectId,//ObjectId("5d...........")
    //         ref: 'Review' //Child referencing, this comes from the review Collection(Happens behind the scenes), Not even necessary to import the review Model
    //     }    
    // ]
},
{   //enable virtual properties defined below
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

//lecture 166 improving read performance with indexes, 
//{{URL}}/api/v1/tours?price[lt]=1000 when these URLs were run mongo will have to query all documents
//and return the result that takes time, but with the index below (1 for price asc, -1 desc, most of the time 1 or -1 is not important) it does not take too long
//tourSchema.index({ price: 1 });
//{{URL}}/api/v1/tours?price[lt]=1000&ratingsAverage[gte]=4.7
tourSchema.index({ price: 1, ratingsAverage: -1 });//compound index(DONT add too many indexes use a few because it takes a lot of DISK SPACE, we think price and ratingsAverage will be queried a lot thats why we set indexes on those fields)
tourSchema.index({ slug: 1});

//lec - 170, to do geospatial queries we must specify a index on the field that stores the geospatial data
//but this time we are not going to set it to 1 or -1, for geospatial data we need a special index
//it is 2D sphere index if the data describes real points on a earth like sphere
tourSchema.index({ startLocation: '2dsphere' });

//VIRTUAL PROPERTIES ARE FIELDS THAT WE DONT WANT IN THE DB BUT WE WANT THEM FOR CERTAIN CALCULATIONS EX - IF WE HAVE MILES STORED IN THE DB THEN WE 
//DONT NEED TO STORE KILO METERS AS WELL AS MILES WE CAN USE A VIRTUAL PROPERTY FOR THIS CONVERSION.
//.get() because we want this on a get request
//arrow functions dont have a this keyword only regular functions that's why we are using it here
tourSchema.virtual('durationWeeks').get(function(){
    return this.duration / 7;
});

//VIRTUAL PROPERTIES , reviews is the name of the virtual property
//to get the reviews for a tour we could write a query to do it manually, but we are creating
//a child ref. as a virtual property that will store the reviews data in a virtual array that
//wont be persisted in the DB, but will only show in the output. 
tourSchema.virtual('reviews', {
    ref: 'Review',//the child reference.
    foreignField: 'tour',//the tour field in the reviews collection (The 2 fields to join)
    localField: '_id'//the _id field in the Tour Collection (The 2 fields to join)
});

//DOCUMENT MIDDLE WARE OR MONGOOSE MIDDLE WARE
//THESE FUNCTIONS WILL RUN BEFORE INTERACTING WITH THE DB BECAUSE THEY ARE PRE MIDDLEWARE POST MIDDLEWWARE RUNS AFTER INTERACTING WITH THE DB
//runs before save and create but not before insertMany
tourSchema.pre('save', function(next){
    // console.log(this);//outputs the document being saves or created
    //slug has to be defined in the Schema
    this.slug = slugify(this.name, { lower: true });//modify the document (The Tour) being created add a slud property add the URL slug from the name and convert the letters to lowercase
    next();//if there is only 1 middle ware next is not necessary if there are more than 1 it is necessary
});



//another pre save middle ware (To get other guide info from the ID's and save it in the DB)
//but if the user would change his Name or email all the tours will have to be updated, but we wont do it in this course
//SO WE WONT BE USING THIS MW
// tourSchema.pre('save', async function(next){
//     const guidesPromises = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidesPromises);
//     next();//if there is only 1 middle ware next is not necessary if there are more than 1 it is necessary
// });

// //another pre save middle ware
// tourSchema.pre('save', function(next){
//     console.log('Will save document!...');
//     next();//if there is only 1 middle ware next is not necessary if there are more than 1 it is necessary
// });

// // POST MIDDLEWWARE RUNS AFTER INTERACTING WITH THE DB
// tourSchema.post('save', function(doc, next){
//     console.log(doc);//outputs the document after saving
//     next();//if there is only 1 middle ware next is not necessary if there are more than 1 it is necessary
// });

//QUERY MIDDLE WARE
//these run before each QUERY, if we have certain tours that should only be available internally or to VIP's and not to the public
//we will create a secret tour field and query the DB for that
//tourSchema.pre('find', function(next){//works only for find
tourSchema.pre(/^find/, function(next){//works with all find mehtods ex findOne()
    this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next();//if there is only 1 middle ware next is not necessary if there are more than 1 it is necessary
});
//QUERY MW
//to populate other userinfo in get tours and get a single tour because the DB stores only the ID
tourSchema.pre(/^find/, function(next){//works with all find mehtods ex findOne()
    //In the tourModel.js we specified the ref. attribute as 'User' for guides the DB stores only the guide ID 
    //populates('guides') will populate the other data email and name etc.
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt' //omit these 2 fields in the output
    });
    next();//if there is only 1 middle ware next is not necessary if there are more than 1 it is necessary
});

//POST QUERY MIDDLE WARE
tourSchema.post(/^find/, function(docs, next){//works with all find mehtods ex findOne()
    console.log(`tourModel.js -Query took ${Date.now() - this.start} milliseconds`);
    // console.log(docs);
    next();//if there is only 1 middle ware next is not necessary if there are more than 1 it is necessary
});

//though we are hiding the secret tours in the regular queries the tours are still being displayed in the AGGREGATION queries
//to prevent this we use a aggregation middle ware.
//**********IMPORTANT this MW was causing a error in lec - 171, Geospatial Aggregation:Calculating Distances */
//SO WE WERE ASKED TO GET RID OF IT
tourSchema.pre('aggregate', function(next){
    //console.log(this.pipeline());//THIS WAS SHOWING THE ERROR DESCRIBED ABOVE
    // Hide secret tours if geoNear in lec 171 is NOT used
    if (!(this.pipeline().length > 0 && '$geoNear' in this.pipeline()[0])) {
            this.pipeline().unshift({
                $match: { secretTour: { $ne: true } }
            });
    }    
    next();//if there is only 1 middle ware next is not necessary if there are more than 1 it is necessary
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;