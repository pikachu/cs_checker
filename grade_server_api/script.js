const phantom = require('phantom');
const db = require('../common/db');
const sendMessage = require('../common/email').sendMessage;
const xpath = require('xpath');
const Dom = require('xmldom').DOMParser;
const knex = require('../config/knex');

async function loginToGradeServer(instance, username, password) {
    const page = await instance.createPage();
    const status = await page.open('https://grades.cs.umd.edu/classWeb/login.cgi');
    if (status === 'fail') throw Error('Failed to load grades.cs.umd.edu');

    let loginSucceeded;
    let loginFailed;
    const loginPromise = new Promise(
        (resolve, reject) => {
            loginSucceeded = resolve;
            loginFailed = reject;
        }
    );

    await page.on('onResourceReceived', async () => {
        try {
            const content = await page.property('content');
            if (content.includes('Fatal Error')) throw new Error('Invalid Login');
            loginSucceeded(page);
        } catch (e) {
            loginFailed(e);
        }
    });

    const loginInfo = { username, password };
    await page.evaluate(function (obj) {
        const arr = document.getElementsByTagName('form');
        arr[0].elements.user.value = obj.username;
        arr[0].elements.password.value = obj.password;
        document.getElementsByTagName('form')[0].submit.click();
    }, loginInfo);

    return await loginPromise;
}

async function getCourses(page) {
    await page.open('https://grades.cs.umd.edu/classWeb/login.cgi');
    const content = await page.property('content');
    const doc = new Dom().parseFromString(content);
    const nodes = xpath.select('//a[contains(@href, "viewGrades.cgi?courseID")]', doc);

    return nodes.map(node => {
        const courseMatch = xpath.select('text()', node)[0].data.match(/CMSC(\d\d\d\d?[A-z]?)/);
        return {
            href: xpath.select('@href', node)[0].value,
            course: courseMatch ? courseMatch[1] : null
        };
    });
}

async function getGrade(page, course) {
    await page.open(`https://grades.cs.umd.edu/classWeb/${course.href}`);
    const content = await page.property('content');
    const doc = new Dom().parseFromString(content);
    const nodes = xpath.select('//table//table//tr[last()]/td[2]/text()', doc);

    try {
        return parseFloat(nodes[0].data);
    } catch (e) {
        return null;
    }
}

async function checkUser(user) {
    const courseGrades = {};
    (await db.getUserGrades(user)).forEach(gradeInfo => {
        courseGrades[gradeInfo.course_code] = gradeInfo.grade;
    });
    const instance = await phantom.create();
    let userPage;
    try {
        userPage = await loginToGradeServer(instance, user.directory_id, user.directory_pass);
    } catch (e) {
        console.error(`User ${user.directory_id} has invalid login information!`);
        return;
    }
    const courses = (await getCourses(userPage)).filter(courseInfo =>
        Object.keys(courseGrades).includes(courseInfo.course)
    );

    for (let i = 0; i < courses.length; i++) {
        const courseInfo = courses[i];
        const grade = await getGrade(userPage, courseInfo);
        if (courseGrades[courseInfo.course] !== grade) {
            console.log(`updating ${courseInfo.course} course grade for ${user.directory_id}`);
            await knex('grades').where('user_id', user.id).where('course_code', courseInfo.course).update('grade', grade);
        }
    }
    console.log(`Finished for user ${user.directory_id}`);
    await instance.exit();
}

module.exports = { checkUser, loginToGradeServer, getCourses, getGrade };
