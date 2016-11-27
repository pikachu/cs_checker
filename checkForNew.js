const User = require('./models/user');
const updateUser = require('./phantom_scripts/script').updateUser;

new User().fetchAll().then(users => {
    users.forEach(user => {
        updateUser(user.directory_id);
    });
});
