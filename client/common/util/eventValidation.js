'use strict';

const replace = require('lodash/replace');
const split = require('lodash/split');

const DEFAULT_MESSAGE = '# name of event, @ start time. e.g. #event@13';

function extractValues(event) {
  const splitByTimeSeparator = split(event, '@');
  const name = replace(splitByTimeSeparator[0], '#', '');
  const time = split(splitByTimeSeparator[1], ':');
  const hours = parseInt(time[0]);
  const minutes = time[1] ? parseInt(time[1]) : 0;
  return { name, hours, minutes };
}

function validateFormat(event) {
  if (!event) return { text: DEFAULT_MESSAGE, error: false };
  if (event.indexOf('#') < 0) {
    return {
      text: 'Please use "#" and type a name of the event (#name)',
      error: true
    };
  }
  if (event.indexOf('@') < 0) {
    return {
      text: 'Please use "@" and type the start time (#name@12)',
      error: true
    };
  }
}

function validateValues({ name, hours, minutes }) {
  if (typeof hours !== 'number' || isNaN(hours)) {
    return { text: 'Time must be a valid number', error: true };
  }
  if (typeof minutes !== 'number' || isNaN(minutes)) {
    return { text: 'Time must be a valid number', error: true };
  }
}

module.exports = {
  DEFAULT_MESSAGE,
  extractValues,
  validateFormat,
  validateValues
};
