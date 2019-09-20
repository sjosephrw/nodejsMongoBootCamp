//review /rating /createdAt / ref to tour / ref to user 
const mongoose = require('mongoose');
const Tour = require('./tourModel');

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
//*********IMPORTANT THE ratingsAverage and ratingsQunatity will be calculated when a review is created updated and deleted  */
//STATIC METHOD
reviewSchema.statics.calcAverageRatings = async function(tourId){
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                //in group the 1st field is _id
                _id: '$tour',//group all the tours by tour
                nRating: { $sum: 1 },//if there are 5 review docs then add 1 for each doc
                avgRating: { $avg: '$rating' }//calculate the average rating using the ratings in the rating field
            }
        }    
    ]);//in a static method the this keyword points to the model
    console.log(stats); //output [ { _id: 5d84a76a1614fb23a5c1097e, nRating: 2, avgRating: 3.5 } ]
    if (stats.length > 0){
    
        //Then we update the tour collection with the ratingsAverage and ratingsQuantity data
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    
    } else {//if all the reviews are removed then there will be a error this prevents that
        //Then we update the tour collection with the ratingsAverage and ratingsQuantity default data
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });        
    }

} 

//*********IMPORTANT THE ratingsAverage and ratingsQunatity will be calculated when a review is created updated and deleted  */
//MONGOOSE MW to save average ratings (POST MW DOES NOT HAVE next())
reviewSchema.post('save', function(){//dont use pre because on pre the review is not yet saved into the DB as yet
    //this points to the current review
    //static method **************BUT THIS WONT WORK (because the review has not been decalred as yet)
    //we can move it below const Review = mongoose.model('Review', reviewSchema);
    //but then the reviewSchema will not contain this method   
    //Review.calcAverageRatings(this.tour);//(WONT WORK) 'this' means the current review this.tour is the tourId
    //So what we do is
    this.constructor.calcAverageRatings(this.tour);

});

//*********IMPORTANT THE ratingsAverage and ratingsQunatity will be calculated when a review is created updated and deleted  */
//but when updating we can not use document MW we use Query PRE MW
reviewSchema.pre(/^findOneAnd/, async function(next){//QUERY MW - will work for findOneAndUpdate(findByIdAndUpdate) and findOneAndDelete (findByIdAndDelete)
    //'this' means the query if we execute it we get the document
    //const r = await this.findOne();//r - review//************But this wont work because findOne gets the doc. in the DB but at this time the review is not saved in the DB neither can we change pre to post so we have to use another post() MW Below*/
    this.r = await this.findOne();//to pass the tourId from pre MW to the post MW below
    //console.log(this.r);
    next();
});

//QUERY POST MW
reviewSchema.post(/^findOneAnd/, async function(){
    //const r = await this.findOne();//wont work query has already executed
    await this.r.constructor.calcAverageRatings(this.r.tour);//this.r.tour to get access to the tourID passed from the PRE MW ABOVE TO THIS POST MW FUNCTION
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;