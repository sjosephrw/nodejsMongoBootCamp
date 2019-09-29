const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Booking must belong to a tour!']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Booking must belong to a User!']
    },
    price: {
        type: Number,
        required: [true, 'Booking must have a price!']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }, 
    paid: {
        type: Boolean,
        default: true
    }     

});

//mongoose query MW
//to populate tour data and user data along with the booking data, this outputs a lot of info but this route will be 
//used by admin and lead-guides only so it wont be very resource intensive
bookingSchema.pre(/^find/, function(next) {
    this.populate('user').populate({
      path: 'tour',
      select: 'name'
    });
    next();
  });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;