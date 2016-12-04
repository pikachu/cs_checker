const auth = require('../common/authentication');

/**
 * GET /contact
 */
exports.loginGet = (req, res) => {
    res.render('login', {
        title: 'Login'
    });
};

/**
 * POST /contact
 */
exports.loginPost = (req, res) => {
    auth.authenticate(req.body.email, req.body.password, (err, user) => {
        if (user) {
            req.session.regenerate(() => {
                req.session.user = user;
                res.redirect('/profile');
            });
        } else {
            req.flash('error', { msg: err.message });
            res.render('login', {
                email: req.body.email
            });
        }
    });
};
