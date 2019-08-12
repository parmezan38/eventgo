'use strict';

const { createError } = require('../errors');
const HttpStatus = require('http-status');

const { UNAUTHORIZED } = HttpStatus;

function authorize(...allowed) {
  return ({ admin }, res, next) => {
    if (!admin) return createError(UNAUTHORIZED, 'Access restricted');
    return next();
  };
}

module.exports = {
  authorize
};
