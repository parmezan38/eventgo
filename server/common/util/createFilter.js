'use strict';

const map = require('lodash/map');
const { Op } = require('sequelize');

module.exports = (q, l) => map(l, it => ({ [it]: { [Op.iLike]: `%${q}%` } }));
