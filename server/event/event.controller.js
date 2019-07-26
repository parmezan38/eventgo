'use strict';

const { Event, User } = require('../common/database');
const { Op } = require('sequelize');
const addHours = require('date-fns/add_hours');
const endOfDay = require('date-fns/end_of_day');
const schedule = require('node-schedule');
const subHours = require('date-fns/sub_hours');
const subMinutes = require('date-fns/sub_minutes');
const startOfDay = require('date-fns/start_of_day');

// TODO: move this to User
function login(req, res) {
  req.session.subscription = req.body;
  req.session.save();
  const payload = JSON.stringify({ title: 'Radi prvi put' });
  // Web Push Test
  req.app.get('webPush').sendNotification(req.body, payload);
  return res.status(201).json({});
}

function fetchEvents(req, res) {
  const query = req.query;
  const today = new Date();
  const where = { start: { [Op.between]: [startOfDay(today), endOfDay(today)] } };
  const include = [{
    model: User,
    as: 'attendees',
    attributes: ['firstName', 'lastName']
  }];
  if ('time' in query) {
    where.start = {
      [Op.between]: [subHours(query.time, 1), addHours(query.time, 1)]
    };
  }
  return Event.findAll({ where, include })
    .then(result => res.jsend.success(result));
}

function createEvent(req, res) {
  const { user, body } = req;
  const event = body;
  event.creatorId = user.id;
  return Event.create(event)
    .then(event => {
      req.app.get('socketio').emit('created');
      separateEventJobs(req);
      return res.jsend.success(event);
    });
}

function attendEvent(req, res) {
  const { event, user } = req;
  const attendee = user.id;
  return event.addAttendees(attendee)
    .then(result => res.jsend.success(result));
}

function separateEventJobs(req) {
  const minutes = [10, 5, 0];
  minutes.forEach(min => { createNotificationJobs({ req, min }); });
}

function createNotificationJobs({ req, min }) {
  const { start, name } = req.body;
  schedule.scheduleJob(subMinutes(start, min), () => {
    const payload = createPayload({ name, min });
    req.app.get('webPush').sendNotification(req.session.subscription, payload);
  });
}

function createPayload({ name, min }) {
  return JSON.stringify({
    title: `${name} starts ${min === 0 ? 'now' : 'soon'}!`,
    body: min === 0 ? `${name} started!` : `${name} starts in ${min} minutes`
  });
}

module.exports = {
  login,
  fetchEvents,
  createEvent,
  attendEvent
};
