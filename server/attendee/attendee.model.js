'use strict';

const { Model } = require('sequelize');

class Attendee extends Model {
  static fields(DataTypes) {
    return {
      userId: {
        type: DataTypes.INTEGER,
        field: 'user_id',
        primaryKey: true,
        unique: 'attendee_pk'
      },
      eventId: {
        type: DataTypes.INTEGER,
        field: 'event_id',
        primaryKey: true,
        unique: 'attendee_pk'
      }
    };
  }

  static associate({ Event, User }) {
    this.belongsTo(User, {
      foreignKey: { name: 'userId', field: 'user_id' }
    });
    this.belongsTo(Event, {
      foreignKey: { name: 'eventId', field: 'event_id' }
    });
  }

  static options() {
    return {
      modelName: 'attendee',
      tableName: 'attendee',
      timestamps: false,
      freezeTableName: true
    };
  }
}

module.exports = Attendee;
