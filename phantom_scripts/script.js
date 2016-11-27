var phantom = require('phantom');
var User = require('../models/user');
var Grade = require('../models/grade');
var bookshelf = require('../bookshelf');
var sendMessage = require('../email').sendMessage;
var getUser = require('../controllers/utils/db').getUser;

function doImportantThings(username){
    var courses = [];
    var password;
    bookshelf.knex('users').where('directory_id', username).then(function(users) {
        var user = users[0];
        var id = user.id;
        getUser(user.id).then(function(user){
            password = user.directory_pass;
        }).then(function(){
            bookshelf.knex('grades').where('user_id', id).then(function(grades) {
                grades.forEach(function(grade){
                    courses.push(grade.course_code);
                });
            }).then(function(){
                doPhantom(username,password,courses);
            });
        });
    });
}

function doPhantom(username, password, courses){
    var phInstance;
    var sitePage;
    phantom.create()
        .then(function(instance) {
            /* Create page */
            console.log("Creating page.");
            phInstance = instance;
            return instance.createPage();
        })
        .then(function(page) {
            /* Open grades page */
            console.log("Created page -> opening grades server page");
            sitePage = page;
            return page.open("https://grades.cs.umd.edu/classWeb/login.cgi");
        })
        .then(function(status) {
            console.log("Status: " + status);
            var obj = {
                username: username,
                password: password
            };
            /* Clicks on sign-in */
            sitePage.evaluate(function(obj) {
                var arr = document.getElementsByTagName("form");
                arr[0].elements["user"].value = obj.username;
                arr[0].elements["password"].value = obj.password;
                document.getElementsByTagName("form")[0].submit.click();
            }, obj);
            /* Waits because it takes time for phantom to change pages. */
            setTimeout(function() {
                return getLinks();
            }, 3000);

            function getLinks() {
                /* Get all the links and check to make sure we actually log in. */
                sitePage.evaluate(function(courses) {
                    var newList = {};
                    var lst = document.getElementsByTagName("a");
                    if (document.body.innerHTML.indexOf('Fatal Error') != -1){
                        /* Returning because I am in the phantom browser right now */
                        return "ERROR LOGGING IN";
                    }
                    var i;
                    courses.forEach(function(classNo) {
                        for (i = 0; i < lst.length; i++) {
                            var curr = lst[i].innerHTML;
                            if (curr.indexOf(classNo) != -1) {
                                newList[classNo] = lst[i].href;
                                break;
                            }
                        }
                    });
                    return newList;
                }, courses)
                .then(function(result){
                    if (result === "ERROR LOGGING IN"){
                        console.error(result);
                        phInstance.exit(0);
                        // Need to create flag in DB that will esentially have a "NEEDS TO UPDATE PW"
                        process.exit();
                    }
                    getGrades(0, result);
                    function getGrades(i, links) {
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
                            phInstance.exit(0);
                            checkWithDB(links);
                        }
                    }

                    function getGradesForPage(i, links) {
                        var arr = Object.keys(links);
                        sitePage.open(links[arr[i]])
                        .then(function(status) {
                            if (status === 'success') {
                                sitePage.evaluate(function(links, i) {
                                    var arr = document.getElementsByTagName('td');
                                    links[Object.keys(links)[i]] = arr[arr.length - 3].innerHTML;
                                    return links;
                                }, links, i).then(function(links){
                                    getGrades((i + 1), links);
                                });
                            }
                        });
                    }

                    function checkWithDB(newGrades) {
                        var needToSendMessage = false;
                        new User({directory_id: username}).fetch().then(function(user){
                            bookshelf.knex('grades').where('user_id', user.get('id')).then(function(oldGrades) {
                                oldGrades.forEach(function(base) {
                                    var currCourse = base.course_code;
                                    var savedGrade = base.grade;
                                    if (savedGrade != parseFloat(newGrades[currCourse])) {
                                        needToSendMessage = true;
                                        console.log("id: " + parseInt(base.id));
                                        console.log("user_id: " + user.get('id'));
                                        console.log("course_code: " + currCourse);
                                        console.log("grade: " + parseFloat(newGrades[currCourse]));
                                        new Grade({
                                            id: parseInt(base.id),
                                            user_id: user.get('id'),
                                            course_code: currCourse,
                                            grade: parseFloat(newGrades[currCourse])
                                        }).save(null, {
                                            method: "update"
                                        });
                                    }
                                });
                            }).then(function(){
                                if (needToSendMessage){
                                    sendMessage(user.get('id'));
                                }
                            });
                        });
                    }
                });
            }
        });
}

module.exports = {
    updateUser: doImportantThings
};
