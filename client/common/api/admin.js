import request from './request';

const url = {
  login: '/admins/login',
  forgotPassword: '/admins/forgotPassword',
  resetPassword: '/admins/resetPassword'
};

function login(credentials) {
  return request.post(url.login, credentials)
    .then(res => res.data.data)
    .then(({ token, admin }) => {
      window.localStorage.setItem('LMS_TOKEN', token);
      return admin;
    });
}

function logout() {
  window.localStorage.removeItem('LMS_TOKEN');
  // TODO: Add server side invalidation
  return Promise.resolve(true);
}

function forgotPassword(email) {
  return request.post(url.forgotPassword, { email });
}

function resetPassword(body) {
  return request.post(url.resetPassword, body);
}

export default {
  login,
  logout,
  forgotPassword,
  resetPassword
};
