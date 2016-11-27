var User = require('../models/user');
var auth = require('../public/js/authentication');
var db = require('../public/js/db');

/**
 * GET /contact
 */
exports.loginGet = function(req, res) {
  res.render('login', {
    title: 'Login'
  });
};

/**
 * POST /contact
 */
exports.loginPost = function(req, res) {
    db.getUser(req.body.email).then(function (user) {
        console.log('user:');
        console.log(user);
    });
    auth.authenticate(req.body.email, req.body.password, function(err, user) {
        if (user) {
            req.session.regenerate(function() {
                req.session.user = user;
                res.redirect('/profile');
            });
        } else {
            req.flash('error', {msg: err.message});
            res.redirect('/login');
        }
    });
};
