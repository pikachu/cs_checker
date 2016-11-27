const crypt = require('./encryption');
const bookshelf = require('../../bookshelf.js');

exports.getUser = userInfo => {
    const queryAttr = typeof userInfo === 'string' ? 'email' : 'id';
    return bookshelf.knex('users').where(queryAttr, userInfo).then(users => {
        if (users.length === 0) return null;
        const user = users[0];
        user.directory_pass = crypt.decrypt(user.directory_pass);
        return user;
    });
};
