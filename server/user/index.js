'use strict';

// TODO: separate admin and user functionalities
// const auth = require('../common/auth').authenticate('jwt');
const ctrl = require('./user.controller');
const router = require('express').Router();

router
  .post('/login', ctrl.login)
  .get('/', ctrl.list)
  .post('/', ctrl.create)
  .patch('/:id', ctrl.patch)
  .delete('/:id', ctrl.destroy);

module.exports = {
  path: '/users',
  router
};
