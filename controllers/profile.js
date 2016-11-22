var User = require('../models/user');

/**
 * GET /logout
 */
exports.profileGet = function(req, res) {
    res.render('profile', {
      email: req.session.user.email
    });
};
