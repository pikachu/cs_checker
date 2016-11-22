var User = require('../models/user');
var auth = require('../public/js/authentication');

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
