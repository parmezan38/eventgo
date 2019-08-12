const clone = require('lodash/cloneDeep');
const get = require('lodash/get');
const set = require('lodash/set');

export const auth = ({ actions, path, key, storage }) => store => {
  key = key || 'USER';
  storage = window.localStorage;
  path = path || 'auth.admin';
  const { login, logout } = Object.assign({
    login: 'admin/login',
    logout: 'admin/logout'
  }, actions);

  // Hydrate state using specified storage/key.
  const data = JSON.parse(storage.getItem(key));
  const initialState = set(clone(store.state), path, data);
  store.replaceState(initialState);
  // Subscribe to login mutation.
  store.subscribe(({ type }, state) => {
    if (type !== login) return;
    const data = JSON.stringify(get(state, path));
    storage.setItem(key, data);
  });
  // Subscribe to logout action.
  store.subscribeAction(({ type }) => {
    if (type !== logout) return;
    storage.removeItem(key);
    window.location.replace(window.location.origin);
  });
};
