import { extractData } from '@/common/api/helpers';
import path from 'path';
import request from '@/common/api/request';

const url = {
  root: '/events',
  attend: '/events/attend'
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
  return request.post(url.root, payload);
}

function attendEvent({ id }) {
  return request.post(path.join(url.attend, `${id}`));
}

export default {
  isLoggedIn,
  login,
  fetchEvents,
  createEvent,
  attendEvent
};
