import Event from '@/main/components/event';
import NotFound from '@/admin/components/common/NotFound';
import Router from 'vue-router';
import Vue from 'vue';

Vue.use(Router);

// Handle 404
const fallbackRoute = { path: '*', component: NotFound };

const router = new Router({
  routes: [{
    path: '/',
    component: Event
  }, fallbackRoute]
});

export default router;
