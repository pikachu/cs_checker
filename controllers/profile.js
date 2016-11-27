/**
 * GET /logout
 */
exports.profileGet = (req, res) =>
    res.render('profile', {
        email: req.session.user.email
    });
