var nodemailer = require('nodemailer');
var config = require('./config');
var bookshelf = require('./bookshelf');
// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport('smtps://' + config.email + ':' + config.epass + '@smtp.gmail.com');

function sendMessage(user_id){
    bookshelf.knex('users').where('id',user_id).then(function(users){
        var user = users[0];
        var email = user.email;
        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: 'Ishaan Parikh', // sender address
            to: email, // list of receivers
            subject: 'Your grades have updated!', // Subject line
            text: 'Hello world ?', // plaintext body
            html: '<b>Hello world ?</b>' // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log(error);
            }
            console.log('Message sent: ' + info.response);
        });
    })
}

module.exports = {
    sendMessage: sendMessage
};
