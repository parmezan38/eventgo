<template>
  <div>
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
          :timelineStart="timelineStart"
          :timelineEnd="timelineEnd"/>
      </div>
    </div>
    <timeline
      :timelineStart="timelineStart"
      :timelineEnd="timelineEnd"/>
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
      const charactersInMin = timeRange / characters;
      events.forEach(it => {
        it.start = new Date(it.start);
        const lengthByName = it.name.length * charactersInMin;
        it.end = addMinutes(it.start, (28 * charactersInMin) + lengthByName);
      });
      events.forEach(event => {
        const overlaping = filter(events, it => isOverlaping(event, it));
        if (overlaping.length === 0) return (event.position = 0);
        event.position = findFirstAvailableNumber(overlaping);
      });
      return events;
    },
    timelineStart() {
      if (!this.sortedEvents) return new Date();
      return this.sortedEvents[0].start;
    },
    timelineEnd() {
      if (!this.sortedEvents) return new Date();
      return this.sortedEvents[this.sortedEvents.length - 1].end;
    }
  },
  methods: {
    fetchEvents() {
      return api.fetch().then(events => { this.events = events; });
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
</style>
