var User = require('../models/user');
var Grade = require('../models/grade');
var dashboard = require('../dboard');
var bookshelf = require('../bookshelf');
var logout = require('../controllers/logout');
var formidable = require('formidable');
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
                classes: courses
            });
        });
    });
};

exports.updateProfile = function (req, res) {
    bookshelf.knex('users').where('email', req.session.user.email).then(users => {
        console.log(req.body.coursesToChange);
        dashboard.areCoursesValidForUser(users[0].id,
            req.body.coursesToChange, shouldContinue => {
                if (shouldContinue) {
                    dashboard.detectDiffCourses(users[0].id, req.body.coursesToChange, () => {
                        dashboard.getCoursesAsArray(users[0].id, classes => {
                            res.render('profile', {
                                email: req.session.user.email,
                                directory_id: req.session.user.directory_id,
                                classes,
                                successful_changes: 'Changes made!'
                            });
                        });
                    });
                } else {
                    dashboard.getCoursesAsArray(users[0].id, classes => {
                        res.render('profile', {
                            email: req.session.user.email,
                            directory_id: req.session.user.directory_id,
                            classes,
                            successful_changes: 'Invalid courses provided!'
                        });
                    });
                }
            });
    });
};
