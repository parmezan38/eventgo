'use strict';

// const { promisify } = require('util');
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
// const runServer = promisify(app.listen.bind(app));
const socket = require('./common/socket');

const address = `http://${ip}:${port}`;

database.initialize()
  .then(() => app.listen(port, ip))
  .then(server => socket(server))
  // .then(() => {
  //   console.log(PushSubscription);
  // })
  .then(io => app.set('socketio', io))
  .then(() => logger.info({ port, ip }, '✈️  Server listening on', address))
  .catch(err => {
    logger.fatal(err, '🚨  Starting server failed');
    process.exit(1);
  });
