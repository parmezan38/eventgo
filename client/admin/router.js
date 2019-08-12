import get from 'lodash/get';
import NotFound from '@/admin/components/common/NotFound';
import Router from 'vue-router';
import store from './store';
import Users from '@/admin/components/users';
import Vue from 'vue';

Vue.use(Router);

// Handle 404
const fallbackRoute = { path: '*', component: NotFound };

const router = new Router({
  routes: [{
    path: '/',
    name: 'users',
    component: Users,
    meta: { auth: true }
  }, fallbackRoute]
});

router.beforeEach((to, from, next) => {
  const admin = get(store.state, 'auth.admin');
  const isNotAuthenticated = to.matched.some(it => it.meta.auth) && !admin;
  if (isNotAuthenticated) return loadMainSpa();
  next();
});

const loadMainSpa = () => window.location.replace(window.location.origin);

export default router;
