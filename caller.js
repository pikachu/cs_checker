var creds = require('./config');
var exec = require('./index');

var h1 = exec.executeForUserWithClasses(creds.username, creds.pw, ['216','351']);
var h2 = exec.executeForUserWithClasses(creds.username, creds.pw, ['132','330']);
/*
h1.forEach(function(key){
    console.log(key + " " + h1[key]);
})

h2.forEach(function(key){
    console.log(key + " " + h1[key]);
})
*/
