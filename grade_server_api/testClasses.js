// const bookshelf = require('../bookshelf');
const getUser = require('../common/db').getUser;
const loginToGradeServer = require('./scriptRequest').loginToGradeServer;
const getCourses = require('./scriptRequest').getCourses;


async function testValidClass(userId, classStr, callback) {
    const user = await getUser(userId);
    const username = user.directory_id;
    const password = user.directory_pass;
    try {
        const obj = await loginToGradeServer(username, password);
        if (obj.body) {
            const courses = await getCourses(obj.body);
            let isValid = false;
            courses.forEach(cls => {
                if (cls.course === classStr) {
                    isValid = true;
                }
            });
            callback(isValid);
        } else {
            console.log('Issue logging in to grade server in testClasses.');
            callback(false);
        }
    } catch (e) {
        console.log('Something went wrong when trying to testValidClass');
        callback(false);
    }
}

module.exports = { testValidClass };
