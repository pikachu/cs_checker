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
    if (!req.body.pass || !req.body.newPass || !req.body.newPassConfirm) {
        res.render('changePass', {
            errorStatus: 'Please enter all information!'
        });
        /* user did not input all info */
        return;
    }
    /* Makes sure input pass is same as saved pass */

    if (req.body.newPassConfirm !== req.body.newPass) {
        res.render('changePass', {
            errorStatus: 'Passwords do not match!'
        });
        /* pw confirm is wrong, need to render bad */
    }
    auth.hash(req.body.newPass, (err, salt, hash) => {
        if (err) throw err;
        bookshelf.knex('users').where({
            email: req.body.email,
            directory_id: req.session.user.id
        }).update({
            password_salt: salt.toString('base64'),
            password_hash: hash.toString('base64')
        }).then(() => {
            bookshelf.knex('users').where('id', req.session.user.id).then(users => {
                req.session.regenerate(() => {
                    req.session.user = users[0];
                    res.status(200);
                    req.flash('success', { msg: `Password changed for ${req.body.email}` });
                    res.redirect('/profile');
                });
            });
        });
    });
}

async function updateProfile(req, res) {
    if (req.body.newUMDPass && req.body.newUMDPass !== '') {
        const encryptedPass = encryption.encrypt(req.body.newUMDPass);
        await bookshelf.knex('users').where('id', req.session.user.id).update({
            directory_pass: encryptedPass
        });
        try {
            await script.loginToGradeServer(req.session.user.directory_id, req.body.newUMDPass);
            await bookshelf.knex('users').where('id', req.session.user.id).update({
                validCredentials: true
            });
        } catch (e) {
            await bookshelf.knex('users').where('id', req.session.user.id).update({
                validCredentials: false
            });
        }
    }
    await script.checkUser(req.session.user, false);
    await bookshelf.knex('users').where('id', req.session.user.id).update({
        getsEmails: req.body.getsEmails ? true : false,
        getsTexts: req.body.getsTexts ? true : false,
        phone_number: phone(req.body.newPhone, 'USA')[0]
    });
    const users = await bookshelf.knex('users').where('id', req.session.user.id);
    req.session.regenerate(() => {
        req.session.user = users[0];
        res.status(200);
        req.flash('success', { msg: `Information saved for ${req.body.email}` });
        res.redirect('/profile');
    });
}

module.exports = { changePassGet, changePassPost };
