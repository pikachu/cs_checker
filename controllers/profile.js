var User = require('../models/user');
var Grade = require('../models/grade');
var dashboard = require('../dboard');
var bookshelf = require('../bookshelf');
var logout = require('../controllers/logout');
var encryption = require('./utils/encryption');
// var formidable = require('formidable');
var util = require('util');

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
                phone_number: req.session.user.phone_number
            });
        });
    });
};

exports.updateProfile = function (req, res) {
    bookshelf.knex('users').where('email', req.session.user.email).then(users => {
        console.log(req.body.coursesToChange);
        // if (req.body.newUMDID){
        //     console.log("new UMDID!");
        //     new User({
        //         id: users[0].id,
        //         email: req.session.user.email
        //     }).save({directory_id: req.body.newUMDID},{patch: true}).then(() => {console.log("updated!");});
        // }
        if (req.body.newUMDPass){
            console.log("new UMDPass!");
            encrypted_pass = encryption.encrypt(req.body.newUMDPass);
            new User({
                id: users[0].id,
                email: req.session.user.email
            }).save({directory_pass: encrypted_pass},{patch: true}).then(() => {console.log("updated!");});
        }
        dashboard.areCoursesValidForUser(users[0].id,
            req.body.coursesToChange, shouldContinue => {
                if (shouldContinue) {
                    dashboard.detectDiffCourses(users[0].id, req.body.coursesToChange, () => {
                        dashboard.getUpdatedCourses(users[0].id, classes => {
                            res.render('profile', {
                                email: req.session.user.email,
                                directory_id: req.session.user.directory_id,
                                classes,
                                successful_changes: 'Changes made!'
                            });
                        });
                    });
                } else {
                    dashboard.getUpdatedCourses(users[0].id, classes => {
                        res.render('profile', {
                            email: req.session.user.email,
                            directory_id: req.session.user.directory_id,
                            classes,
                            successful_changes: 'Changes made!'
                        });
                    });
                }
            });
    });
};
