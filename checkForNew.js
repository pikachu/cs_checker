var User = require('./models/user');
var Grade = require('./models/grade');
var bookshelf = require('./bookshelf');
var updateUser = require('./phantom_scripts/script').updateUser;

new User().fetchAll().then(function(users){
    users.forEach(function(user){
        updateUser(user.directory_id);
    });
});
