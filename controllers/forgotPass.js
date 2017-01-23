const auth = require('../common/authentication');
const nodemailer = require('nodemailer');
const knex = require('../config/knex.js');
const scriptRequest = require('../grade_server_api/scriptRequest');
const config = require('../config');

const transporter = nodemailer.createTransport(`smtps://${config.email}:${config.epass}@smtp.gmail.com`);
/*
* GET /forgotPass
*/
function forgotPassGet(req, res) {
    res.render('forgotPass', {
        title: 'Forgot Password'
    });
}

/*
* POST /forgotPass
*/
async function forgotPassPost(req, res) {
    const newPass = (Math.random() + 1).toString(36).substring(2, 16);
    if (!req.body.email || !req.body.UMDPass || !req.body.UMDID) {
        res.render('forgotPass', {
            emailStatus: 'Please enter all information!'
        });
        return;
    }
    const elements = await knex('users').where({
        email: req.body.email,
        directory_id: req.body.UMDID
    });
    if (elements.length === 0) {
        res.render('forgotPass', {
            emailStatus: 'No email id combination found!'
        });
    }
    try {
        await scriptRequest.loginToGradeServer(req.body.UMDID, req.body.UMDPass);
    } catch (e) {
        res.render('forgotPass', {
            emailStatus: 'Please enter valid credentials!'
        });
    }
    auth.hash(newPass, (err, salt, hash) => {
        if (err) throw err;
        knex('users').where({
            email: req.body.email,
            directory_id: req.body.UMDID
        }).update({
            password_salt: salt.toString('base64'),
            password_hash: hash.toString('base64')
        }).then(() => {
            const message = `Your new password is: ${newPass} \n\nPlease change this once logging in.`;
            const mailOptions = {
                from: config.email,
                to: req.body.email,
                subject: 'CS Grade Checker Password Reset',
                text: message
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) throw error;
                console.log(`email sent: ${info.response}`);
                res.render('forgotPass', {
                    emailStatus: 'Email Sent!'
                });
            });
        });
    });
}

module.exports = { forgotPassGet, forgotPassPost };
