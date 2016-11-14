var my_info = require('./config');
var page = new WebPage();
var state = 0,
    loadInProgress = false;
var OPEN_PAGE = 0,
    FILL_FORM = 1,
    LOG_IN = 2,
    GET_HTML = 3;

page.onConsoleMessage = function(msg) {
    console.log(msg);
};

page.onLoadStarted = function() {
    loadInProgress = true;
    console.log("load started");
};

page.onLoadFinished = function() {
    loadInProgress = false;
    console.log("load finished");
};

var steps = [
function() {
    page.open("https://grades.cs.umd.edu/classWeb/login.cgi");
    console.log("Opened grades page.");
},
function(user, pass) {
    var obj = {username: user, password: pass};
    page.evaluate(function(obj) {
        console.log("Filling out info.");
        var arr = document.getElementsByTagName("form");
        arr[0].elements["user"].value = obj.username;
        arr[0].elements["password"].value = obj.password;
    }, obj);
},
function() {
    page.evaluate(function() {
        document.getElementsByTagName("form")[0].submit.click();
        console.log("Logging in..");
    });
},
function() {
    page.evaluate(function() {
        return [].map.call(document.querySelectorAll('a'), function(link) {
            return link.getAttribute('href');
        });
    });
}
];

function execute(user, pw, classes) {
    interval = setInterval(function() {
        if (!loadInProgress && typeof steps[state] == "function") {
            if (state == OPEN_PAGE) {
                steps[OPEN_PAGE]();
            } else if (state == FILL_FORM) {
                steps[FILL_FORM](user, pw);
            } else if (state == LOG_IN) {
                steps[LOG_IN]();
            } else if (state == GET_HTML){
                console.log(steps[GET_HTML]().join('\n'));
            }
            state++;
        }
        if (typeof steps[state] != "function") {
            console.log("test complete!");
            phantom.exit();
        }
    }, 100);
}

execute(my_info.username, my_info.password, null);
