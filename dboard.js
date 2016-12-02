const Grade = require('./models/grade');
const bookshelf = require('./bookshelf');
const testValidClasses = require('./grade_server_api/testClasses').testValidClasses;

/*
 * newCourses is an array of new courses that we have no information about, but
 * the user wants to monitor them.
 */

function addCourse(userId, newCourse, callback) {
    new Grade({
        user_id: userId,
        course_code: newCourse,
        grade: 0.0
    }).save().then(() => callback());
}

function addCourses(userId, newCourses, callback) {
    if (typeof userId === 'string'){
        addCourses(userId, newCourses.split(','), callback);
    } else {
        if (newCourses.length > 0) {
            addCourse(userId, newCourses[0], () => {
                addCourses(userId, newCourses.slice(1, newCourses.length), callback);
            });
        } else {
            callback();
        }
    }
}

function delCourse(userId, course, callback) {
    bookshelf.knex('grades').where({ course_code: course, user_id: userId }).del().then(() =>
        callback()
    );
}


function delCourses(userId, coursesToDel, callback) {
    if (typeof userId === 'string'){
        delCourses(userId, coursesToDel.split(','), callback);
    } else {
        if (coursesToDel.length > 0) {
            delCourse(userId, coursesToDel[0], () => {
                delCourses(userId, coursesToDel.slice(1, coursesToDel.length), callback);
            });
        } else {
            callback();
        }
    }
}
// detectDiffCourses
function detectDiffCourses(userId, courseString, callback) {
    const newCourses = courseString.split(',');
    const oldCourses = [];
    bookshelf.knex('grades').where('user_id', userId).then(grades => {
        console.log("Getting old grades");
        const add = [];
        const del = [];
        grades.forEach(grade => {
            oldCourses.push(grade.course_code);
        });
        console.log("Current grades in DB");
        console.log(grades);
        newCourses.forEach(newCourse => {
            if (!oldCourses.includes(newCourse)) {
                add.push(newCourse);
            }
        });
        oldCourses.forEach(oldCourse => {
            if (!newCourses.includes(oldCourse)) {
                del.push(oldCourse);
            }
        });
        delCourses(userId, del, () => {
            addCourses(userId, add, () => {
                callback();
            });
        });
    });
}

/* Takes an id as the first input */
function areCoursesValidForUser(userId, courseString, callback) {
    console.log('Checking if courses are valid for user');
    testValidClasses(userId, courseString, res => {
        callback(res);
    });
}

function getUpdatedCourses(userId, callback) {
    const arr = [];
    bookshelf.knex('grades').where('user_id', userId).then(grades => {
        grades.forEach(grade => {
            arr.push(grade.course_code);
        });
        callback(arr);
    });
}

module.exports = { addCourses,
    delCourses,
    detectDiffCourses,
    areCoursesValidForUser,
    getUpdatedCourses
};
