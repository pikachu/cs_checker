var phantom = require('phantom');
var phInstance;
var sitePage;
var bookshelf = require('../bookshelf');

/* Necessary */
var username = process.argv[2];
var password;

bookshelf.knex('users').where('directory_id', process.argv[2]).then(function(users) {
    var user = users[0];
    password = user.directory_pass;
});

var classes = process.argv[3].split(",");

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
            sitePage.evaluate(function(classes) {
                var newList = {};
                var lst = document.getElementsByTagName("a");
                if (document.body.innerHTML.indexOf('Fatal Error') != -1){
                    /* Returning because I am in the phantom browser right now */
                    return "ERROR LOGGING IN";
                }
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
                if (Object.keys(result).length != classes.length){
                    console.error("failure");
                }
                phInstance.exit();
                process.exit();
            });
        }
    });
