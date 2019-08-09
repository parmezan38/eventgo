'use strict';

const { Model, Op } = require('sequelize');
const addHours = require('date-fns/add_hours');
const { createJobs, deleteJobs } = require('../common/util/jobs');
const createFilter = require('../common/util/createFilter');
const endOfDay = require('date-fns/end_of_day');
const Promise = require('bluebird');
const subHours = require('date-fns/sub_hours');
const startOfDay = require('date-fns/start_of_day');
const subMinutes = require('date-fns/sub_minutes');

class Event extends Model {
  static fields(DataTypes) {
    return {
      name: {
        type: DataTypes.STRING,
        field: 'name',
        validate: { notEmpty: true, len: [2, 50] }
      },
      creatorId: {
        type: DataTypes.UUID,
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

  static hooks() {
    return {
      afterCreate: (event, { app }) => createJobs({ event, app }),
      afterDestroy: event => deleteJobs(event)
    };
  }

  static getEvents({ jobs, app, query = {} }) {
    const today = new Date();
    const { time, filter } = query;
    const where = { start: { [Op.between]: [startOfDay(today), endOfDay(today)] } };
    if (time && filter) {
      where[Op.or] = [
        { start: { [Op.between]: [subHours(time, 1), addHours(time, 1)] } },
        ...createFilter(filter, ['name'])
      ];
    } else if (!time && filter) {
      where[Op.or] = createFilter(filter, ['name']);
    } else if (time && !filter) {
      where.start = { [Op.between]: [subHours(time, 1), addHours(time, 1)] };
    }
    if (jobs) {
      where.start = { [Op.between]: [subMinutes(today, 11), endOfDay(today)] };
    }
    const include = [{
      model: this.sequelize.models.user,
      as: 'attendees',
      attributes: ['id', 'subscription']
    }];
    return this.findAll({ where, include })
      .then(events => {
        if (jobs) {
          return Promise.map(events, event => createJobs({ event, app }));
        }
        return events;
      });
  }
}

module.exports = Event;
