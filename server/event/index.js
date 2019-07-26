'use strict';

const { createError } = require('../common/errors');
const { Event } = require('../common/database');
const ctrl = require('./event.controller');
const HttpStatus = require('http-status');
const router = require('express').Router();

const { NOT_FOUND } = HttpStatus;

router
  // TODO: move this to User
  .post('/login', ctrl.login)
  .get('/', ctrl.fetchEvents)
  .post('/', ctrl.createEvent)
  .post('/attend/:id', ctrl.attendEvent);

router.param('id', (req, res, next, id) => {
  return Event.findById(id, { paranoid: false })
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
