var phantom = require('phantom');

function testValidLogin(username, password, callback){
    callback(true);
    return;
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
            return sitePage.evaluate(function(obj) {
                var arr = document.getElementsByTagName("form");
                arr[0].elements["user"].value = obj.username;
                arr[0].elements["password"].value = obj.password;
                document.getElementsByTagName("form")[0].submit.click();
            }, obj);


        }).then(function(){
            sleep(3000).then(() => {
                return sitePage.evaluate(function() {
                    var lst = document.getElementsByTagName("a");
                    if (document.body.innerHTML.indexOf('Fatal Error') != -1){
                        /* Returning because I am in the phantom browser right now */
                        return false;
                    } else {
                        return true;
                    }
                });
            }).then(function(result){
                console.log(result);
                phInstance.exit(0);
                callback(result);
            });
        });
}

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

module.exports = {
    testValidLogin: testValidLogin
};
