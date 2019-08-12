export const login = (state, admin) => {
  state.admin = admin;
};

export const logout = state => {
  state.admin = null;
};
