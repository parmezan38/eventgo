'use strict';

const { createError } = require('../common/errors');
const { Sequelize, sequelize, User } = require('../common/database');
const Datasheet = require('./datasheet');
const HttpStatus = require('http-status');
const mime = require('mime');
const map = require('lodash/map');
const pick = require('lodash/pick');
const uuidv1 = require('uuid/v1');

const { ACCEPTED, BAD_REQUEST, NOT_FOUND } = HttpStatus;
const { Op } = Sequelize;

const columns = {
  email: { header: 'Email', width: 30 },
  firstName: { header: 'First Name', width: 30 },
  lastName: { header: 'Last Name', width: 30 },
  role: { header: 'Role', width: 30 },
  message: { header: 'Error', width: 30 }
};
const inputAttrs = ['email', 'role', 'firstName', 'lastName'];

const createFilter = q => map(['email', 'firstName', 'lastName'],
  it => ({ [it]: { [Op.iLike]: `%${q}%` } }));

function list({ query: { email, role, filter }, options }, res) {
  const where = { [Op.and]: [] };
  if (filter) where[Op.or] = createFilter(filter);
  if (email) where[Op.and].push({ email });
  if (role) where[Op.and].push({ role });
  return User.findAndCountAll({ where, ...options }).then(({ rows, count }) => {
    return res.jsend.success({ items: map(rows, 'profile'), total: count });
  });
}

function create(req, res) {
  const user = {
    id: uuidv1(),
    name: req.body.name,
    subscription: req.body.subscription
  };
  req.session.userId = user.id;
  req.session.save();
  return User.create(user).then(user => res.jsend.success(user.id));
}

function patch({ params, body }, res) {
  return User.findById(params.id, { paranoid: false })
    .then(user => user || createError(NOT_FOUND, 'User does not exist!'))
    .then(user => user.update(pick(body, inputAttrs)))
    .then(user => res.jsend.success(user.profile));
}

function destroy({ params }, res) {
  sequelize.transaction(async transaction => {
    const user = await User.findById(params.id, { transaction });
    if (!user) createError(NOT_FOUND);
    await user.destroy({ transaction });
    res.end();
  });
}

function login({ body }, res) {
  const { email, password } = body;
  if (!email || !password) {
    return createError(BAD_REQUEST, 'Please enter email and password!');
  }

  return User.find({ where: { email } })
    .then(user => user || createError(NOT_FOUND, 'User does not exist!'))
    .then(user => user.authenticate(password))
    .then(user => user || createError(NOT_FOUND, 'Wrong password!'))
    .then(user => {
      const token = user.createToken({ expiresIn: '5 days' });
      res.jsend.success({ token, user: user.profile });
    });
}

function invite({ params, origin }, res) {
  return User.findById(params.id, { paranoid: false })
    .then(user => user || createError(NOT_FOUND, 'User does not exist!'))
    .then(user => User.invite(user, { origin }))
    .then(() => res.status(ACCEPTED).end());
}

function forgotPassword({ origin, body }, res) {
  const { email } = body;
  return User.find({ where: { email } })
    .then(user => user || createError(NOT_FOUND, 'User not found!'))
    .then(user => user.sendResetToken({ origin }))
    .then(() => res.end());
}

function resetPassword({ body, params }, res) {
  const { password, token } = body;
  return User.find({ where: { token } })
    .then(user => user || createError(NOT_FOUND, 'Invalid token!'))
    .then(user => {
      user.password = password;
      return user.save();
    })
    .then(() => res.end());
}

async function bulkImport({ body, file, origin }, res) {
  const users = (await Datasheet.load(file)).toJSON({ include: inputAttrs });
  const errors = await User.import(users, { origin: origin });
  if (!errors) return res.end();
  const creator = 'APP_STARTER';
  const format = body.format || mime.getExtension(file.mimetype);
  const report = (new Datasheet({ columns, data: errors })).toWorkbook({ creator });
  return report.send(res, { format });
}

module.exports = {
  list,
  bulkImport,
  create,
  patch,
  destroy,
  login,
  invite,
  forgotPassword,
  resetPassword
};
