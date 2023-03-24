const express = require('express');

const users = require('../routes/users');
const error = require('../middleware/error');
const connectEnsureLogin = require('connect-ensure-login'); //authorization
const methodOverride = require('method-override');


module.exports = function(app) {
  app.use(express.json());

  app.use(methodOverride('_method'));

  app.use('/auth', users);


  app.get('/', connectEnsureLogin.ensureLoggedIn('/auth/login'), (req, res) => {
    return res.render('open_index');
});


  app.use(error);
}