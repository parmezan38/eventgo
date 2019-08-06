'use strict';

const differenceInMinutes = require('date-fns/difference_in_minutes');

const calculateTop = val => ((val * 38) + 68 + 'px');
const calculateX = data => {
  const { start, end, timelineStart, timelineEnd } = data;
  const time = differenceInMinutes(start, end);
  const endOffset = differenceInMinutes(timelineEnd, timelineStart);
  return (time / (endOffset / 100)) + '%';
};

module.exports = { calculateTop, calculateX };
