import { extractData } from '@/common/api/helpers';
import request from '@/common/api/request';

const url = {
  root: '/users',
  login: '/users/login',
  resource: it => `/users/${it.id}`
};

function create(body) {
  return request.post(url.root, body).then(extractData);
}

function login(body) {
  return request.post(url.login, body).then(extractData);
}

function update(item) {
  return request.patch(url.resource(item), item).then(extractData);
}

export default {
  create,
  login,
  update
};
