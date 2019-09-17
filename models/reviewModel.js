//review /rating /createdAt / ref to tour / ref to user 
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review can not be empty.']
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        tour: { 
            type: mongoose.Schema.ObjectId,//ObjectId("5d...........")
            ref: 'Tour', //Parent Referencing, this comes from the Tour Collection(Happens behind the scenes), Not even necessary to import the Tour Model
            required: [true, 'Review must belong to a tour.']

        },
        user: { 
            type: mongoose.Schema.ObjectId,//ObjectId("5d...........")
            ref: 'User', //Parent Referencing, this comes from the User Collection(Happens behind the scenes), Not even necessary to import the User Model
            required: [true, 'Review must belong to a user.']

        }
    },
    {   //enable virtual properties defined below
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
    //VIRTUAL PROPERTIES ARE FIELDS THAT WE DONT WANT IN THE DB BUT WE WANT THEM FOR CERTAIN CALCULATIONS EX - IF WE HAVE MILES STORED IN THE DB THEN WE 
    //DONT NEED TO STORE KILO METERS AS WELL AS MILES WE CAN USE A VIRTUAL PROPERTY FOR THIS CONVERSION.
);

//QUERY MW
//to populate other userinfo and tour info in getAllReviews because the DB stores only the tour and user ID
reviewSchema.pre(/^find/, function(next){//works with all find mehtods ex findOne(), not sure
    //In the reviewModel.js we specified the ref. attribute as 'Tour' for tours the DB stores only the tour ID 
    //in order to display some tour data along with the review without just displaying the tour ID
    // this.populate({
    //     path: 'tour',
    //     select: 'name'//populate only the tour name
    // }).populate({//in order to display some User data along with the review without just displaying the User ID
    //     path: 'user',
    //     select: 'name photo'//populate only the users name and the photo
    // });

    this.populate({//in order to display some User data along with the review without just displaying the User ID
        path: 'user',
        select: 'name photo'//populate only the users name and the photo
    });    
    next();//if there is only 1 middle ware next is not necessary if there are more than 1 it is necessary
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;