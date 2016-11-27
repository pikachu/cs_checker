const updateUser = require('../script').updateUser;
const bookshelf = require('../../bookshelf');

bookshelf.knex('users').select().then(users => {
    let upper = Math.min(10, users.length);
    let curr = users.slice(0, upper);
    users = users.slice(upper, users.length);
    const refreshIntervalId = setInterval(() => {
        curr.forEach(user => {
            console.log(`Checking with user ${user.directory_id}`);
            updateUser(user.directory_id);
        });
        upper = Math.min(10, users.length);
        curr = users.slice(0, upper);
        users = users.slice(upper, users.length);
        if (curr.length === 0) {
            clearInterval(refreshIntervalId);
        }
    }, 10000);
});
