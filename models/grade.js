var bookshelf = require('../bookshelf');
var User = require('./user');

var Grade = bookshelf.Model.extend({
  tableName: 'grades',
  user: function() {
    return this.belongsTo(User);
  }
});
module.exports = Grade;
