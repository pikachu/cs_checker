
exports.up = function(knex) {
  return knex.schema
    .createTable('users', function(table) {
      table.increments('id').primary();
      table.string('email').unique();
      table.string('password_hash');
      table.string('password_salt');
      table.string('directory_id').unique();
      table.string('directory_pass');
      table.string('phone_number');
    })
    .createTable('grades', function(table) {
        table.increments('id').primary();
        table.bigInteger('user_id').references('users.id');
        table.string('course_code');
        table.float('grade');
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('grades')
    .dropTable('users');
};
