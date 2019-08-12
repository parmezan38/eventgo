'use strict';

const { getValidator, setLogging } = require('../common/database/helpers');
const { prompt } = require('inquirer');
const { Admin } = require('../common/database');
const isEmail = require('is-email-like');

setLogging(Admin, false);

const questions = [{
  type: 'input',
  name: 'email',
  message: 'Enter email:',
  validate: isEmail
}, {
  type: 'password',
  mask: '*',
  name: 'password',
  message: 'Enter password:',
  validate: getValidator(Admin, 'password')
}, {
  type: 'string',
  name: 'firstName',
  message: 'Enter first name:',
  validate: getValidator(Admin, 'firstName')
}, {
  type: 'string',
  name: 'lastName',
  message: 'Enter last name:',
  validate: getValidator(Admin, 'lastName')
}];

prompt(questions)
  .then(data => console.log() || Admin.create(data))
  .then(admin => console.log(`Admin created: ${admin.email}`))
  .catch(err => console.error(err.message) || 1)
  .then((code = 0) => process.exit(code));
