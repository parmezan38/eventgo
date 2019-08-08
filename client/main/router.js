import {
  createServiceWorker,
  serviceWorkerExists
} from '@/common/util/serviceWorker';
import api from '@/main/api/user';
import Events from '@/main/components/event';
import Index from '@/main/components';
import NewUser from '@/main/components/user';
import NotFound from '@/admin/components/common/NotFound';
import Router from 'vue-router';
import store from './store';
import Vue from 'vue';

Vue.use(Router);

// Handle 404
const fallbackRoute = { path: '*', component: NotFound };

const router = new Router({
  routes: [{
    path: '/',
    component: Index,
    children: [{
      path: '/new-user',
      name: 'new-user',
      component: NewUser
    }, {
      path: '',
      name: 'events',
      component: Events,
      meta: { auth: true }
    }]
  }, fallbackRoute]
});

router.beforeEach(async (to, from, next) => {
  const isAuthenticationRequired = to.matched.some(it => it.meta.auth);
  if (!isAuthenticationRequired) return next();
  if (store.state.auth.user && store.state.auth.user.id) {
    const id = store.state.auth.user.id;
    return serviceWorkerExists()
      .then(result => {
        return result ? next() : createServiceWorker();
      })
      .then(subscription => api.update({ id, subscription }))
      .then(() => next());
  }
  return next({ name: 'new-user' });
});

export default router;
