const Grade = require('./models/grade');
const bookshelf = require('./bookshelf');
const testValidClasses = require('./phantom_scripts/testClasses').testValidClasses;

/*
 * newCourses is an array of new courses that we have no information about, but
 * the user wants to monitor them.
 */
function addCourses(userId, newCourses, callback) {
    newCourses.forEach(courseCode => {
        new Grade({
            user_id: userId,
            course_code: courseCode,
            grade: 0.0
        }).save().then(() => callback());
    });
}

/*
 * coursesToDel are courses that the user has previously tracked, but has removed
 * from their desired "to track" list.
 */
function delCourses(userId, coursesToDel, callback) {
    coursesToDel.forEach(course => {
        console.log("Deleting course " + course);
        bookshelf.knex('grades').where({
            course_code: course,
            user_id: userId
        }).del().then(() => callback());
    });
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

function getCoursesAsArray(userId, callback) {
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
    getCoursesAsArray
};
