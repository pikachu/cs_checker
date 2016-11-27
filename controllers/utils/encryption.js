var crypto = require('crypto');
var dotenv = require('dotenv');
dotenv.load();
var algorithm = 'aes-256-ctr',
    password = process.env.DB_SECRET;

function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

exports.encrypt = encrypt;
exports.decrypt = decrypt;
