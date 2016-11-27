var nodemailer = require('nodemailer');
var config = require('./config');
var bookshelf = require('./bookshelf');
// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport('smtps://' + config.email + ':' + config.epass + '@smtp.gmail.com');

function sendMessage(user_id){
    getNewGradesString(user_id, function(message){
        var htmlstr = '<b>Your grades have changed!</b><br>Here are your new grades:<br><ul>' + message[0] + '</ul>';
        var plaintext = 'Your grades have changed!\nHere are your new grades:\n' + message[1];
        bookshelf.knex('users').where('id',user_id).then(function(users){
            var user = users[0];
            var email = user.email;
            // setup e-mail data with unicode symbols
            var mailOptions = {
                from: 'Ishaan Parikh', // sender address
                to: email, // list of receivers
                subject: 'Your CS grades have updated!', // Subject line
                text: plaintext, // plaintext body
                html: htmlstr // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    return console.log(error);
                }
                console.log('Message sent: ' + info.response);
            });
        });
    });
}

function getNewGradesString(user_id, callback){
    var htmlstr = '';
    var plaintext = '';
    bookshelf.knex('grades').where('user_id', user_id).then(function(grades){
        grades.forEach(function(grade){
            htmlstr = htmlstr + '<li><b>' + grade.course_code + ':</b> ' + grade.grade + '</li>';
            plaintext = plaintext + grade.course_code + ': ' + grade.grade + '\n';
        });
    }).then(function(){
        callback([htmlstr, plaintext]);
    });
}

module.exports = {
    sendMessage: sendMessage
};
