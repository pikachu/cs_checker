var User = require('../models/user');
var Grade = require('../models/grade');
var dashboard = require('../dboard');
var bookshelf = require('../bookshelf');
var logout = require('../controllers/logout');
var encryption = require('../common/encryption');
// var formidable = require('formidable');
var util = require('util');
const phantom = require('phantom');
const script = require('../grade_server_api/script');
const phone = require('phone');
/**
 * GET /logout
 */
exports.profileGet = function (req, res) {
    bookshelf.knex('users').where('email', req.session.user.email).then(users => {
        bookshelf.knex('grades').where('user_id', users[0].id).then(classCodes => {
            const courses = [];
            classCodes.forEach(course => {
                console.log(course.course_code);
                courses.push(course.course_code);
            });
            console.log(courses);
            res.render('profile', {
                email: req.session.user.email,
                directory_id: req.session.user.directory_id,
                classes: courses,
                phone_number: req.session.user.phone_number,
                getsEmails: req.session.user.getsEmails,
                getsTexts: req.session.user.getsTexts,
                validCredentials: req.session.user.validCredentials
            });
        });
    });
};

exports.updateProfile = async function (req, res) {
    console.log(`The user id is ${req.session.user.id}`);
    console.log(req.body);
    if (req.body.newUMDPass && req.body.newUMDPass !== '') {
        const instance = await phantom.create();
        const encryptedPass = encryption.encrypt(req.body.newUMDPass);
        await bookshelf.knex('users').where('id', req.session.user.id).update({
            directory_pass: encryptedPass
        });
        try {
            await script.loginToGradeServer(instance,
                req.session.user.directory_id, req.body.newUMDPass);
            await bookshelf.knex('users').where('id', req.session.user.id).update({
                validCredentials: true
            }).then();
        } catch (e) {
            await bookshelf.knex('users').where('id', req.session.user.id).update({
                validCredentials: false
            }).then();
        }
    }
    await script.checkUser(req.session.user, false);
    await bookshelf.knex('users').where('id', req.session.user.id).update({
        getsEmails: req.body.getsEmails ? true : false,
        getsTexts: req.body.getsTexts ? true : false,
        phone_number: phone(req.body.newPhone, 'USA')[0]
    });
    bookshelf.knex('users').where('id', req.session.user.id).then(users => {
        req.session.regenerate(() => {
            req.session.user = users[0];
            res.status(200);
            req.flash('success', { msg: `Information saved for ${req.body.email}` });
            res.redirect('/profile');
        });
    });
};
