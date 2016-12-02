const checkUser = require('./grade_server_api/script').checkUser;
const script = require('./grade_server_api/script');
const knex = require('./config/knex');
const PromisePool = require('es6-promise-pool');
const crypt = require('./common/encryption');
const phantom = require('phantom');

async function checkGrades(concurrency) {
    const users = await knex('users').select();
    const pool = new PromisePool(() => {
        if (users.length > 0) {
            const user = users.pop();
            console.log(`Checking user: ${user.directory_id}`)
            user.directory_pass = crypt.decrypt(user.directory_pass);
            return checkUser(user);
        } else {
            return null;
        }
    }, concurrency);

    await pool.start();
    console.log('Complete');
}

(async () => {
    const instance = await phantom.create();
    await script.loginToGradeServer(instance, 'msteven9', 'Iamnred1');
    await checkGrades(1);
    process.exit();
})();