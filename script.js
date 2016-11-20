var userToLookup;
var phantom = require('phantom');
var User = require('./models/user');
var Grade = require('./models/grade');

var phInstance;
var sitePage;

var username = process.argv[2];
var password = process.argv[3];
if (process.argv[4] === 'LOGINONLY'){
    var flag = 'LOGINONLY';
} else {
    var classes = process.argv[4].split(',');
}
var userToLookup = process.argv[5];

phantom.create()
    .then(function(instance) {
        console.log("Creating page.")
        phInstance = instance;
        return instance.createPage();
    })
    .then(function(page) {
        console.log("Created page -> opening grades server page");
        sitePage = page;
        return page.open("https://grades.cs.umd.edu/classWeb/login.cgi");
    })
    .then(function(status) {
        console.log("Status: " + status);
        console.log("Opened grades page.");
        var obj = {
            username: username,
            password: password
        };
        sitePage.evaluate(function(obj) {
            var arr = document.getElementsByTagName("form");
            arr[0].elements["user"].value = obj.username;
            arr[0].elements["password"].value = obj.password;
            document.getElementsByTagName("form")[0].submit.click();
        }, obj);

        setTimeout(function() {
            return getLinks();
        }, 3000);

        function getLinks() {
            sitePage.evaluate(function(classes) {
                var newList = {};
                var lst = document.getElementsByTagName("a");
                if (document.body.innerHTML.indexOf('Fatal Error') != -1){
                    // We did not log in
                    return "ERROR LOGGING IN"
                }
                var i;
                classes.forEach(function(classNo) {
                    for (i = 0; i < lst.length; i++) {
                        var curr = lst[i].innerHTML;
                        if (curr.indexOf(classNo) != -1) {
                            newList[classNo] = lst[i].href
                            break;
                        }
                    }
                });
                return newList;
            }, classes)
            .then(function(result){
                if (result === "ERROR LOGGING IN"){
                    console.error(result);
                    console.log(result);
                    process.exit();
                }
                if (flag && flag === 'LOGINONLY'){
                    console.log("Successful login.");
                    process.exit();
                }
                console.log(result)
                getGrades(0, result);
                function getGrades(i, links) {
                    console.log("In get grades.");
                    var limit = Object.keys(links).length;
                    var id = setTimeout(function() {
                        if (i != limit) {
                            getGradesForPage(i, links);
                        }
                    }, 1000);
                    Object.keys(links).forEach(function(key) {
                        console.log("Key: " + key + " Value: " + links[key]);
                    });
                    if (i == limit) {
                        console.log("i == limit. done.");
                        /* The hash has been updated at this point
                           so that the classes (keys) point to the grade
                           in that class (values). THIS FUNCTION REPLACES THE
                           LINKS TO THE CLASSES.
                        */
                        phInstance.exit(0);
                        checkWithDB(links);
                    }
                }

                function getGradesForPage(i, links) {
                    var arr = Object.keys(links);
                    console.log("Getting grade for page for " + links[arr[i]]);

                    sitePage.open(links[arr[i]])
                    .then(function(status) {
                        if (status === 'success') {
                            console.log("getGradeOnPage method executing.");
                            sitePage.evaluate(function(links, i) {
                                var arr = document.getElementsByTagName('td');
                                links[Object.keys(links)[i]] = arr[arr.length - 3].innerHTML;
                                return links;
                            }, links, i).then(function(links){
                                console.log(links);
                                getGrades((i + 1), links);
                            });
                        }
                    });
                }
                function checkWithDB(grades) {
                    var newClasses = {};
                    var needToSendMessage = false;
                    console.log("Checking with DB!");
                    new Grade({
                            user_id: userToLookup
                        })
                        .fetchAll()
                        .then(function(gradeRows) {
                            gradeRows.models.forEach(function(base) {
                                var currCourse = base.attributes.courseCode;
                                var savedGrade = base.attributes.grade;
                                if (savedGrade != parseFloat(grades[currCourse])) {
                                    console.log("Need to update grade for " + currCourse);
                                    needToSendMessage = true;
                                    new Grade({
                                        id: base.attributes.id,
                                        user_id: userToLookup,
                                        courseCode: currCourse,
                                        grade: parseFloat(grades[currCourse])
                                    }).save(null, {
                                        method: "update"
                                    });
                                }
                            });
                        });
                }
            });
        }
    });
