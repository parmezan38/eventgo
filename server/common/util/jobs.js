'use strict';

const { encryptionKey } = require('../../config.js');
const { decrypt } = require('./encryption.js');
const schedule = require('node-schedule');
const subMinutes = require('date-fns/sub_minutes');

const jobs = schedule.scheduledJobs;
const minutes = [10, 5, 0];

const generateName = ({ id, min }) => `${id}_${min}`;

function createJobs({ event, app }) {
  minutes.forEach(min => { createJob({ event, app, min }); });
}

function createJob({ event, app, min }) {
  const time = subMinutes(event.start, min);
  const name = generateName({ id: event.id, min });
  schedule.scheduleJob(name, time, () => jobContent({ event, app, min }));
}

function jobContent({ event, app, min }) {
  const payload = createPayload({ name: event.name, min });
  return event.getAttendees()
    .then(attendees => {
      attendees.forEach(it => {
        const subscription = decrypt(it.subscription, encryptionKey);
        app.get('webPush').sendNotification(subscription, payload);
      });
    });
}

function createPayload({ name, min }) {
  return JSON.stringify({
    title: `${name} starts ${min === 0 ? 'now' : 'soon'}!`,
    body: min === 0 ? `${name} started!` : `${name} starts in ${min} minutes`
  });
}

function deleteJobs(event) {
  minutes.forEach(it => {
    const job = jobs[generateName({ id: event.id, min: it })];
    if (job) job.cancel();
  });
}

module.exports = { createJobs, deleteJobs };
