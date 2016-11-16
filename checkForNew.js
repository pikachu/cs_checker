var exec = require('child_process').exec;
var knex = require('knex')({
  client: 'pg',
  connection: {
    host : 'localhost',
    user : 'iParikh',
    password : 'postgres',
    database : 'cs_checker'
  }
});

knex.select('*').from('users').then(function(users){
    users.forEach(function(user){
        var callStr = 'phantomjs ./caller.js ' + user.username + ' ' + user.password + ' ' + user.courses;
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
//var h1 = exec.executeForUserWithClasses(creds.username, creds.password, ['216','351']);
