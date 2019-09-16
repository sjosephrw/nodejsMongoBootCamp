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
            ref: 'Tour', //means this comes from the User Collection(Happens behind the scenes), Not even necessary to import the User Model
            required: [true, 'Review must belong to a tour.']

        },
        user: { 
            type: mongoose.Schema.ObjectId,//ObjectId("5d...........")
            ref: 'User', //means this comes from the User Collection(Happens behind the scenes), Not even necessary to import the User Model
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

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;