var bookshelf = require('../bookshelf');
var Grade = require('./grade');
var User = bookshelf.Model.extend({
  tableName: 'users',
  grades: function() {
    return this.hasMany(Grade);
  }
});
module.exports = User;
