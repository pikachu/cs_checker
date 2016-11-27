const crypto = require('crypto');
const db = require('./db');

const len = 128;
const iterations = 12000;

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
    if (arguments.length === 3) {
        crypto.pbkdf2(pwd, salt, iterations, len, fn);
    } else {
        fn = salt;
        crypto.randomBytes(len, (err, newSalt) => {
            if (err) return fn(err);
            newSalt = newSalt.toString('base64');
            crypto.pbkdf2(pwd, newSalt, iterations, len, (err2, hashCode) => {
                if (err2) return fn(err2);
                fn(null, salt, hashCode);
            });
        });
    }
}

function authenticate(email, pass, fn) {
    db.getUser(email).then(user => {
        if (!user) {
            fn(new Error('no such user'));
        } else {
            hash(pass, user.password_salt, (err, hashCode) => {
                if (err) return fn(err);
                if (hashCode.toString('base64') === user.password_hash) return fn(null, user);
                return fn(new Error('invalid password'));
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
    db.getUser(req.body.email).then(user => {
        if (user) {
            next();
        } else {
            res.redirect('/signup');
        }
    });
}

exports.hash = hash;
exports.authenticate = authenticate;
exports.requiredAuthentication = requiredAuthentication;
exports.userExists = userExists;
