const express = require('express');
const router = express.Router();
const Joi = require('joi');
const _ = require('lodash');
const UserDetails = require('../models/user');

const paramMiddleware = (page) => {
    return (req, res, next) => {

        const error = req.flash('error');
        const customError = req.flash('customError');
        if (error.length || customError.length) {
           
            // return res.redirect('/auth/login_get');
            return res.render('auth/' + page, {
                messages: error,
                customError,
            });
        }
        next();
    }
}

function IsNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        // The user is logged in
        return res.redirect('/')
    } else {
        // The user is logged out
        next();
    }
}


router.get('/login', [paramMiddleware('login'), IsNotAuthenticated], (req, res) => {

    return res.render('auth/login');
});

router.get('/register', [paramMiddleware('register'), IsNotAuthenticated], (req, res) => {

    return res.render('auth/register');
});

router.post('/login', async (req, res) => {

    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(6).max(255).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        req.flash('error', error.details)
        return res.redirect('/auth/login');
    }

    let user = await UserDetails.findOne({ email: req.body.email });
    if (!user) {
        req.flash('customError', 'email is not found!')
        return res.redirect('/auth/login');
    }


    user.authenticateUser(req.body.password, user.password)
        .then(async (isValid) => {
            if (!isValid) {
                req.flash('customError', 'Invalid email or password')
                return res.redirect('/auth/login');
            }
            await req.login(user, function (err) {
                if (err) { return next(err); }
                return res.redirect('/');
            });
        })
        .catch(err => {
            return next(err);
        });



    // res.send(token);
});

router.post('/register', async (req, res) => {

    const schema = Joi.object({
        name: Joi.string().min(6).max(255).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(6).max(255).required(),
    });

    const { error } = schema.validate(req.body,{ abortEarly: false });

    // const { error } = validate(req.body);
    if (error) {
        req.flash('error', error.details)
        return res.redirect('/auth/register');
    }

    let user = await UserDetails.findOne({ email: req.body.email });
    if (user){
        req.flash('customError', 'there is a user with same email.')
        return res.redirect('/auth/login');
        // return res.status(400).send();
    } 
    
    user = new UserDetails({ email: req.body.email, name: req.body.name, password: req.body.password });

    UserDetails.register(_.pick(user, ['name', 'email', 'password']), req.body.password, function (err, user) {

        if (err) {
            req.flash('customError', "Your account could not be saved. Error: " + err )
        return res.redirect('/auth/register');
            // return res.send({ success: false, message: "Your account could not be saved. Error: " + err });
        }
        else {
            return req.login(user, (er) => {
                if (er) {

                    req.flash('customError', "Your account could not be saved. Error: " + err )
                    return res.redirect('/auth/register');
                    // return res.send({ success: false, message: err })
                }
                else {
                    return res.redirect('/')
                    // return res.send('succefuuly logi')

                }
            });
        }
        
    });
});

router.delete('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        req.session.destroy();
        res.redirect('/auth/login');
    });
})

function validate(user) {

    const schema = Joi.object({
        name: Joi.string().min(6).required(),
        email: Joi.string().min(5).max(255).required().email(),
    });

    return schema.validate(user);

}


module.exports = router