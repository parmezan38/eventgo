'use strict';

const { Event, User } = require('../common/database');
const { getEvents, separateAndCreateJobs } = require('../common/util/jobs');

const userInclude = [{
  model: User,
  as: 'attendees',
  attributes: ['id', 'subscription']
}];

function emitEvent({ req, event, type }) {
  const { id, name, start } = event;
  const attendees = event.attendees || [];
  req.app.get('socketio').emit(type, { event: { id, name, start, attendees } });
}

// TODO: move this to Middleware
function isLoggedIn(req, res) {
  if (req.session.userId) return res.jsend.success(true);
  return res.jsend.success(false);
}

function fetch(req, res) {
  const { query, app } = req;
  return getEvents({ query, app })
    .then(events => {
      const filteredEvents = events.filter(it => {
        const { id, name, start, attendees } = it;
        return { id, name, start, attendees };
      });
      res.jsend.success(filteredEvents);
    });
}

function create(req, res) {
  const event = req.body;
  event.creatorId = req.session.userId;
  return Event.create(event)
    .then(async event => {
      await event.setAttendees(req.session.userId);
      return event.reload({ include: userInclude });
    })
    .then(event => {
      separateAndCreateJobs({ event, app: req.app });
      emitEvent({ req, event, type: 'created' });
      return res.jsend.success({ message: 'Event created' });
    });
}

function destroy(req, res) {
  const event = req.event;
  if (req.session.userId !== req.event.creatorId) return;
  return event.destroy()
    .then(() => {
      emitEvent({ req, event, type: 'delete' });
      return res.jsend.success({ message: `${event.name} deleted!` });
    });
}

function attend(req, res) {
  const event = req.event;
  const userId = req.session.userId;
  return event.addAttendees(userId)
    .then(() => event.reload({ include: userInclude }))
    .then(event => {
      emitEvent({ req, event, type: 'update' });
      return res.jsend.success({ message: `Attending ${event.name}` });
    });
}

function unattend(req, res) {
  const event = req.event;
  return event.removeAttendees(req.session.userId)
    .then(() => event.reload({ include: userInclude }))
    .then(event => {
      emitEvent({ req, event, type: 'update' });
      return res.jsend.success({ message: `Withdrawn from ${event.name}` });
    });
}

module.exports = {
  isLoggedIn,
  fetch,
  create,
  destroy,
  attend,
  unattend
};
