// const bookshelf = require('../bookshelf');
const getUser = require('../common/db').getUser;
const loginToGradeServer = require('./scriptRequest').loginToGradeServer;
const getCourses = require('./scriptRequest').getCourses;


async function testValidClass(userId, classStr) {
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
            return isValid;
        }
        return false;
    } catch (e) {
        return false;
    }
}

module.exports = { testValidClass };
