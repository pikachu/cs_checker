var exec = require('child_process').exec;
var User = require('./models/user');
var Grade = require('./models/grade');

User.fetchAll().then(function(users){
    users.forEach(function(user){
        var courses = [];
        var id = user.get('id');
        new Grade({user_id: id})
        .fetchAll()
        .then(function(gradeRows){
            gradeRows.models.forEach(function(base){
                courses.push(base.attributes.courseCode);
            });
        }).then(function(){
            var callStr = 'node ./script.js ' + user.get('directory_id') + ' ' + user.get('directory_pass')  + ' ' + courses + ' ' + id;
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
//var h1 = exec.executeForUserWithClasses(creds.username, creds.password, ['216','351']);
