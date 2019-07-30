const { Event, User } = require('../database');
const { Op } = require('sequelize');
const addHours = require('date-fns/add_hours');
const endOfDay = require('date-fns/end_of_day');
const Promise = require('bluebird');
const subHours = require('date-fns/sub_hours');
const startOfDay = require('date-fns/start_of_day');
const schedule = require('node-schedule');
const subMinutes = require('date-fns/sub_minutes');

function getEvents({ createJobs, app, query }) {
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
}

function separateAndCreateJobs({ event, app }) {
  const minutes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
  minutes.forEach(min => { createJobs({ event, app, min }); });
}

function createJobs({ event, app, min }) {
  const { start, name } = event;
  schedule.scheduleJob(subMinutes(start, min), () => {
    const payload = createPayload({ name, min });
    return event.getAttendees()
      .then(attendees => {
        attendees.forEach(it => {
          app.get('webPush').sendNotification(it.subscription, payload);
        });
      });
  });
}

function createPayload({ name, min }) {
  return JSON.stringify({
    title: `${name} starts ${min === 0 ? 'now' : 'soon'}!`,
    body: min === 0 ? `${name} started!` : `${name} starts in ${min} minutes`
  });
}

module.exports = {
  getEvents,
  separateAndCreateJobs
};
