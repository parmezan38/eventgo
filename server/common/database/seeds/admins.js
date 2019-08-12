'use strict';

const { auth: config = {} } = require('../../../config');
const bcrypt = require('bcrypt');
const faker = require('faker');
const Promise = require('bluebird');
const times = require('lodash/times');

const now = new Date();
const admins = [{
  first_name: 'Admin',
  last_name: 'Example',
  email: 'admin@example.org',
  password: 'admin123',
  created_at: now,
  updated_at: now
}];

times(15, () => admins.push(createAdmin()));

module.exports = {
  up: queryInterface => {
    return Promise.map(admins, admin => encryptPassword(admin))
      .then(admins => queryInterface.bulkInsert('admin', admins));
  },
  down: queryInterface => queryInterface.bulkDelete('admin', null)
};

function encryptPassword(admin) {
  return bcrypt.hash(admin.password, config.saltRounds)
    .then(password => (admin.password = password))
    .then(() => admin);
}

function createAdmin(password = 'pass123') {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const email = faker.internet.email(firstName, lastName);
  return {
    first_name: firstName,
    last_name: lastName,
    email,
    password,
    created_at: now,
    updated_at: now
  };
}
