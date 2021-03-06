'use strict';

const { createError } = require('../common/errors');
const { Event } = require('../common/database');
const ctrl = require('./event.controller');
const HttpStatus = require('http-status');
const router = require('express').Router();

const { FORBIDDEN, NOT_FOUND } = HttpStatus;

router
  .use(auth)
  .get('/', ctrl.fetch)
  .post('/', ctrl.create)
  .delete('/:id', ctrl.destroy)
  .post('/attend/:id', ctrl.attend)
  .delete('/attend/:id', ctrl.unattend);

router.param('id', (req, res, next, id) => {
  return Event.findByPk(id, { paranoid: false })
    .then(event => event || createError(NOT_FOUND, 'Not found!'))
    .then(event => {
      req.event = event;
      next();
    });
});

function auth(req, res, next) {
  if (req.session.userId) return next();
  return createError(FORBIDDEN, 'Access denied');
}

module.exports = {
  path: '/events',
  router
};
