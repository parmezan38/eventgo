'use strict';

const { createError } = require('../common/errors');
const { Event } = require('../common/database');
const ctrl = require('./event.controller');
const HttpStatus = require('http-status');
const router = require('express').Router();

const { NOT_FOUND } = HttpStatus;

router
  // TODO: move this to User
  .get('/login', ctrl.isLoggedIn)
  .get('/', ctrl.fetchEvents)
  .post('/', ctrl.createEvent)
  .delete('/:id', ctrl.deleteEvent)
  .post('/attend/:id', ctrl.attendEvent)
  .delete('/withdraw/:id', ctrl.withdrawFromEvent);

router.param('id', (req, res, next, id) => {
  return Event.findByPk(id, { paranoid: false })
    .then(event => event || createError(NOT_FOUND, 'Not found!'))
    .then(event => {
      req.event = event;
      next();
    });
});

module.exports = {
  path: '/events',
  router
};
