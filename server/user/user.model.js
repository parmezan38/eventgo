'use strict';

const { Model } = require('sequelize');

class User extends Model {
  static fields(DataTypes) {
    return {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        unique: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      subscription: {
        type: DataTypes.JSONB
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at'
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at'
      },
      deletedAt: {
        type: DataTypes.DATE,
        field: 'deleted_at'
      }
    };
  }

  static associate({ Attendee, Event }) {
    this.belongsToMany(Event, {
      as: 'attendingEvents',
      through: Attendee,
      foreignKey: { name: 'userId', field: 'user_id' },
      hooks: true,
      onDelete: 'cascade'
    });
  }

  static options() {
    return {
      modelName: 'user',
      timestamps: true,
      paranoid: true,
      freezeTableName: true
    };
  }
}

module.exports = User;
