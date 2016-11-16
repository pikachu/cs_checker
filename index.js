var my_info = require('./config');
/*
var webPage = require('webpage');
var page = webPage.create();
*/
var page = new WebPage();

var loadInProgress = false;


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

function openPage(classes) {
    return page.open("https://grades.cs.umd.edu/classWeb/login.cgi", function(status){
        if (status === 'success'){
            console.log("Opened grades page.");
            return fillForm(my_info.username, my_info.password, classes);
        }
    });
}

function fillForm(user, pass, classes) {
    var obj = {username: user, password: pass};
    page.evaluate(function(obj) {
        console.log("Filling out info.");
        var arr = document.getElementsByTagName("form");
        arr[0].elements["user"].value = obj.username;
        arr[0].elements["password"].value = obj.password;
        document.getElementsByTagName("form")[0].submit.click();
    }, obj);
    setTimeout(function(){
        return getLinks(classes);
    }, 3000);
}

function getLinks(classes) {
    console.log("Getting links");
    var linkHash = page.evaluate(function(classes) {
        var newList = {};
        var lst = document.getElementsByTagName("a");
        var i;
        classes.forEach(function(classNo){
            for (i = 0; i < lst.length; i++){
                var curr = lst[i].innerHTML;
                if (curr.indexOf(classNo) != -1){
                    newList[classNo] = lst[i].href
                    console.log(lst[i].href);
                    break;
                }
            }
        });
        return newList;
    }, classes);
    return getGrades(0, linkHash);
}

function getGrades(i, links){
    // console.log("getGrades method executing.");
    var limit = Object.keys(links).length;
    var id = setTimeout(function(){
        if (i != limit){
            getGradesForPage(i, links);
            // AT THIS POINT, LINKS HAS WHAT WE WANT IT TO HAVE
        }
    }, 1000);
    Object.keys(links).forEach(function(key){
        console.log("Key: " + key + " Value: " + links[key]);
    });
    if (i == limit){
        console.log("i == limit. done.");
        /* The hash has been updated at this point
           so that the classes (keys) point to the grade
           in that class (values). THIS FUNCTION REPLACES THE
           LINKS TO THE CLASSES.
        */
        phantom.exit(0);
        return links;
    }
}

function getGradesForPage(i, links){
    // console.log("getGradesForPage method executing.");
    var arr = Object.keys(links);
    page.open(links[arr[i]], function(status){
        if (status === 'success'){
            getGradeOnPage(i, links);
        }
    });
}

function getGradeOnPage(i, links){
    // console.log("getGradeOnPage method executing.");
    var newLinks = page.evaluate(function(links, i){
        var arr = document.getElementsByTagName('td');
        console.log("Got tds, here is the last element we want:");
        console.log(arr[arr.length - 3].innerHTML);
        links[Object.keys(links)[i]] = arr[arr.length - 3].innerHTML;
        return links;
    }, links, i);
    links = newLinks
    getGrades((i + 1), links);
}

function execute(user, pw, classes) {
    openPage(classes);
}
execute(my_info.username, my_info.password, ['330','351']);

module.exports = {
    executeForUserWithClasses: execute
}

// SHOULD UNCOMMENT THIS
