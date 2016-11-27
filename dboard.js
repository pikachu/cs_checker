const Grade = require('./models/grade');
const bookshelf = require('./bookshelf');
const testValidClasses = require('./phantom_scripts/testClasses').testValidClasses;

/*
 * newCourses is an array of new courses that we have no information about, but
 * the user wants to monitor them.
 */
function addCourses(userId, newCourses) {
    newCourses.forEach(courseCode => {
        new Grade({
            user_id: userId,
            course_code: courseCode,
            grade: 0.0
        }).save();
    });
}

/*
 * coursesToDel are courses that the user has previously tracked, but has removed
 * from their desired "to track" list.
 */
function delCourses(userId, coursesToDel) {
    coursesToDel.forEach(course => {
        console.log("Deleting course " + course);
        bookshelf.knex('grades').where({
            course_code: course,
            user_id: userId
        }).del().then();
    });
}

// detectDiffCourses
function detectDiffCourses(userId, courseString) {
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
        delCourses(userId, del);
        addCourses(userId, add);
    });
}

/* Takes an id as the first input */
function areCoursesValidForUser(userId, courseString) {
    console.log('Checking if courses are valid for user');
    testValidClasses(userId, courseString, res => {
        console.log(res);
        return res;
    });
}

module.exports = { addCourses, delCourses, changeCourses: detectDiffCourses, areCoursesValidForUser };
