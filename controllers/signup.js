const auth = require('../common/authentication');
const crypt = require('../common/encryption');
const script = require('../grade_server_api/script');
const db = require('../common/db');
const phantom = require('phantom');
/**
 * GET /contact
 */
exports.signupGet = (req, res) => {
    res.render('signup', {
        title: 'Contact'
    });
};

/**
 * POST /contact
 */
exports.signupPost = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const instance = await phantom.create();
    try {
        await script.loginToGradeServer(instance, req.body.umdusername, req.body.umdpass);
    } catch (e) {
        req.session.regenerate(() => {
            req.flash('success', { msg: `Incorrect login for ${req.body.umdusername} ` });
            res.render('signup', {
                email: req.body.email,
                directory_id: req.body.umdusername
            });
        });
        return;
    }
    auth.hash(password, (err, salt, hash) => {
        if (err) throw err;
        db.createUser({
            email,
            password_salt: salt.toString('base64'),
            password_hash: hash.toString('base64'),
            getsEmails: true,
            getsTexts: false,
            validCredentials: true,
            directory_id: req.body.umdusername,
            directory_pass: crypt.encrypt(req.body.umdpass)
        }).then(newUser => {
            if (err) throw err;
            auth.authenticate(newUser.email, password, (err2, user) => {
                if (err2) throw err2;
                if (user) {
                    req.session.regenerate(() => {
                        req.session.user = user;
                        req.flash('success', { msg: `Information saved for ${req.body.email}` });
                        res.redirect('/profile');
                    });
                }
            });
        });
    });
};
