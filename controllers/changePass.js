const bookshelf = require('../bookshelf');
// const logout = require('../controllers/logout');
const encryption = require('../common/encryption');
// var formidable = require('formidable');
const script = require('../grade_server_api/scriptRequest');
const phone = require('phone');
const auth = require('../common/authentication');

/**
 * GET /logout
 */
function changePassGet(req, res) {
    if (!req.session.user) {
        res.redirect('/login');
        return;
    }
    res.render('changePass', {
        title: 'Change Password'
    });
}

async function changePassPost(req, res) {
    var nonmatch = false;

    if (!req.body.pass || !req.body.newPass || !req.body.newPassConfirm) {
        res.render('changePass', {
            passStatus: 'Please enter all information!'
        });
        /* user did not input all info */
        return;
    }

    if (req.body.newPassConfirm !== req.body.newPass) {
        res.render('changePass', {
            passStatus: 'Passwords do not match!'
        });
        return;
        /* pw confirm is wrong, need to render bad */
    }

    if (!(req.body.newPass.length >= 6 && /\d+/.test(req.body.newPass) && /[a-zA-Z_]+/.test(req.body.newPass))){
        console.log("Invalid Password!");
        res.render('changePass', {
            passStatus: 'Password must be at least 6 characters and contain a number and a letter.'
        });
        return;
    }

    auth.authenticate(req.session.user.email, req.body.pass, (err, user) => {
        if (user) {
            console.log('correct password.');
            auth.hash(req.body.newPass, (err, salt, hash) => {
                if (err) throw err;
                bookshelf.knex('users').where({
                    email: req.session.user.email,
                    directory_id: req.session.user.directory_id
                }).update({
                    password_salt: salt.toString('base64'),
                    password_hash: hash.toString('base64')
                }).then((users) => {
                    bookshelf.knex('users').where('id', req.session.user.id).then(users => {
                        req.session.regenerate(() => {
                            req.session.user = users[0];
                            res.status(200);
                            req.flash('success', { msg: `Password changed for ${req.body.email}` });
                            res.render('changePass', {
                                passStatus: 'Password changed!'
                            });
                        });
                    });
                });
            });
        } else {
            console.log('incorrect password.');
            res.render('changePass', {
                passStatus: 'Invalid Password!'
            });
        }
    });
}

module.exports = { changePassGet, changePassPost };
