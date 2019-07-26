'use strict';

const { auth: config = {} } = require('../../../config');
const { role } = require('../../../../common/config');
const bcrypt = require('bcrypt');
const faker = require('faker');
const Promise = require('bluebird');
const times = require('lodash/times');

const now = new Date();
const users = [{
  first_name: 'Admin',
  last_name: 'Example',
  email: 'admin@example.org',
  password: 'admin123',
  role: role.ADMIN,
  created_at: now,
  updated_at: now
}];

times(15, () => users.push(createUser(role.USER)));

module.exports = {
  up: queryInterface => {
    return Promise.map(users, user => encryptPassword(user))
      .then(users => queryInterface.bulkInsert('user', users));
  },
  down: queryInterface => queryInterface.bulkDelete('user', null)
};

function encryptPassword(user) {
  return bcrypt.hash(user.password, config.saltRounds)
    .then(password => (user.password = password))
    .then(() => user);
}

function createUser(role, password = 'pass123') {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const email = faker.internet.email(firstName, lastName);
  return {
    first_name: firstName,
    last_name: lastName,
    email,
    password,
    role,
    created_at: now,
    updated_at: now
  };
}
