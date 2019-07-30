import { extractData } from '@/common/api/helpers';
import path from 'path';
import request from '@/common/api/request';

const url = {
  root: '/events',
  attend: '/events/attend',
  withdraw: '/events/withdraw'
};

function isLoggedIn() {
  return request.get('/events/login').then(extractData);
}

function login(body) {
  return request.post('/events/login', body).then(extractData);
}

function fetchEvents({ params } = {}) {
  return request.get(url.root, { params }).then(extractData);
}

function createEvent(payload) {
  return request.post(url.root, payload).then(extractData);
}

function deleteEvent({ id }) {
  return request.delete(path.join(url.root, `${id}`)).then(extractData);
}

function attendEvent({ id }) {
  return request.post(path.join(url.attend, `${id}`)).then(extractData);
}

function withdrawFromEvent({ id }) {
  return request.delete(path.join(url.withdraw, `${id}`)).then(extractData);
}

export default {
  isLoggedIn,
  login,
  fetchEvents,
  createEvent,
  deleteEvent,
  attendEvent,
  withdrawFromEvent
};
