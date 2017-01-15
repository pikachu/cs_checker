const auth = require('../common/authentication');
const crypt = require('../common/encryption');
const nodemailer = require('nodemailer');
const knex = require('../config/knex.js');

/*
* GET /forgotPass
*/
exports.forgotPassGet = (req, res) => {
    res.render('forgotPass', {
        title: 'Forgot Password'
    });
};

/*
* POST /forgotPass
*/
exports.forgotPassPost = (req, res) => {
    var newPass = (Math.random() + 1).toString(36).substring(2, 16);
    if (req.body.email){
        umdPassEncrypt = crypt.encrypt(req.body.UMDPass);
        auth.hash(newPass, (err, salt, hash) => {
            if (err) throw err;
            knex('users').where({
                email: req.body.email,
                directory_id: req.body.UMDID,
                directory_pass: umdPassEncrypt
            }).then((elements) => {
                if (elements.length > 0){
                    knex('users').where({
                        email: req.body.email,
                        directory_id: req.body.UMDID,
                        directory_pass: umdPassEncrypt
                    }).update({
                        password_salt: salt.toString('base64'),
                        password_hash: hash.toString('base64')
                    }).then(() => {
                        var transport = nodemailer.createTransport({
                            service: 'Gmail',
                            auth: {
                                user: 'umdcschecker@gmail.com',
                                pass: 'ishmikecam'
                            }
                        });
                        var message = "Your new password is: " + newPass + "\n\nPlease change this once logging in.";
                        var mailOptions = {
                            from: 'cameron.payton7@gmail.com',
                            to: req.body.email,
                            subject: 'CS Grade Checker Password Reset',
                            text: message
                        };
                        transport.sendMail(mailOptions, (error, info) => {
                            if (error){
                                console.log(error);
                            } else {
                                console.log("email sent: " + info.response)
                            }
                        });

                        res.render('forgotPass', {
                            emailStatus: 'Email Sent!'
                        });
                    });
                } else {
                    res.render('forgotPass', {
                        emailStatus: 'Please enter valid credentials!'
                    });
                }
            });
        });
    } else {
        res.render('forgotPass', {
            emailStatus: 'Please enter an email address!'
        });
    }
};
