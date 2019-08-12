import auth from '@/common/api/auth';

export const login = ({ commit }, credentials) => {
  return auth.login(credentials)
    .then(user => commit('login', user) || user);
};

export const logout = () => auth.logout();

export const forgotPassword = (context, { email }) => auth.forgotPassword(email);

export const resetPassword = (context, payload) => auth.resetPassword(payload);
