'use strict';

const { Model } = require('sequelize');

class Event extends Model {
  static fields(DataTypes) {
    return {
      name: {
        type: DataTypes.STRING,
        field: 'name',
        validate: { notEmpty: true, len: [2, 50] }
      },
      creatorId: {
        type: DataTypes.INTEGER,
        field: 'creator_id',
        allowNull: false
      },
      start: {
        type: DataTypes.DATE,
        field: 'start',
        allowNull: false
      },
      userLimit: {
        type: DataTypes.INTEGER,
        field: 'user_limit',
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
        allowNull: false
      },
      deletedAt: {
        type: DataTypes.DATE,
        field: 'deleted_at'
      }
    };
  }

  static associate({ Attendee, User }) {
    this.belongsTo(User, {
      as: 'creator',
      foreignKey: { name: 'creatorId', field: 'creator_id' }
    });
    this.belongsToMany(User, {
      as: 'attendees',
      through: Attendee,
      foreignKey: { name: 'eventId', field: 'event_id' },
      hooks: true,
      onDelete: 'cascade'
    });
  }

  static options() {
    return {
      modelName: 'event',
      tableName: 'event',
      timestamps: true,
      paranoid: true,
      freezeTableName: true
    };
  }
}

module.exports = Event;
