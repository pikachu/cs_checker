const nodemailer = require('nodemailer');
const config = require('../../config');
const bookshelf = require('../../bookshelf');
// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport(`smtps://${config.email}:${config.epass}@smtp.gmail.com`);

function getNewGradesString(userId, callback) {
    let htmlstr = '';
    let plaintext = '';
    bookshelf.knex('grades').where('user_id', userId).then(grades => {
        grades.forEach(grade => {
            htmlstr = `${htmlstr} <li><b> ${grade.course_code}:</b>  ${grade.grade}</li>`;
            plaintext = `${plaintext}${grade.course_code}: '${grade.grade}\n`;
        });
    }).then(() => {
        callback([htmlstr, plaintext]);
    });
}

function sendMessage(userId) {
    getNewGradesString(userId, message => {
        const htmlstr = `<b>Your grades have changed!</b><br>Here are your new grades:<br><ul>${message[0]}</ul>`;
        const plaintext = `Your grades have changed!\nHere are your new grades:\n${message[1]}`;
        bookshelf.knex('users').where('id',userId).then(users => {
            const user = users[0];
            // setup e-mail data with unicode symbols
            const mailOptions = {
                from: 'Ishaan Parikh', // sender address
                to: user.email, // list of receivers
                subject: 'Your CS grades have updated!', // Subject line
                text: plaintext, // plaintext body
                html: htmlstr // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: ' + info.response);
            });
        });
    });
}

module.exports = { sendMessage };
