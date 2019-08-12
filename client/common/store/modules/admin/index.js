import * as actions from './actions';
import * as mutations from './mutations';

const state = {
  admin: null
};

export default {
  namespaced: true,
  state,
  actions,
  mutations
};
