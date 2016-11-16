var User = require('../models/user');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'Mailgun',
  auth: {
    user: process.env.MAILGUN_USERNAME,
    pass: process.env.MAILGUN_PASSWORD
  }
});

/**
 * GET /contact
 */
exports.contactGet = function(req, res) {
  res.render('contact', {
    title: 'Contact'
  });
};

/**
 * POST /contact
 */
exports.contactPost = function(req, res) {
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
