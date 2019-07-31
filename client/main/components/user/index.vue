<template>
  <new-value
    :visible="dialog"
    @close="dialog = false"
    @post="create"
    title="Create Username"
    type="name"/>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
import api from '@/main/api/user';
import NewValue from '@/main/components/common/NewValue';
import Promise from 'bluebird';

export default {
  name: 'new-user',
  props: {},
  data() {
    return {
      dialog: true
    };
  },
  computed: {
    ...mapState('auth', ['user'])
  },
  methods: {
    ...mapMutations('auth', ['login']),
    async create(name) {
      return createSocketConnection()
        .then(subscription => api.create({ name, subscription }))
        .then(id => {
          this.login({ id });
          this.dialog = false;
          this.$router.push({ name: 'events' });
        });
    }
  },
  created() {},
  components: { NewValue }
};

function createSocketConnection() {
  if ('serviceWorker' in navigator === false) {
    console.error('Service workers are not supported in this browser');
  }
  return navigator.serviceWorker.getRegistrations()
    .then(registrations => Promise.map(registrations, it => it.unregister()))
    .then(() => navigator.serviceWorker.register('/sw.js', { scope: '/' }))
    .then(register => navigator.serviceWorker.ready)
    .then(register => {
      const vapidPublicKey = process.env.VUE_APP_VAPID_KEY_PUBLIC;
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      const options = { userVisibleOnly: true, applicationServerKey };
      return register.pushManager.subscribe(options);
    })
    .catch(err => { console.error(err); });
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
</script>

<style lang='scss' scoped>
.message {
  background-color: #fff;
}

.error {
  color: #bd0006;
}
</style>
