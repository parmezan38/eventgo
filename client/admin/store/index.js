import admin from '@/common/store/modules/admin';
import { auth as authPlugin } from './plugins';
import Vue from 'vue';
import Vuex from 'vuex';

const isProduction = process.env.NODE_ENV === 'production';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    admin
  },
  plugins: [authPlugin({ key: 'APP_USER' })],
  strict: !isProduction
});
