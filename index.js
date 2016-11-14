var my_info = require('./config');
var page = new WebPage();
var state = 0,
    loadInProgress = false;
var OPEN_PAGE = 0,
    FILL_FORM = 1,
    LOG_IN = 2,
    GET_HTML = 3,
    GET_COURSES = 4;

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
function(classes) {
    var linkHash = page.evaluate(function(classes) {
        var newList = {};
        var lst = document.getElementsByTagName("a");
        var i;
        classes.forEach(function(classNo){
            for (i = 0; i < lst.length; i++){
                var curr = lst[i].innerHTML;
                if (curr.indexOf(classNo) != -1){
                    newList[classNo] = lst[i].href
                    break;
                }
            }
        })
        return newList;
    }, classes);
    return linkHash;
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
                links = steps[GET_HTML](classes);
                /* Uncomment to print */
                /*
                Object.keys(links).forEach(function(hell){
                    console.log(hell + "\n");
                    console.log(links[hell]);
                });
                */
            } else if (state == GET_COURSES){
                /* We need to convert a hash that maps
                    330 -> link to page
                    to
                    330 -> 92.14
                */
            }
            state++;
        }
        if (typeof steps[state] != "function") {
            console.log("test complete!");
            phantom.exit();
        }
    }, 100);
}


execute(my_info.username, my_info.password, ["330", "421"]);
