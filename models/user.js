
const Joi = require("joi");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const passportLocalMongoose = require('passport-local-mongoose');

const User = new mongoose.Schema({
    name: {
        type: String,
        // required: true,
        minlength: 2,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255
    },
    password: {
        type: String,
        // required: true,
        minlength: 5,
        maxlength: 255,
    },
    firstName:{
        type: String
    },
    lastName:{
        type: String
    },
    profilePhoto:{
        type: String
    },
    source:{
        type: String
    },
    lastVisited:{
        type: Date
    }
});


User.plugin(passportLocalMongoose, { usernameField: 'email' });
//   const User = mongoose.model("User", userSchema);

User.pre('save', function (next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) {
        return next();
    }

    // password changed so we need to hash it (generate a salt)
    bcrypt.genSalt(10, function (err, salt) {
        if (err) {
            return next(err);
        } else {
            // hash the password using our new salt
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) { return next(err); }
                // override the cleartext password with the hashed one
                user.password = hash;
                next();
            });
        }
    });
});

User.methods.authenticateUser = async function (clear, hashed) {
    return await bcrypt.compare(clear, hashed);
}

function validateUser(user) {
    const schema = Joi.object({
        name: Joi.string()
            .min(2)
            .max(50)
            .required(),
        email: Joi.string()
            .min(5)
            .max(255)
            .required()
            .email(),
        password: Joi.string()
            .min(5)
            .max(255)
            .required()
            .email(),

    });
    const validation = schema.validate(user);

    return validation;
}


module.exports = mongoose.model('userData', User, 'userData');
//   exports.validate = validateUser;