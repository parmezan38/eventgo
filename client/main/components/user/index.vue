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
import { createServiceWorker } from '@/common/util/serviceWorker';
import NewValue from '@/main/components/common/NewValue';

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
      return createServiceWorker()
        .then(subscription => api.create({ name, subscription }))
        .then(id => {
          this.login({ id });
          this.dialog = false;
          this.$router.push({ name: 'events' });
        });
    }
  },
  components: { NewValue }
};
</script>

<style lang='scss' scoped>
.message {
  background-color: #fff;
}

.error {
  color: #bd0006;
}
</style>
