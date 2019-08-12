'use strict';

const { auth: config = {} } = require('../config');
const { Model, Sequelize, Op, UniqueConstraintError } = require('sequelize');
const { sql } = require('../common/database/helpers');
const bcrypt = require('bcrypt');
const castArray = require('lodash/castArray');
const find = require('lodash/find');
const jwt = require('jsonwebtoken');
const logger = require('../common/logger')();
const mail = require('../common/mail');
const map = require('lodash/map');
const pick = require('lodash/pick');
const Promise = require('bluebird');

class Admin extends Model {
  static fields(DataTypes) {
    return {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isEmail: true, notEmpty: true },
        unique: { msg: 'This email address is already in use.' }
      },
      password: {
        type: DataTypes.STRING,
        validate: { notEmpty: true, len: [5, 255] }
      },
      token: {
        type: DataTypes.STRING,
        validate: { notEmpty: true, len: [10, 500] }
      },
      firstName: {
        type: DataTypes.STRING,
        field: 'first_name'
      },
      lastName: {
        type: DataTypes.STRING,
        field: 'last_name'
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at'
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at'
      },
      deletedAt: {
        type: DataTypes.DATE,
        field: 'deleted_at'
      },
      profile: {
        type: DataTypes.VIRTUAL,
        get() {
          return pick(this,
            ['id', 'firstName', 'lastName', 'email', 'createdAt']);
        }
      }
    };
  }

  static get text() {
    return sql.concat(
      Sequelize.col('email'),
      Sequelize.col('first_name'),
      Sequelize.col('last_name'),
      { separator: ' ' }
    );
  }

  static options() {
    return {
      modelName: 'admin',
      timestamps: true,
      paranoid: true,
      freezeTableName: true
    };
  }

  static hooks() {
    return {
      beforeCreate(admin) {
        return admin.encryptPassword();
      },
      beforeUpdate(admin) {
        return admin.changed('password')
          ? admin.encryptPassword()
          : Promise.resolve(admin);
      },
      beforeBulkCreate(admins) {
        return Promise.map(admins, admin => admin.encryptPassword());
      }
    };
  }

  static scopes() {
    return {
      searchByPattern(pattern) {
        const cond = { [Op.iLike]: `%${pattern}%` };
        const where = sql.where(this.text, cond, { scope: true });
        return { where };
      }
    };
  }

  static match(pattern) {
    if (!pattern) return Admin;
    return Admin.scope({ method: ['searchByPattern', pattern] });
  }

  static async invite(admin, options) {
    admin.token = admin.createToken({ expiresIn: '3 days' });
    mail.invite(admin, options).catch(err =>
      logger.error('Error: Sending invite email failed:', err.message));
    return admin.save({ paranoid: false });
  }

  static async import(admins, { concurrency = 16, ...options } = {}) {
    const errors = [];
    await this.restoreOrBuild(admins, { concurrency }).map((result, i) => {
      if (result.isFulfilled()) return this.invite(result.value(), options);
      const { message = 'Failed to import admin.' } = result.reason();
      errors.push({ ...admins[i], message });
    }, { concurrency });
    return errors.length && errors;
  }

  static async restoreOrBuild(admins, { concurrency = 16 } = {}) {
    admins = castArray(admins);
    const where = { email: map(admins, 'email') };
    const found = await Admin.findAll({ where, paranoid: false });
    return Promise.map(admins, adminData => Promise.try(() => {
      const admin = find(found, { email: adminData.email });
      if (admin && !admin.deletedAt) {
        const message = this.rawAttributes.email.unique.msg;
        throw new UniqueConstraintError({ message });
      }
      if (admin) {
        admin.setDataValue('deleteAt', null);
        return admin;
      }
      return this.build(adminData);
    }).reflect(), { concurrency });
  }

  async encryptPassword() {
    if (!this.password) return false;
    if (!this.changed('password')) return this;
    this.password = await bcrypt.hash(this.password, config.saltRounds);
    return this;
  }

  async authenticate(password) {
    if (!this.password) return false;
    const isValid = await bcrypt.compare(password, this.password);
    return isValid ? this : false;
  }

  sendResetToken(options) {
    this.token = this.createToken({ expiresIn: '5 days' });
    mail.resetPassword(this, options).catch(err =>
      logger.error('Error: Sending reset password email failed:', err.message));
    return this.save();
  }

  createToken(options = {}) {
    const payload = pick(this, ['id', 'email']);
    return jwt.sign(payload, config.secret, options);
  }
}

module.exports = Admin;
