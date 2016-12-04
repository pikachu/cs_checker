
/**
 * GET /logout
 */
exports.logoutGet = (req, res) => req.session.destroy(() => res.redirect('/login'));
