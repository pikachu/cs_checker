var exec = require('child_process').exec;
var User = require('./models/user');
var Grade = require('./models/grade');

User.fetchAll().then(function(users){
    users.forEach(function(user){
        var courses = [];
        var id = user.get('id');
        console.log("User with id " + id);
        new Grade({user_id: id})
        .fetchAll()
        .then(function(gradeRows){
            gradeRows.models.forEach(function(base){
                console.log(base.attributes.courseCode);
                courses.push(base.attributes.courseCode);
            });
        }).then(function(){
            var callStr = 'phantomjs ./script.js ' + user.get('directoryId') + ' ' + user.get('directoryPass')  + ' ' + courses + ' ' + id;
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
//var h1 = exec.executeForUserWithClasses(creds.username, creds.password, ['216','351']);
