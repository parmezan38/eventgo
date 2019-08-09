'use strict';

const { Event, User } = require('../common/database');

const include = [{
  model: User,
  as: 'attendees',
  attributes: ['id', 'subscription']
}];

function emitEvent({ req, event, type }) {
  const { id, name, creatorId, start, attendees } = event;
  req.app.get('socketio').emit(type, {
    event: { id, name, creatorId, start, attendees }
  });
}

function fetch(req, res) {
  const { query, app } = req;
  return Event.getEvents({ query, app })
    .then(events => {
      const filteredEvents = events.filter(it => {
        const { id, name, creatorId, start, attendees } = it;
        return { id, name, creatorId, start, attendees };
      });
      res.jsend.success(filteredEvents);
    });
}

function create(req, res) {
  const event = req.body;
  event.creatorId = req.session.userId;
  return Event.create(event, { app: req.app })
    .then(async event => {
      await event.setAttendees(req.session.userId);
      return event.reload({ include });
    })
    .then(event => {
      emitEvent({ req, event, type: 'create' });
      return res.jsend.success({ message: `Event ${event.name} created` });
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
    .then(() => event.reload({ include }))
    .then(event => {
      emitEvent({ req, event, type: 'update' });
      return res.jsend.success({ message: `Attending ${event.name}` });
    });
}

function unattend(req, res) {
  const event = req.event;
  return event.removeAttendees(req.session.userId)
    .then(() => event.reload({ include }))
    .then(event => {
      emitEvent({ req, event, type: 'update' });
      return res.jsend.success({ message: `Withdrawn from ${event.name}` });
    });
}

module.exports = {
  fetch,
  create,
  destroy,
  attend,
  unattend
};
