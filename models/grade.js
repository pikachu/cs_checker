var bookshelf = require('../bookshelf');
var Grade = bookshelf.Model.extend({
  tableName: 'grades',
});
module.exports = Grade;
