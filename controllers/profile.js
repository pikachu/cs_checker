var User = require('../models/user');
var Grade = require('../models/grade');
var Dashboard = require('../dboard');
var Bookshelf = require('../bookshelf');
var LogOut = require('../controllers/logout');
var formidable = require('formidable');
var util = require('util');

/**
 * GET /logout
 */
exports.profileGet = function(req, res) {
    Bookshelf.knex('users').where('email', req.session.user.email).then(function(users) {
        Bookshelf.knex('grades').where('user_id', users[0].id).then(function(class_codes){
            var courses = [];
            class_codes.forEach(function(course){
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

exports.updateProfile = function(req, res) {
    Bookshelf.knex('users').where('email', req.session.user.email).then(function(users) {
        Bookshelf.knex('grades').where('user_id', users[0].id).then(function(class_codes){
            var courses = [];
            class_codes.forEach(function(course){
                console.log(course.course_code);
                courses.push(course.course_code);
            });
            console.log(courses);

            console.log(req.body.coursesToChange);
            Dashboard.changeCourses(users[0].id, req.body.coursesToChange);

            res.render('profile', {
              email: req.session.user.email,
              directory_id: req.session.user.directory_id,
              classes: courses,
              successful_changes: "Changes made!"
            });
        });
    });
};
