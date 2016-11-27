const phantom = require('phantom');
const User = require('../models/user');
const Grade = require('../models/grade');
const bookshelf = require('../bookshelf');
const sendMessage = require('../email').sendMessage;
const getUser = require('../controllers/utils/db').getUser;

function doPhantom(username, password, courses) {
    let phInstance;
    let sitePage;
    phantom.create()
        .then(instance => {
            /* Create page */
            console.log("Creating page.");
            phInstance = instance;
            return instance.createPage();
        })
        .then(page => {
            /* Open grades page */
            console.log("Created page -> opening grades server page");
            sitePage = page;
            return page.open("https://grades.cs.umd.edu/classWeb/login.cgi");
        })
        .then(status => {
            console.log("Status: " + status);
            const obj = { username, password };
            /* Clicks on sign-in */
            sitePage.evaluate(function (obj) {
                const arr = document.getElementsByTagName("form");
                arr[0].elements["user"].value = obj.username;
                arr[0].elements["password"].value = obj.password;
                document.getElementsByTagName("form")[0].submit.click();
            }, obj);
            /* Waits because it takes time for phantom to change pages. */


            function getLinks() {
                /* Get all the links and check to make sure we actually log in. */
                sitePage.evaluate(function(courses) {
                    var i;
                    const newList = {};
                    const lst = document.getElementsByTagName('a');
                    if (document.body.innerHTML.indexOf('Fatal Error') !== -1) {
                        /* Returning because I am in the phantom browser right now */
                        return 'ERROR LOGGING IN';
                    }
                    courses.forEach(function(classNo) {
                        for (i = 0; i < lst.length; i ++) {
                            const curr = lst[i].innerHTML;
                            if (curr.indexOf(classNo) !== -1) {
                                newList[classNo] = lst[i].href;
                                break;
                            }
                        }
                    });
                    return newList;
                }, courses)
                .then(result => {
                    if (result === 'ERROR LOGGING IN'){
                        console.error(result);
                        phInstance.exit(0);
                        /*
                         * Need to create flag in DB that will esentially have
                         * a "NEEDS TO UPDATE PW".
                         */
                        process.exit();
                    }

                    function getGradesForPage(i, links) {
                        const arr = Object.keys(links);
                        sitePage.open(links[arr[i]])
                        .then(status => {
                            if (status === 'success') {
                                sitePage.evaluate(function(links, i) {
                                    var arr = document.getElementsByTagName('td');
                                    links[Object.keys(links)[i]] = arr[arr.length - 3].innerHTML;
                                    return links;
                                }, links, i).then(links => {
                                    getGrades((i + 1), links);
                                });
                            }
                        });
                    }

                    function checkWithDB(newGrades) {
                        let needToSendMessage = false;
                        new User({ directory_id: username }).fetch().then(user => {
                            bookshelf.knex('grades').where('user_id', user.get('id')).then(oldGrades => {
                                oldGrades.forEach(base => {
                                    const currCourse = base.course_code;
                                    const savedGrade = base.grade;
                                    if (savedGrade !== parseFloat(newGrades[currCourse])) {
                                        needToSendMessage = true;
                                        /*
                                        console.log("id: " + parseInt(base.id));
                                        console.log("user_id: " + user.get('id'));
                                        console.log("course_code: " + currCourse);
                                        console.log("grade: " + parseFloat(newGrades[currCourse]));
                                        */
                                        new Grade({
                                            id: parseInt(base.id, 10),
                                            user_id: user.get('id'),
                                            course_code: currCourse,
                                            grade: parseFloat(newGrades[currCourse])
                                        }).save(null, {
                                            method: 'update'
                                        });
                                    }
                                });
                            }).then(() => {
                                if (needToSendMessage) {
                                    sendMessage(user.get('id'));
                                }
                            });
                        });
                    }

                    function getGrades(i, links) {
                        const limit = Object.keys(links).length;
                        setTimeout(() => {
                            if (i !== limit) {
                                getGradesForPage(i, links);
                            }
                        }, 1000);
                        Object.keys(links).forEach(key => {
                            console.log('Key: ' + key + ' Value: ' + links[key]);
                        });
                        if (i === limit) {
                            console.log('i == limit. done.');
                            phInstance.exit(0);
                            checkWithDB(links);
                        }
                    }
                    getGrades(0, result);
                });
            }
            setTimeout(() => getLinks(), 3000);
        });
}

function updateUser(username) {
    const courses = [];
    let password;
    bookshelf.knex('users').where('directory_id', username).then(users => {
        const user = users[0];
        getUser(user.id).then(userWithPW => {
            password = userWithPW.directory_pass;
        }).then(() => {
            bookshelf.knex('grades').where('user_id', user.id).then(grades => {
                grades.forEach(grade => {
                    courses.push(grade.course_code);
                });
            }).then(() => {
                doPhantom(username, password, courses);
            });
        });
    });
}

module.exports = { updateUser };
