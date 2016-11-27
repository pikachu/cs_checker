var User = require('../models/user');
var Grade = require('../models/grade');
var bookshelf = require('../bookshelf');
var nodemailer = require('nodemailer');
var auth = require('../public/js/authentication');
var crypt = require('../public/js/encryption');
var exec = require('child_process').execSync;

/**
 * GET /contact
 */
exports.signupGet = function(req, res) {
  res.render('signup', {
    title: 'Contact'
  });
};

/**
 * POST /contact
 */
exports.signupPost = function(req, res) {
    var courses = req.body.courses.split(',').map(function(str) {
        return str.trim();
    });
    var email = req.body.email;
    var password = req.body.password;
    bookshelf.knex('users').where('email', email).orWhere('directory_id', req.body.umdusername).then(function(user) {
        if (user.length > 0) {
            req.flash('error', {msg: 'That user already exists!'});
            res.redirect('/signup');
        }
        verifyUser(req.body.umdusername, req.body.umdpass, function(shouldContinue){
            if (shouldContinue){
                auth.hash(password, function (err, salt, hash) {
                    if (err) throw err;
                    var user = new User({
                        email: email,
                        password_salt: salt,
                        password_hash: hash.toString('base64'),
                        phone_number: req.body.phoneNumber,
                        directory_id: req.body.umdusername,
                        directory_pass: crypt.encrypt(req.body.umdpass)
                    }).save().then(function(newUser) {
                        if (err) throw err;
                        var id = newUser.get('id');
                        courses.forEach(function(course) {
                            new Grade({
                                user_id: id,
                                course_code: course,
                                grade: 0.0
                            }).save();
                        });
                        auth.authenticate(newUser.get('email'), password, function(err, user){
                            if(user){
                                req.session.regenerate(function(){
                                    req.session.user = user;
                                    req.flash('success', { msg: 'Information saved for ' + req.body.email });
                                    res.redirect('/profile');
                                });
                            }
                        });
                    });
                });
            } else {
                req.session.regenerate(function(){
                    req.flash('success', { msg: 'Incorrect login for ' + req.body.umdusername });
                    res.redirect('/signup');
                });
            }
        });
    });
};

function verifyUser(user, pass, callback){
    var callStr = 'node ./phantom_scripts/testLogin.js ' + user + ' ' + pass;
    console.log("Trying to verify user " + user);
    callback(true);
    // exec(callStr, function(error, stdout, stderr) {
    //     console.log(stderr);
    //     callback(stderr.indexOf("ERROR LOGGING IN") == -1);
    // });
}
