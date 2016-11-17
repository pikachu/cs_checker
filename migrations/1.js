
exports.up = function(knex) {
  return knex.schema
    .createTable('users', function(table) {
      table.increments('id').primary();
      table.specificType('email', 'varchar(255) UNIQUE')
      table.string('passwordHash');
      table.string('passwordSalt');
      table.specificType('directoryId', 'varchar(255) UNIQUE');
      table.string('directoryPass');
      table.string('phoneNumber');
    })
    .createTable('grades', function(table) {
        table.increments('id').primary();
        table.bigInteger('user_id').references('users.id');
        table.integer('courseCode');
        table.float('grade');
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('grades')
    .dropTable('users');
};
