import { extractData } from '@/common/api/helpers';
import request from '@/common/api/request';

const url = {
  root: '/users'
};

function create(body) {
  return request.post(url.root, body).then(extractData);
}

export default {
  create
};
