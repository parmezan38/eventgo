'use strict';

const TABLE_NAME = 'event';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable(TABLE_NAME, {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    creatorId: {
      type: Sequelize.UUID,
      field: 'creator_id',
      references: { model: 'user', key: 'id' },
      allowNull: false
    },
    start: {
      type: Sequelize.DATE,
      field: 'start',
      allowNull: false
    },
    userLimit: {
      type: Sequelize.INTEGER,
      field: 'user_limit',
      allowNull: true
    },
    createdAt: {
      type: Sequelize.DATE,
      field: 'created_at',
      allowNull: false
    },
    updatedAt: {
      type: Sequelize.DATE,
      field: 'updated_at',
      allowNull: false
    },
    deletedAt: {
      type: Sequelize.DATE,
      field: 'deleted_at'
    }
  }),
  down: queryInterface => queryInterface.dropTable(TABLE_NAME)
};
