const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name.']        
    },
    email: {
        type: String,
        required: [true, 'Please provide us a email.'],
        unique: true,
        lowercase: true,
        //custom validators
        validate: [validator.isEmail, 'Please provide a valid Email!']        
    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password.'],
        minlength: 8,
        select: false //to prevent the password from showing up in the JSON response output (because the password is private)        
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password.'],
        //custom validators
        validate: {
            //only works on save and create
            validator: function(el){//cant use a arrow function because we are using the 'this' keyword
                return el === this.password;
            },
            message: 'Passwords are not the same!.' 
        }    
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false//do not show in JSON output
    }
});

// //mongoose middleware to hash password
// userSchema.pre('save', async function(next){
//     //'this' means the current document
//     //if the password is not being modified then exit this function 
//     if (!this.isModified('password')) return next();

//     //hashing the password
//     //bcrypt return a promise
//     this.password = await bcrypt.hash(this.password, 12);

//     //passwordConfirm though it is a required field, it is only required as a input and it is 
//     //not to be persisted in the DB, that is why it is undefined below
//     this.passwordConfirm = undefined;
//     next();
// });

// //if the password has been modified then set the passwordChangedAT value to now. 
// userSchema.pre('save', function(next){
//     //if the password has NOT been modified or the document is new then exit this function 
//     if (!this.isModified('password') || this.isNew) return next();
//     this.passwordChangedAt = Date.now() - 1000;//subtract 1 sec. from now otherwise it causes a issue with the JWT making it impossible to login, this is a small hack to fix that
//     next();
// });

//regex - find all methods beginning with find, findBydId, find, FindByIdAndUpdate
//this is query middleware
userSchema.pre(/^find/, function(next){
    //this points to the current query
    this.find({ active: { $ne: false } });
    //this.find({ active: true });
    next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp){
    if (this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);//to convert it to seconds, (, 10) - means base 10
        console.log(JWTTimestamp, changedTimestamp);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
}

userSchema.methods.createPasswordResetToken = function (){
    const resetToken = crypto.randomBytes(32).toString('hex');
    //encrypting the reset token
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    //setting the token expiry time
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;//10 min in miliseconds
    console.log({resetToken}, this.passwordResetToken);
    return resetToken;//to send by email
}


const User = mongoose.model('User', userSchema);

module.exports = User;