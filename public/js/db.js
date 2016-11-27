var User = require('../../models/user');
var crypt = require('./encryption');

exports.getUser = function(email) {
    return new User({'email': email}).fetch().then(function (user) {
        return user ? {
            'id': user.get('id'),
            'email': user.get('email'),
            'password_hash': user.get('password_hash'),
            'password_salt': user.get('password_salt'),
            'directory_id': user.get('directory_id'),
            'directory_pass': crypt.decrypt(user.get('directory_pass')),
            'phone_number': user.get('phone_number')
        } : null;
    });
};
