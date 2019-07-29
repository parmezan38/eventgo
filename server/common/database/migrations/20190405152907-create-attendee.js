'use strict';

const TABLE_NAME = 'attendee';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable(TABLE_NAME, {
    userId: {
      type: Sequelize.UUID,
      primaryKey: true,
      field: 'user_id',
      references: { model: 'user', key: 'id' },
      onUpdate: 'cascade',
      onDelete: 'cascade'
    },
    eventId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      field: 'event_id',
      references: { model: 'event', key: 'id' },
      onUpdate: 'cascade',
      onDelete: 'cascade'
    }
  }),
  down: queryInterface => queryInterface.dropTable(TABLE_NAME)
};
