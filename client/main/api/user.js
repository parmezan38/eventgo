import { extractData } from '@/common/api/helpers';
import request from '@/common/api/request';

const url = {
  root: '/users',
  login: '/users/login'
};

function create(body) {
  return request.post(url.root, body).then(extractData);
}

function login(body) {
  return request.post(url.login, body).then(extractData);
}

export default {
  create,
  login
};
