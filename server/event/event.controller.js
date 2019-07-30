'use strict';

const { Event } = require('../common/database');
const { getEvents, separateAndCreateJobs } = require('../common/util/jobs');

// TODO: move this to Middleware
function isLoggedIn(req, res) {
  if (req.session.userId) return res.jsend.success(true);
  return res.jsend.success(false);
}

function fetchEvents(req, res) {
  const { query, app } = req;
  return getEvents({ query, app }).then(events => res.jsend.success(events));
}

function createEvent(req, res) {
  const event = req.body;
  event.creatorId = req.session.userId;
  return Event.create(event)
    .then(event => {
      req.app.get('socketio').emit('created');
      separateAndCreateJobs({ event, app: req.app });
      return res.jsend.success(event);
    });
}

function attendEvent(req, res) {
  const event = req.event;
  const userId = req.session.userId;
  return event.addAttendees(userId)
    .then(result => res.jsend.success(result));
}

module.exports = {
  isLoggedIn,
  fetchEvents,
  createEvent,
  attendEvent
};
