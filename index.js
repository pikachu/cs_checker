var my_info = require('./config');
var page = new WebPage(), testindex = 0, loadInProgress = false;

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
    //Load Login Page
    page.open("https://grades.cs.umd.edu/classWeb/login.cgi");
  },
  function() {
    //Enter Credentials
    page.evaluate(function(my_info) {

      var arr = document.getElementsByTagName("form");
      arr[0].elements["user"].value = my_info.username;
      arr[0].elements["password"].value = my_info.password;
      console.log(arr[0].elements["user"].value);
      console.log(arr[0].elements["password"].value);
    }, my_info);
  },
  function() {
    //Login
    page.evaluate(function() {

      var arr = document.getElementsByTagName("form");
      console.log(arr[0].elements["user"].value);
      console.log(arr[0].elements["password"].value);
      arr[0].submit.click();
      console.log(arr[0]);

    });
  },
  function() {
    // Output content of page to stdout after form has been submitted
    page.evaluate(function() {
      console.log(document.querySelectorAll('html')[0].outerHTML);
    });
  }
];


interval = setInterval(function() {
  if (!loadInProgress && typeof steps[testindex] == "function") {
    console.log("step " + (testindex + 1));
    steps[testindex]();
    testindex++;
  }
  if (typeof steps[testindex] != "function") {
    console.log("test complete!");
    phantom.exit();
  }
}, 50);
