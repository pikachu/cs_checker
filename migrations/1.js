
exports.up = function(knex) {
  return knex.schema
    .createTable('users', function(table) {
      table.increments('id').primary();
      table.string('username');
      table.string('password');
      table.string('directoryId');
      table.string('directoryPass');
      table.string('email');
      table.string('phone_number');
    })
    .createTable('grades', function(table) {
        table.bigInteger('id');
        table.integer('courseCode');
        table.float('grade');
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('grades')
    .dropTable('users');
};
