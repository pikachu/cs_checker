var User = require('../../models/user');
var crypt = require('./encryption');
var bookshelf = require('../../bookshelf.js');

exports.getUser = function(user_info) {
    var query_attr = typeof user_info === 'string' ? 'email' : 'id';
    return bookshelf.knex('users').where(query_attr, user_info).then(users => {
            if (users.length == 0) return null;
            var user = users[0];
            user.directory_pass = crypt.decrypt(user.directory_pass);
            return user;
    });
};
