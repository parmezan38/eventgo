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

function fetch({ params } = {}) {
  return request.get(url.root, { params }).then(extractData);
}

function create(payload) {
  return request.post(url.root, payload).then(extractData);
}

function destroy({ id }) {
  return request.delete(path.join(url.root, `${id}`)).then(extractData);
}

function attend({ id }) {
  return request.post(path.join(url.attend, `${id}`)).then(extractData);
}

function unattend({ id }) {
  return request.delete(path.join(url.attend, `${id}`)).then(extractData);
}

export default {
  isLoggedIn,
  fetch,
  create,
  destroy,
  attend,
  unattend
};
