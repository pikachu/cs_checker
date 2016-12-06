const bookshelf = require('../bookshelf');
const validateCourse = require('../grade_server_api/testClasses').testValidClasses;

exports.deleteCourse = function (req, res) {
    const courseCode = req.body.courseCode;
    bookshelf.knex('grades').where({ user_id: req.session.user.id,
        course_code: courseCode }).del().then(() => {
            console.log('Course deleted');
        }
    );
};

exports.addCourse = function (req, res) {
    /*
    * TODO: Make the validate course function handle cases like ' '
    * The if statement needs to be removed that checks for ''
    */
    const courseCode = req.body.courseCode;
    if (courseCode !== '') {
        bookshelf.knex('grades').where({ user_id: req.session.user.id })
            .then(grades => {
                const existingCourses = [];
                grades.forEach(grade => {
                    existingCourses.push(grade.course_code);
                });
                if (existingCourses.includes(courseCode)) {
                    res.status(400);
                    res.send();
                } else {
                    validateCourse(req.session.user.id, courseCode, coursesValid => {
                        if (coursesValid) {
                            bookshelf.knex('grades').insert({
                                user_id: req.session.user.id,
                                course_code: courseCode,
                                grade: 0.0 }).then(() => {
                                    res.status(200);
                                    res.send();
                                });
                        } else {
                            res.status(400);
                            res.send();
                        }
                    });
                }
            });
    } else {
        res.status(400);
        res.send();
    }
};
