'use strict';

const fs = require('fs');
const sql = fs.readFileSync('node_modules/connect-pg-simple/table.sql').toString();

module.exports = {
  up: queryInterface => queryInterface.sequelize.query(sql),
  down: queryInterface => {
    const tableName = sql.match(/CREATE TABLE "(.*?)"/i)[1];
    return queryInterface.dropTable(tableName);
  }
};
