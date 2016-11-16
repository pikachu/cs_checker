var creds = require('./config');
var exec = require('./script');

var h1 = exec.executeForUserWithClasses(creds.username, creds.password, ['216','351']);
