var User = require('../models/user');


/**
 * GET /logout
 */
exports.logoutGet = function(req, res) {
    req.session.destroy(function () {
          res.redirect('/');
    });
};
