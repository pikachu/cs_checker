var exec = require('child_process').exec;
var User = require('./models/user');
var Grade = require('./models/grade');
var bookshelf = require('./bookshelf');
new User().fetchAll().then(function(users){
    users.forEach(function(user){
        bookshelf.knex('grades').where('user_id', user.get('id')).then(function(grades) {
            var courses = [];
            grades.forEach(function(base){
                courses.push(base.course_code);
            });
            return courses;
        }).then(function(courses){
            var callStr = 'node ./script.js ' + user.get('directory_id') + ' ' + user.get('directory_pass')  + ' ' + courses;
            console.log(callStr);
            exec(callStr, function(error, stdout, stderr) {
                console.log('stdout: ', stdout);
                console.log('stderr: ', stderr);
                if (error !== null) {
                    console.log('exec error: ', error);
                }
            });
        });
    });
});
