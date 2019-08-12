'use strict';

const { createError } = require('../common/errors');
const { Sequelize, sequelize, Admin } = require('../common/database');
const Datasheet = require('./datasheet');
const HttpStatus = require('http-status');
const mime = require('mime');
const map = require('lodash/map');
const pick = require('lodash/pick');

const { Op } = Sequelize;

const columns = {
  email: { header: 'Email', width: 30 },
  firstName: { header: 'First Name', width: 30 },
  lastName: { header: 'Last Name', width: 30 },
  message: { header: 'Error', width: 30 }
};
const inputAttrs = ['email', 'firstName', 'lastName'];

const createFilter = q => map(['email', 'firstName', 'lastName'],
  it => ({ [it]: { [Op.iLike]: `%${q}%` } }));

function list({ query: { email, filter }, options }, res) {
  const where = { [Op.and]: [] };
  if (filter) where[Op.or] = createFilter(filter);
  if (email) where[Op.and].push({ email });
  return Admin.findAndCountAll({ where, ...options }).then(({ rows, count }) => {
    return res.jsend.success({ items: map(rows, 'profile'), total: count });
  });
}

function create(req, res) {
  const { body, origin } = req;
  return Admin.restoreOrBuild(pick(body, inputAttrs))
    .then(([result]) => {
      if (result.isRejected()) return createError(HttpStatus.CONFLICT);
      return Admin.invite(result.value(), { origin });
    })
    .then(admin => res.jsend.success(admin.profile));
}

function patch({ params, body }, res) {
  return Admin.findByPk(params.id, { paranoid: false })
    .then(admin => admin || createError(HttpStatus.NOT_FOUND, 'Admin does not exist!'))
    .then(admin => admin.update(pick(body, inputAttrs)))
    .then(admin => res.jsend.success(admin.profile));
}

function destroy({ params }, res) {
  sequelize.transaction(async transaction => {
    const admin = await Admin.findByPk(params.id, { transaction });
    if (!admin) createError(HttpStatus.NOT_FOUND);
    await admin.destroy({ transaction });
    res.end();
  });
}

function login({ admin }, res) {
  const token = admin.createToken({ expiresIn: '5 days' });
  const data = { token, admin: admin.profile };
  res.json({ data });
}

function invite({ params, origin }, res) {
  return Admin.findByPk(params.id, { paranoid: false })
    .then(admin => admin || createError(HttpStatus.NOT_FOUND, 'Admin does not exist!'))
    .then(admin => Admin.invite(admin, { origin }))
    .then(() => res.status(HttpStatus.ACCEPTED).end());
}

function forgotPassword({ origin, body }, res) {
  const { email } = body;
  return Admin.findOne({ where: { email } })
    .then(admin => admin || createError(HttpStatus.NOT_FOUND, 'Admin not found!'))
    .then(admin => admin.sendResetToken({ origin }))
    .then(() => res.end());
}

function resetPassword({ body, params }, res) {
  const { password, token } = body;
  return Admin.findOne({ where: { token } })
    .then(admin => admin || createError(HttpStatus.NOT_FOUND, 'Invalid token!'))
    .then(admin => {
      admin.password = password;
      return admin.save();
    })
    .then(() => res.end());
}

async function bulkImport({ body, file, origin }, res) {
  const admins = (await Datasheet.load(file)).toJSON({ include: inputAttrs });
  const errors = await Admin.import(admins, { origin: origin });
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
