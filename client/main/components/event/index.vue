<template>
  <div>
    <v-text-field
      v-model="filter"
      label="Search"
      single-line
      clearable
      dark
      color="orange"
      class="search-field"/>
    <v-layout row justify-center>
      <new-event :visible.sync="dialog"/>
    </v-layout>
    <div
      v-if="events.length > 0"
      class="event-container">
      <div v-for="(event, index) in sortedEvents" :key="index">
        <event
          v-bind="event"
          :index="index"
          :timeline="timeline"/>
      </div>
    </div>
    <timeline :timeline="timeline"/>
    <add-button @onClick="dialog = true"/>
  </div>
</template>

<script>
import AddButton from '@/main/components/common/AddButton';
import addMinutes from 'date-fns/add_minutes';
import api from '@/main/api/event';
import differenceInMinutes from 'date-fns/difference_in_minutes';
import Event from './Event.vue';
import filter from 'lodash/filter';
import findIndex from 'lodash/findIndex';
import io from 'socket.io-client';
import NewEvent from './NewEvent';
import sortBy from 'lodash/sortBy';
import throttle from 'lodash/throttle';
import Timeline from './Timeline.vue';
import Vue from 'vue';

export default {
  name: 'index',
  props: {},
  data() {
    return {
      events: [],
      filter: null,
      dialog: false,
      event: ''
    };
  },
  computed: {
    sortedEvents() {
      if (!this.events.length) return;
      // Sort events by date
      const events = sortBy(this.events, ['start']);
      const timeRange = differenceInMinutes(events[events.length - 1].start, events[0].start);
      const screenWidth = window.innerWidth;
      const characters = screenWidth / 10; // 10 = aproximate font width
      const charactersInMin = (timeRange / characters) || 2;
      events.forEach(it => {
        it.start = new Date(it.start);
        const lengthByName = it.name.length * charactersInMin;
        it.end = addMinutes(it.start, (28 * charactersInMin) + lengthByName);
      });
      events.forEach(event => {
        const overlaping = filter(events, it => isOverlaping(event, it));
        if (overlaping.length === 0) return (event.position = 0);
        event.position = findFirstAvailableNumber(overlaping, events.length);
      });
      return events;
    },
    timeline() {
      const events = this.sortedEvents;
      if (!events || events.length < 1) {
        return { start: new Date(), end: new Date() };
      }
      return { start: events[0].start, end: events[events.length - 1].end };
    }
  },
  methods: {
    fetchEvents: throttle(async function (filter) {
      return api.fetch({ params: { filter } })
        .then(events => { this.events = events; });
    }, 400)
  },
  watch: {
    filter(val) {
      this.fetchEvents(val);
    }
  },
  created() {
    const ip = process.env.VUE_APP_IP;
    const port = process.env.VUE_APP_PORT;
    this.socket = io(`http://${ip}:${port}`);
    this.fetchEvents();
  },
  mounted() {
    this.socket.on('created', data => {
      data.event.start = new Date(data.event.start);
      Vue.set(this.events, this.events.length, data.event);
    });
    this.socket.on('update', data => {
      const index = findIndex(this.events, it => {
        return data.event.id === it.id;
      });
      data.event.start = new Date(data.event.start);
      Vue.set(this.events, index, data.event);
    });
    this.socket.on('delete', data => {
      const index = findIndex(this.events, it => {
        return data.event.id === it.id;
      });
      Vue.delete(this.events, index);
    });
  },
  components: { AddButton, Event, NewEvent, Timeline }
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

.search-field {
  position: fixed;
  top: 1px;
  left: 50%;
  width: 40%;
  margin-left: -20%;
  z-index: 500;
  color: #fff;
}

</style>
