'use strict';

const bluebird = require('bluebird');
const sequelize = require('sequelize');

if (process.env.NODE_ENV !== 'production') {
  sequelize.Promise.config({ longStackTraces: true });
  bluebird.config({ longStackTraces: true });
}

const { ip, port } = require('./config');
const app = require('./app');
const database = require('./common/database');
const logger = require('./common/logger')();
const socket = require('./common/socket');

const address = `http://${ip}:${port}`;

database.initialize()
  .then(() => app.listen(port, ip))
  .then(server => socket(server))
  .then(io => app.set('socketio', io))
  .then(() => logger.info({ port, ip }, '✈️  Server listening on', address))
  .then(() => database.Event.getEvents({ jobs: true, app }))
  .catch(err => {
    logger.fatal(err, '🚨  Starting server failed');
    process.exit(1);
  });
