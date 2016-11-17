var User = require('../models/user');
var Grade = require('../models/grade');
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
        email: req.body.email,
        password: req.body.password,
        phone_number: req.body.phoneNumber,
        directoryId: req.body.umdusername,
        directoryPass: req.body.umdpass
    }).save().then(function(saved) {
        new User({email: req.body.email})
            .fetch()
            .then(function(model){
                var id = model.get('id');
                console.log("Created user with ID " + id);
                courses.forEach(function(course){
                    new Grade({
                        user_id: id,
                        courseCode: course,
                        grade: 0.0
                    }).save();
                });
            }).then(function(){
                req.flash('success', { msg: 'Information saved for ' + req.body.email });
                res.redirect('/contact');
            });
    });
};
