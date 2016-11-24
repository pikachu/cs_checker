var User = require('./models/user');
var Grade = require('./models/grade');
var bookshelf = require('./bookshelf');
var execSync = require('child_process').execSync;

/*
 * newCourses is an array of new courses that we have no information about, but
 * the user wants to monitor them.
 */
function addCourses(user_id, newCourses){
    newCourses.forEach(function(course_code){
        new Grade({
            user_id: user_id,
            course_code: course_code,
            grade: 0.0
        }).save();
    });
}

/*
 * coursesToDel are courses that the user has previously tracked, but has removed
 * from their desired "to track" list.
 */
function delCourses(user_id, coursesToDel){
    coursesToDel.forEach(function(course){
        console.log("Deleting course " + course);
        bookshelf.knex('grades').where({
            course_code: course,
            user_id: user_id
        }).del().then();
    });
}

// detectDiffCourses
function detectDiffCourses(user_id, course_string){
    var new_courses = course_string.split(",");
    var old_courses = [];
    bookshelf.knex('grades').where('user_id', user_id).then(function(grades){
        console.log("Getting old grades");
        var add = [];
        var del = [];
        grades.forEach(function(grade){
            old_courses.push(grade.course_code);
        });
        console.log("Current grades in DB");
        console.log(grades);
        new_courses.forEach(function(new_course){
            if (!old_courses.includes(new_course)){
                add.push(new_course);
            }
        });
        old_courses.forEach(function(old_course){
            if (!new_courses.includes(old_course)){
                del.push(old_course);
            }
        });
        delCourses(user_id, del);
        addCourses(user_id, add);
    });
}

function areCoursesValidForUser(user_id, course_string){
    bookshelf.knex('users').where(id, user_id).then(function(results){
        var user = results[0].directory_id;
        var callStr = "node ./phantom_scripts/testClasses.js " + user + ' ' + course_string;
        exec(callStr, function(error, stdout, stderr) {
            if (stderr.indexOf('failure') != -1) {
                return true;
            }
            return false;
        });
    });
}

module.exports = {
    addCourses: addCourses,
    delCourses: delCourses
}
