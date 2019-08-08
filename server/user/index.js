'use strict';

// TODO: separate admin and user functionalities
// const auth = require('../common/auth').authenticate('jwt');
const ctrl = require('./user.controller');
const multer = require('multer');
const router = require('express').Router();

const upload = multer({ storage: multer.memoryStorage() });

router
  .post('/login', ctrl.login)
  .post('/forgotPassword', ctrl.forgotPassword)
  .post('/resetPassword', ctrl.resetPassword)
  .get('/', ctrl.list)
  .post('/', ctrl.create)
  .patch('/:id', ctrl.patch)
  .delete('/:id', ctrl.destroy)
  .post('/:id/invite', ctrl.invite)
  .post('/import', upload.single('file'), ctrl.bulkImport);

module.exports = {
  path: '/users',
  router
};
