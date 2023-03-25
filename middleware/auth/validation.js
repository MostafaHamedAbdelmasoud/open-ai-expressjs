
const Joi = require('joi');


const handleValidation = (fields) => {
    return (req, res, next) => {

        const { error } = validate(req.body, fields)
        if (error) {
            console.log('dsds');
            req.flash('error', error.details)
            return res.redirect('back');
        }

        next();
    }
}

function validate(user, fields) {
    const schema = Joi.object(fields);

    return schema.validate(user,{ abortEarly: false});
}



module.exports = handleValidation