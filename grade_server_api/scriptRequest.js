const phantom = require('phantom');
const db = require('../common/db');
const sendEmail = require('../common/email').sendEmail;
const sendText = require('../common/text').sendText;
const xpath = require('xpath');
const Dom = require('xmldom').DOMParser;
const knex = require('../config/knex');
const request = require('request-promise-native');

const parserOptions = {
    locator: {},
    errorHandler: {
        warning: () => {},
        error: e => { console.error(e); },
        fatalError: e => { console.error(e); }
    }
};

async function loginToGradeServer(user, password) {
    const reqBody = { user, password, submit: 'Login' };
    const res = await request.post({ url: 'https://grades.cs.umd.edu/classWeb/login.cgi', formData: reqBody, resolveWithFullResponse: true });
    const body = res.body;
    const cookie = res.headers['set-cookie'][0];
    if (body && cookie) {
        return { body, cookie };
    }
    console.log("Throwing error in loginToGradeServer!");
    throw new Error();
}

/* Takes in the html of a page, and returns a hash mapping course code (string)
 to a link (string).
 */
async function getCourses(htmlRaw) {
    const doc = new Dom(parserOptions).parseFromString(htmlRaw);
    const nodes = xpath.select('//a[contains(@href, "viewGrades.cgi?courseID")]', doc);
    return nodes.map(node => {
        const courseMatch = xpath.select('text()', node)[0].data.match(/CMSC(\d\d\d[A-z]?)/);
        return {
            href: xpath.select('@href', node)[0].value,
            course: courseMatch ? courseMatch[1] : null
        };
    });
}

async function getGrade(cookie, courseObj) {
    console.log(`Getting grade for ${courseObj.course}`);
    const options = {
        url: `https://grades.cs.umd.edu/classWeb/${courseObj.href}`,
        headers: {
            Cookie: cookie
        }
    };
    const res = await request.get(options);
    const doc = new Dom(parserOptions).parseFromString(res);
    const nodes = xpath.select('//table//table//tr[last()]/td[2]/text()', doc);
    try {
        console.log("LOOK AT ME");
        console.log(nodes);
        return parseFloat(nodes[0].data);
    } catch (e) {
        return null;
    }
}

async function checkUser(user, sendMessageIfNecessary) {
    const courseGrades = {};
    (await db.getUserGrades(user)).forEach(gradeInfo => {
        courseGrades[gradeInfo.course_code] = gradeInfo.grade;
    });
    let credObj;
    try {
        credObj = await loginToGradeServer(user.directory_id, user.directory_pass);
    } catch (e) {
        await db.setValidCredentials(user.directory_id, false);
        console.error(`User ${user.directory_id} has invalid login information!`);
        return;
    }
    let courses;
    try {
        courses = (await getCourses(credObj.body)).filter(courseInfo =>
            Object.keys(courseGrades).includes(courseInfo.course)
        );
    } catch (e) {
        console.error(`Could not get courses for user ${user.directory_id}`);
        return;
    }
    let shouldNotify = false;
    for (let i = 0; i < courses.length; i ++) {
        const courseInfo = courses[i];
        let grade;
        try {
            grade = await getGrade(credObj.cookie, courseInfo);
        } catch (e) {
            console.error(`Failed to get grade for user ${user.directory_id} and course ${courseInfo.course}`);
            return;
        }
        if (courseGrades[courseInfo.course] !== grade) {
            console.log(`updating ${courseInfo.course} course grade for ${user.directory_id}`);
            await knex('grades').where('user_id', user.id).where('course_code', courseInfo.course).update('grade', grade);
            shouldNotify = true;
        }
    }
    if (shouldNotify && sendMessageIfNecessary) {
        if (user.getsEmails) {
            sendEmail(user.id);
        }
        if (user.getsTexts && user.phone_number && user.phone_number !== '') {
            sendText(user.id);
        }
    }
    console.log(`Finished for user ${user.directory_id}`);
}

module.exports = { checkUser, loginToGradeServer, getCourses, getGrade };


(async () => {
    const obj = await loginToGradeServer('iparikh', 'Helloworld12');
    const courses = await getCourses(obj.body);
    console.log(courses);
    const grade = await getGrade(obj.cookie, courses[0]);
    console.log(grade);
})();
