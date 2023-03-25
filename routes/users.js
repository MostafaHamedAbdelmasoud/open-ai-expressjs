const express = require('express');
const router = express.Router();
const Joi = require('joi');
const _ = require('lodash');
const UserDetails = require('../models/user');
const  IsNotAuthenticated  = require('../middleware/auth/index');
const  paramMiddleware = require('../middleware/auth/error');
const  handleValidation = require('../middleware/auth/validation');


router.get('/login', [paramMiddleware('login'), IsNotAuthenticated], (req, res) => {

    return res.render('auth/login');
});

router.get('/register', [paramMiddleware('register'), IsNotAuthenticated], (req, res) => {

    return res.render('auth/register');
});



router.post('/login',
    handleValidation({
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(6).max(255).required()
    })
    , async (req, res) => {

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



    });

router.post('/register',
    handleValidation({
        name: Joi.string().min(6).max(255).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(6).max(255).required(),
    })
    , async (req, res) => {


        let user = await UserDetails.findOne({ email: req.body.email });
        if (user) {
            req.flash('customError', 'there is a user with same email.')
            return res.redirect('/auth/login');
            // return res.status(400).send();
        }

        user = new UserDetails({ email: req.body.email, name: req.body.name, password: req.body.password });

        UserDetails.register(_.pick(user, ['name', 'email', 'password']), req.body.password, function (err, user) {

            if (err) {
                req.flash('customError', "Your account could not be saved. Error: " + err)
                return res.redirect('/auth/register');
            }
            else {
                return req.login(user, (er) => {
                    if (er) {

                        req.flash('customError', "Your account could not be saved. Error: " + err)
                        return res.redirect('/auth/register');
                    }
                    else {
                        return res.redirect('/')

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


module.exports = router