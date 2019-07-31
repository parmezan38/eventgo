<template>
  <div>
    <v-btn
      v-if="user.id === creatorId"
      @click="$emit('deleteEvent',id)">Delete</v-btn>
    <span>{{ name }}</span>
    <span>{{ start | format }}</span>
    <span>{{ attendees.length }}</span>
    <v-btn
      v-if="isAttendee"
      @click="$emit('unattend', id)">Unattend</v-btn>
    <v-btn v-else @click="$emit('attend', id)">Attend</v-btn>
  </div>
</template>

<script>
import find from 'lodash/find';
import format from 'date-fns/format';
import { mapState } from 'vuex';

export default {
  name: 'event',
  props: {
    id: { type: Number, required: true },
    creatorId: { type: String, required: true },
    name: { type: String, required: true },
    start: { type: String, required: true },
    attendees: { type: Array, required: true }
  },
  data() {
    return {};
  },
  computed: {
    ...mapState('auth', ['user'])
  },
  methods: {
    isAttendee() {
      return find(this.attendees, it => { return it.id === this.user.id; });
    }
  },
  filters: {
    format: val => format(val, 'HH:mm')
  }
};
</script>
