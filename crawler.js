const checkUser = require('./grade_server_api/scriptRequest').checkUser;
const script = require('./grade_server_api/scriptRequest');
const knex = require('./config/knex');
const PromisePool = require('es6-promise-pool');
const crypt = require('./common/encryption');
const INTERVAL = 1;

async function checkGrades(concurrency) {
    const users = await knex('users').select();
    const pool = new PromisePool(() => {
        if (users.length > 0) {
            const user = users.pop();
            if (user.validCredentials) {
                console.log(`Checking user: ${user.directory_id}`)
                user.directory_pass = crypt.decrypt(user.directory_pass);
                return checkUser(user, true);
            } else {
                console.log(`User: ${user.directory_id} has invalid credentials`);
                return null;
            }
        } else {
            return null;
        }
    }, concurrency);

    await pool.start();
    console.log('Complete');
}

(async function main() {
    console.info('Starting scan...');
    await checkGrades(10);
    console.info('Scan Completed');

    setTimeout(main, INTERVAL * 60 * 1000);
}());
