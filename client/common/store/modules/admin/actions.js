import admin from '@/common/api/admin';

export const login = ({ commit }, credentials) => {
  return admin.login(credentials)
    .then(admin => commit('login', admin) || admin);
};

export const logout = () => admin.logout();

export const forgotPassword = (context, { email }) => admin.forgotPassword(email);

export const resetPassword = (context, payload) => admin.resetPassword(payload);
