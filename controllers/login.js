var User = require('../models/user');

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
    var courses = req.body.courses.split(',').map(function(str) {
        return str.trim();
    });

    new User({
        username: req.body.username,
        password: req.body.password,
        phone_number: req.body.phoneNumber,
        courses: courses
    }).save().then(function(saved) {
        req.flash('success', { msg: 'Information saved for ' + req.body.username });
        res.redirect('/contact');
    });
};
