const { Event, User } = require('../database');
const { Op } = require('sequelize');
const addHours = require('date-fns/add_hours');
const endOfDay = require('date-fns/end_of_day');
const Promise = require('bluebird');
const { separateAndCreateJobs } = require('./jobs');
const subHours = require('date-fns/sub_hours');
const startOfDay = require('date-fns/start_of_day');
const subMinutes = require('date-fns/sub_minutes');

module.exports = ({ createJobs, app, query }) => {
  const today = new Date();
  const where = { start: { [Op.between]: [startOfDay(today), endOfDay(today)] } };
  if (query && 'time' in query) {
    where.start = {
      [Op.between]: [subHours(query.time, 1), addHours(query.time, 1)]
    };
  }
  if (createJobs) {
    where.start = {
      [Op.between]: [subMinutes(today, 11), endOfDay(today)]
    };
  }
  const include = [{
    model: User,
    as: 'attendees',
    attributes: ['id', 'subscription']
  }];
  return Event.findAll({ where, include })
    .then(events => {
      if (createJobs) {
        return Promise.map(events, event => separateAndCreateJobs({ event, app }));
      }
      return events;
    });
};
