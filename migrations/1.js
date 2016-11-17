
exports.up = function(knex) {
  return knex.schema
    .createTable('users', function(table) {
      table.increments('id').primary();
      table.string('email');
      table.string('password');
      table.string('directoryId');
      table.string('directoryPass');
      table.string('phone_number');
    })
    .createTable('grades', function(table) {
        table.increments('id').primary();
        table.bigInteger('user_id').references('users.id');
        table.string('courseCode');
        table.float('grade');
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('grades')
    .dropTable('users');
};
