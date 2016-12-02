const crypt = require('./encryption');
const knex = require('../config/knex.js');

exports.getUser = userInfo => {
    const queryAttr = typeof userInfo === 'string' ? 'email' : 'id';
    return knex('users').where(queryAttr, userInfo).then(users => {
        if (users.length === 0) return null;
        const user = users[0];
        user.directory_pass = crypt.decrypt(user.directory_pass);
        return user;
    });
};

exports.getUserGrades = user => knex('grades').where('user_id', user.id);

exports.createUser = userInfo => knex('users').insert(userInfo).returning('*').then(users => users[0]);
exports.createGrade = gradeInfo => knex('grades').insert(gradeInfo).returning('*').then(grades => grades[0]);
