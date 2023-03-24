const express = require('express');
const router = express.Router();
const Joi = require('joi');
const _ = require('lodash');
const UserDetails = require('../models/user');

const paramMiddleware = (page) => {
    return (req, res, next) => {
        const error = req.flash('error');
        if (error.length) {
            console.log(error);
            return res.render('auth/' + page, {
                messages: error,
                customError: '',
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

    return res.render('auth/login', {
        messages: '',
        customError: '',
    });
});

router.get('/register', [paramMiddleware('register'), IsNotAuthenticated], (req, res) => {
    // return res.send('dsd');
    return res.render('auth/register', {
        customError: '',
        messages: ''
    });
});

router.post('/login', async (req, res) => {

    const schema = Joi.object({
        // name: Joi.string().min(6).required(),
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
        return res.render('auth/login', {
            customError: 'user is not found!',
            messages: ''
        })
    }
    // res.status(400).send('Invalid email or password.');

    user.authenticateUser(req.body.password, user.password)
        .then(async (isValid) => {
            if (!isValid) {
                return res.render('auth/login', {
                    customError: 'Invalid email or password',
                    messages: ''
                })
            }
            await req.login(user, function (err) {
                if (err) { return next(err); }
                return res.redirect('/');
            });
        })
        .catch(err => {
            // console.log(err)
            return next(err);
            //   logServerErrorAndRespond(err, `Authentication error`, res);
        });



    // res.send(token);
});

router.post('/register', async (req, res) => {

    const schema = Joi.object({
        name: Joi.string().min(6).max(255).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(6).max(255).required(),
    });

    const { error } = schema.validate(req.body);

    // const { error } = validate(req.body);
    if (error) {
        req.flash('error', error.details)
        return res.redirect('/auth/register', {

            customError: 'Invalid email or password',
            messages: ''
        });
    }

    let user = await UserDetails.findOne({ email: req.body.email });
    if (user) return res.status(400).send('there is a user with same email.');

    user = new UserDetails({ email: req.body.email, name: req.body.name, password: req.body.password });

    UserDetails.register(_.pick(user, ['name', 'email', 'password']), req.body.password, function (err, user) {
        // console.log(user);
        if (err) {
            return res.send({ success: false, message: "Your account could not be saved. Error: " + err });
        }
        else {
            return req.login(user, (er) => {
                if (er) {
                    console.log(er.message)
                    return res.send({ success: false, message: err })
                }
                else {
                    return res.redirect('/')
                    // return res.send('succefuuly logi')

                }
            });
        }
        // user = new User()
        // console.log(user);

        // res.send(token);
    });
});

router.delete('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        console.log(req.session)
        req.session.destroy();
        console.log(req.session)
        console.log('lougout')
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