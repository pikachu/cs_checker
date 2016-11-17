var User = require('../models/user');


/**
 * GET /logout
 */
exports.logoutGet = function(req, res) {
  res.redirect('/');
};
