var page = require('webpage').create();
//var creds = require("./config");
page.open('https://grades.cs.umd.edu/classWeb/login.cgi', function(status) {
  console.log("Status: " + status);
  var body = page.evaluate(function() {
     return document.body;
  });
  console.log(body.innerHTML);
  /*
  var nameEle = page.evaluate(function(){
      var b = document.getElementsByName('name');
      return b;
  }
  console.log(nameEle.length);
  */
  phantom.exit();
});
