const bookshelf = require('../bookshelf');
const testValidClass = require('../grade_server_api/testClasses').testValidClass;
const updateCourseGrade = require('../grade_server_api/scriptRequest').updateCourseGrade;

async function deleteCourse(req, res) {
    const courseCode = req.body.courseCode;
    await bookshelf.knex('grades').where({ user_id: req.session.user.id,
        course_code: courseCode }).del();
}

async function addCourse(req, res) {
    /*
    * TODO: Make the validate course function handle cases like ' '
    * The if statement needs to be removed that checks for ''
    */
    const courseCode = req.body.courseCode;
    if (courseCode !== '') {
        const grades = await bookshelf.knex('grades').where({ user_id: req.session.user.id });
        const existingCourses = [];
        grades.forEach(grade => {
            existingCourses.push(grade.course_code);
        });
        if (existingCourses.includes(courseCode)) {
            res.status(400);
            res.send();
        } else {
            const coursesValid = await testValidClass(req.session.user.id, courseCode);
            if (coursesValid) {
                await bookshelf.knex('grades').insert({
                    user_id: req.session.user.id,
                    course_code: courseCode,
                    grade: 0.0 });
                await updateCourseGrade(req.session.user, courseCode);
                res.status(200);
                res.send();
            } else {
                res.status(400);
                res.send();
            }
        }
    } else {
        res.status(400);
        res.send();
    }
}

module.exports = { deleteCourse, addCourse };
