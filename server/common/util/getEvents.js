const { Event, User } = require('../database');
const { Op } = require('sequelize');
const addHours = require('date-fns/add_hours');
const endOfDay = require('date-fns/end_of_day');
const map = require('lodash/map');
const Promise = require('bluebird');
const { separateAndCreateJobs } = require('./jobs');
const subHours = require('date-fns/sub_hours');
const startOfDay = require('date-fns/start_of_day');
const subMinutes = require('date-fns/sub_minutes');

const createFilter = (q, l) => map(l, it => ({ [it]: { [Op.iLike]: `%${q}%` } }));

module.exports = ({ createJobs, app, query = {} }) => {
  const today = new Date();
  const { time, filter } = query;
  const where = { start: { [Op.between]: [startOfDay(today), endOfDay(today)] } };
  if (time) where.start = { [Op.between]: [subHours(time, 1), addHours(time, 1)] };
  if (filter) where[Op.or] = createFilter(filter, ['name']);
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
