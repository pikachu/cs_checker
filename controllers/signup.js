const User = require('../models/user');
const Grade = require('../models/grade');
const auth = require('./utils/authentication');
const crypt = require('./utils/encryption');
const testValidLogin = require('../phantom_scripts/testLogin').testValidLogin;

/**
 * GET /contact
 */
exports.signupGet = (req, res) => {
    res.render('signup', {
        title: 'Contact'
    });
};

/**
 * POST /contact
 */
exports.signupPost = (req, res) => {
    const courses = req.body.courses.split(',').map(str => str.trim());
    const email = req.body.email;
    const password = req.body.password;

    testValidLogin(req.body.umdusername, req.body.umdpass, shouldContinue => {
        if (shouldContinue) {
            auth.hash(password, (err, salt, hash) => {
                if (err) throw err;
                new User({
                    email,
                    password_salt: salt,
                    password_hash: hash.toString('base64'),
                    phone_number: req.body.phoneNumber,
                    directory_id: req.body.umdusername,
                    directory_pass: crypt.encrypt(req.body.umdpass)
                }).save().then(newUser => {
                    if (err) throw err;
                    const id = newUser.get('id');
                    courses.forEach(course =>
                        new Grade({
                            user_id: id,
                            course_code: course,
                            grade: 0.0
                        }).save()
                    );
                    auth.authenticate(newUser.get('email'), password, (err2, user) => {
                        if (user) {
                            req.session.regenerate(() => {
                                req.session.user = user;
                                req.flash('success', { msg: `Information saved for ${req.body.email}` });
                                res.redirect('/profile');
                            });
                        }
                    });
                });
            });
        } else {
            req.session.regenerate(() => {
                req.flash('success', { msg: `Incorrect login for ${req.body.umdusername} ` });
                res.redirect('/signup');
            });
        }
    });
};
