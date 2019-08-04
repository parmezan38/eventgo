<template>
  <div>
    <v-layout row justify-center>
      <new-event :visible.sync="dialog"/>
    </v-layout>
    <div
      v-if="events.length > 0"
      class="event-container">
      <div v-for="(event, index) in events" :key="index">
        <event
          v-bind="event"
          :timelineStart="timelineStart"
          :timelineEnd="timelineEnd"/>
      </div>
    </div>
    <add-button @onClick="dialog = true"/>
  </div>
</template>

<script>
import AddButton from '@/main/components/common/AddButton';
import addMinutes from 'date-fns/add_minutes';
import api from '@/main/api/event';
import Event from '@/main/components/event/Event.vue';
import filter from 'lodash/filter';
import findIndex from 'lodash/findIndex';
import io from 'socket.io-client';
import NewEvent from './NewEvent';
import sortBy from 'lodash/sortBy';
import Vue from 'vue';

export default {
  name: 'index',
  props: {},
  data() {
    return {
      events: [],
      dialog: false,
      event: '',
      timelineStart: new Date(),
      timelineEnd: new Date()
    };
  },
  methods: {
    fetchEvents() {
      return api.fetch().then(events => this.sortEvents(events));
    },
    sortEvents(val) {
      // Sort events by date
      const events = sortBy(val, ['start']);
      events.forEach(it => {
        it.start = new Date(it.start);
        it.end = addMinutes(it.start, 30);
      }); // Temporary, add fixed end date
      events.forEach(event => {
        const overlaping = filter(events, it => isOverlaping(event, it));
        if (overlaping.length === 0) return (event.position = 0);
        event.position = findFirstAvailableNumber(overlaping);
      });
      this.timelineStart = events[0].start;
      this.timelineEnd = events[events.length - 1].end;
      this.events = events;
    }
  },
  created() {
    const ip = process.env.VUE_APP_IP;
    const port = process.env.VUE_APP_PORT;
    this.socket = io(`http://${ip}:${port}`);
    this.fetchEvents();
  },
  mounted() {
    this.socket.on('test', data => { console.log(data); });
    this.socket.on('created', data => {
      Vue.set(this.events, this.events.length, data.event);
      this.sortEvents(this.events);
    });
    this.socket.on('update', data => {
      const index = findIndex(this.events, it => {
        return data.event.id === it.id;
      });
      Vue.set(this.events, index, data.event);
      this.sortEvents(this.events);
    });
    this.socket.on('delete', data => {
      const index = findIndex(this.events, it => {
        return data.event.id === it.id;
      });
      Vue.delete(this.events, index);
      this.sortEvents(this.events);
    });
  },
  components: { AddButton, Event, NewEvent }
};

const isOverlaping = (a, b) => {
  return (b.start <= a.end && b.end >= a.start && a.id !== b.id);
};
function findFirstAvailableNumber(arr, timeout = 20) {
  for (let i = 0; i <= timeout; i++) {
    if (findIndex(arr, it => { return it.position === i; }) === -1) return i;
  }
}
</script>

<style lang='scss' scoped>
.event-container {
  padding-top: 50rem;
}
</style>
