const nodemailer = require('nodemailer');
const config = require('../config');
const bookshelf = require('../bookshelf');
// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport(`smtps://${config.email}:${config.epass}@smtp.gmail.com`);

async function getNewGradesString(userId) {
    let htmlstr = '';
    let plaintext = '';
    const grades = await bookshelf.knex('grades').where('user_id', userId);
    grades.forEach(grade => {
        htmlstr = `${htmlstr} <li><b> ${grade.course_code}:</b>  ${grade.grade}</li>`;
        plaintext = `${plaintext}${grade.course_code}: ${grade.grade}\n`;
    });
    return [htmlstr, plaintext];
}

async function sendEmail(userId) {
    const message = await getNewGradesString(userId);
    const htmlstr = `<b>Your grades have changed!</b><br><ul>${message[0]}</ul>`;
    const plaintext = `Your grades have changed!\n${message[1]}`;
    const users = await bookshelf.knex('users').where('id', userId);
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
        console.log(`Message sent: ${info.response}`);
    });
}

module.exports = { sendEmail, getNewGradesString };
