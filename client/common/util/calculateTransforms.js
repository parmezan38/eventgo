'use strict';

const differenceInMinutes = require('date-fns/difference_in_minutes');

const calculateTop = val => ((val * 38) + 126 + 'px');
const calculateX = ({ start, end, timeline }) => {
  const time = differenceInMinutes(start, end);
  const endOffset = differenceInMinutes(timeline.end, timeline.start);
  return (time / (endOffset / 100)) + '%';
};

module.exports = { calculateTop, calculateX };
