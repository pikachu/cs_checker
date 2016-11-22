var crypto = require('crypto');
var User = require('../../models/user');
var len = 128;
var iterations = 12000;

/**
 * Hashes a password with optional `salt`, otherwise
 * generate a salt for `pass` and invoke `fn(err, salt, hash)`.
 *
 * @param {String} password to hash
 * @param {String} optional salt
 * @param {Function} callback
 * @api public
 */

function hash(pwd, salt, fn) {
  if (3 == arguments.length) {
    crypto.pbkdf2(pwd, salt, iterations, len, fn);
  } else {
    fn = salt;
    crypto.randomBytes(len, function(err, salt){
      if (err) return fn(err);
      salt = salt.toString('base64');
      crypto.pbkdf2(pwd, salt, iterations, len, function(err, hash){
        if (err) return fn(err);
        fn(null, salt, hash);
      });
    });
  }
};

function authenticate(name, pass, fn) {
    new User({'email': name}).fetch().then(
        function (user) {
            if (!user) {
                fn(new Error('no such user'));
            } else {
                hash(pass, user.get('password_salt'), function (err, hash) {
                    if (err) return fn(err);
                    if (hash.toString('base64') === user.get('password_hash')) return fn(null, user);
                    fn(new Error('invalid password'));
                });
            }
        });
}

function requiredAuthentication(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        req.session.error = 'Access denied!';
        res.redirect('/login');
    }
}

function userExists(req, res, next) {
    new User({'email': req.body.email}).fetch().then(function (user) {
        if (user) {
            next();
        } else {
            res.redirect("/signup");
        }
    });
}

exports.hash = hash;
exports.authenticate = authenticate;
exports.requiredAuthentication = requiredAuthentication;
exports.userExists = userExists;
