'use strict';

const { createError } = require('../common/errors');
const { Sequelize, sequelize, User } = require('../common/database');
const { encryptionKey } = require('../config');
const { encrypt } = require('../common/util/encryption.js');
const HttpStatus = require('http-status');
const map = require('lodash/map');
const pick = require('lodash/pick');
const uuidv1 = require('uuid/v1');

const { NOT_FOUND } = HttpStatus;
const { Op } = Sequelize;

const inputAttrs = ['name', 'subscription'];

const createFilter = q => map(['email', 'firstName', 'lastName'],
  it => ({ [it]: { [Op.iLike]: `%${q}%` } }));

function list({ query: { email, filter }, options }, res) {
  const where = { [Op.and]: [] };
  if (filter) where[Op.or] = createFilter(filter);
  if (email) where[Op.and].push({ email });
  return User.findAndCountAll({ where, ...options }).then(({ rows, count }) => {
    return res.jsend.success({ items: map(rows, 'profile'), total: count });
  });
}

function create(req, res) {
  const subscription = encrypt(req.body.subscription, encryptionKey);
  const user = { id: uuidv1(), name: req.body.name, subscription };
  req.session.userId = user.id;
  req.session.save();
  return User.create(user).then(user => res.jsend.success(user.id));
}

function patch({ params, body }, res) {
  if ('subscription' in body) {
    body.subscription = encrypt(body.subscription, encryptionKey);
  }
  return User.findById(params.id, { paranoid: false })
    .then(user => user || createError(NOT_FOUND, 'User does not exist!'))
    .then(user => user.update(pick(body, inputAttrs)))
    .then(user => res.jsend.success(user));
}

function destroy({ params }, res) {
  sequelize.transaction(async transaction => {
    const user = await User.findById(params.id, { transaction });
    if (!user) createError(NOT_FOUND);
    await user.destroy({ transaction });
    res.end();
  });
}

function login(req, res) {
  return res.jsend.success(req.session.userId || false);
}

module.exports = {
  list,
  create,
  patch,
  destroy,
  login
};
