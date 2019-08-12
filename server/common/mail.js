'use strict';

const { email: config } = require('../config');
const { parse: parseUrl } = require('url');
const { promisify } = require('util');
const email = require('emailjs');
const logger = require('./logger')('mailer');
const pick = require('lodash/pick');

const from = `${config.sender.name} <${config.sender.address}>`;
const server = email.server.connect(config);
logger.info(getConfig(server), '📧  SMTP client created');

const send = promisify(server.send.bind(server));

const resetUrl = (origin, admin) => `${origin}/#/auth/reset-password/${admin.token}`;

module.exports = {
  send,
  invite,
  resetPassword
};

function invite(admin, { origin }) {
  const href = resetUrl(origin, admin);
  const { hostname } = parseUrl(href);
  const recipient = admin.email;
  const message = `
    An account has been created for you on ${hostname}.
    Please click <a href="${href}">here</a> to complete your registration.`;

  logger.info({ recipient, sender: from }, '📧  Sending invite email to:', recipient);
  return send({
    from,
    to: recipient,
    subject: 'Invite',
    attachment: [{ data: `<html>${message}</html>`, alternative: true }]
  });
}

function resetPassword(admin, { origin }) {
  const href = resetUrl(origin, admin);
  const recipient = admin.email;
  const message = `
    You requested password reset.
    Please click <a href="${href}">here</a> to complete the reset process.`;

  logger.info({ recipient, sender: from }, '📧  Sending reset password email to:', recipient);
  return send({
    from,
    to: recipient,
    subject: 'Reset password',
    attachment: [{ data: `<html>${message}</html>`, alternative: true }]
  });
}

function getConfig(server) {
  // NOTE: List public keys: https://git.io/fxV4j
  return pick(server.smtp, [
    'host', 'port', 'domain',
    'authentication', 'ssl', 'tls',
    'timeout'
  ]);
}
