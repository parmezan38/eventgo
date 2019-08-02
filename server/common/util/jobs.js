
const { encryptionKey } = require('../../config.js');
const { decrypt } = require('./encryption.js');
const schedule = require('node-schedule');
const subMinutes = require('date-fns/sub_minutes');

function separateAndCreateJobs({ event, app }) {
  const minutes = [10, 5, 0];
  minutes.forEach(min => { createJobs({ event, app, min }); });
}

function createJobs({ event, app, min }) {
  const { start, name } = event;
  schedule.scheduleJob(subMinutes(start, min), () => {
    const payload = createPayload({ name, min });
    return event.getAttendees()
      .then(attendees => {
        attendees.forEach(it => {
          const subscription = decrypt(it.subscription, encryptionKey);
          app.get('webPush').sendNotification(subscription, payload);
        });
      });
  });
}

function createPayload({ name, min }) {
  return JSON.stringify({
    title: `${name} starts ${min === 0 ? 'now' : 'soon'}!`,
    body: min === 0 ? `${name} started!` : `${name} starts in ${min} minutes`
  });
}

module.exports = {
  separateAndCreateJobs
};
