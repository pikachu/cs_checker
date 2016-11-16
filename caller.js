var exec = require('./script');
var system = require('system');
var args = system.args;

var h1 = exec.executeForUserWithClasses(args[1], args[2], args[3].split(','));
