var phantom = require('phantom');
var bookshelf = require('../bookshelf');
var getUser = require('../controllers/utils/db').getUser;

function testValidClasses(user_id, classes_str, callback){
    var classes = classes_str.split(",");
    var username;
    var password;
    var phInstance;
    var sitePage;
    getUser(user_id).then(function(user){
        username = user.directory_id;
        password = user.directory_pass;
    }).then(function(){
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
                var obj = {
                    username: username,
                    password: password
                };
                console.log(obj);
                /* Clicks on sign-in */
                return sitePage.evaluate(function(obj) {
                    var arr = document.getElementsByTagName("form");
                    arr[0].elements["user"].value = obj.username;
                    arr[0].elements["password"].value = obj.password;
                    document.getElementsByTagName("form")[0].submit.click();
                }, obj);


            }).then(function(){
                sleep(3000).then(() => {
                    return sitePage.evaluate(function(classes) {
                        var newList = {};
                        var lst = document.getElementsByTagName("a");
                        var i;
                        classes.forEach(function(classNo) {
                            for (i = 0; i < lst.length; i++) {
                                var curr = lst[i].innerHTML;
                                if (curr.indexOf(classNo) != -1) {
                                    newList[classNo] = lst[i].href;
                                    break;
                                }
                            }
                        });
                        return newList;
                    }, classes)
                    .then(function(result){
                        console.log(Object.keys(result).length);
                        console.log(classes.length);
                        phInstance.exit();
                        callback(Object.keys(result).length == classes.length)
                    });
                });
            });
        });
}

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

module.exports = {
    testValidClasses: testValidClasses
};
