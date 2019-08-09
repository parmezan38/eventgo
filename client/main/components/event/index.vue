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
    <div v-if="events.length > 0" class="event-container">
      <div v-for="(event, index) in sortedEvents" :key="index">
        <event v-bind="event" :index="index" :timeline="timeline"/>
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
      const events = sortBy(this.events, ['start']);
      const timeRange = differenceInMinutes(events[events.length - 1].start,
        events[0].start);
      const screenWidth = window.innerWidth;
      const characterWidth = 10; // 10 = aproximate font width
      const characters = screenWidth / characterWidth;
      const minutesPerCharacter = ((timeRange / characters) < 2) || 2;
      events.forEach(it => setEventDefaults({ event: it, minutesPerCharacter }));
      events.forEach(event => {
        const overlapingEvents = filter(events, it => isOverlaping(event, it));
        if (overlapingEvents.length === 0) return (event.position = 0);
        event.position = findFirstAvailableLevel(overlapingEvents, events.length);
      });
      return events;
    },
    timeline() {
      const events = sortBy(this.sortedEvents, ['end']);
      if (!events || events.length < 1) {
        return { start: new Date(), end: new Date() };
      }
      return {
        start: this.sortedEvents[0].start,
        end: events[events.length - 1].end
      };
    }
  },
  methods: {
    fetchEvents() {
      return api.fetch().then(events => { this.events = events; });
    }
  },
  watch: {
    filter(val) {
      if (!val) return this.sortedEvents.forEach(it => { it.visible = true; });
      this.sortedEvents.forEach(it => {
        if (it.name.includes(val)) return (it.visible = true);
        it.visible = false;
      });
    }
  },
  created() {
    const ip = process.env.VUE_APP_IP;
    const port = process.env.VUE_APP_PORT;
    this.socket = io(`http://${ip}:${port}`);
    this.fetchEvents();
  },
  mounted() {
    this.socket.on('create', ({ event }) => {
      event.start = new Date(event.start);
      Vue.set(this.events, this.events.length, event);
    });
    this.socket.on('update', ({ event }) => {
      const index = findIndex(this.events, ['id', event.id]);
      event.start = new Date(event.start);
      Vue.set(this.events, index, event);
    });
    this.socket.on('delete', ({ event }) => {
      const index = findIndex(this.events, ['id', event.id]);
      Vue.delete(this.events, index);
    });
  },
  components: { AddButton, Event, NewEvent, Timeline }
};

function isOverlaping(a, b) {
  return (b.start <= a.end && b.end >= a.start && a.id !== b.id);
}

function setEventDefaults({ event, minutesPerCharacter }) {
  const lengthByName = event.name.length * minutesPerCharacter;
  const contentWidth = 28;
  const width = (contentWidth * minutesPerCharacter) + lengthByName;
  event.start = new Date(event.start);
  event.end = addMinutes(event.start, width);
  event.visible = true;
  event.position = null;
}

function findFirstAvailableLevel(arr, events) {
  for (let i = 0; i <= events; i++) {
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
