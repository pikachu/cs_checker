var my_info = require('./config');
var page = new WebPage();
var state = 0,
    loadInProgress = false;
var OPEN_PAGE = 0,
    FILL_FORM = 1,
    LOG_IN = 2,
    GET_HTML = 3,
    GET_COURSES = 4,
    GET_GRADE = 5;

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

function openPage() {
    page.open("https://grades.cs.umd.edu/classWeb/login.cgi", function(status){
        if (status === 'success'){
            console.log("Opened grades page.");
            fillForm(my_info.username, my_info.password);
        }
    });
}

function fillForm(user, pass) {
    var obj = {username: user, password: pass};
    page.evaluate(function(obj) {
        console.log("Filling out info.");
        var arr = document.getElementsByTagName("form");
        arr[0].elements["user"].value = obj.username;
        arr[0].elements["password"].value = obj.password;
        document.getElementsByTagName("form")[0].submit.click();
    }, obj);
    setTimeout(function(){
        getLinks(['330', '351']);
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
        })
        return newList;
    }, classes);
    getGrades(linkHash);
}

function getGrades(links){
    var i = 0;
    var limit = Object.keys(links).length;
    var id = setInterval(function(){
        links[Object.keys(links)[i]] = getGradesForPage(i, links);
        i ++;
        if (i == limit){
            clearInterval(id);
            // AT THIS POINT, LINKS HAS WHAT WE WANT IT TO HAVE
        }
    }, 5000);

}

function getGradesForPage(current, links){
    var arr = Object.keys(links);
    return page.open(links[arr[current]], function(status){
        if (status === 'success'){
            return getGradeOnPage();
        }
    });
}

function getGradeOnPage(){
    return page.evaluate(function(){
        var arr = document.getElementsByTagName('td');
        console.log("Got tds, here is the last element we want:")
        console.log(arr[arr.length - 3].innerHTML)
        return arr[arr.length - 3].innerHTML;
    });
}



function execute(user, pw, classes) {
    openPage();
}


execute(my_info.username, my_info.password, ["330", "351"]);
