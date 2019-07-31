<template>
  <div>
    <v-layout row justify-center>
      <new-event :visible.sync="dialog"/>
    </v-layout>
    <v-container>
      <div v-for="(event, index) in events" :key="index">
        <v-btn @click="deleteEvent(event.id)">Delete</v-btn>
        <span>{{ event.name }}</span>
        <span>{{ event.start | format }}</span>
        <span>{{ event.attendees.length }}</span>
        <v-btn @click="withdraw(event.id)">Withdraw</v-btn>
        <v-btn @click="attend(event.id)">Attend</v-btn>
      </div>
    </v-container>
    <add-button @onClick="dialog = true"/>
  </div>
</template>

<script>
import AddButton from '@/main/components/common/AddButton';
import api from '@/main/api/event';
import findIndex from 'lodash/findIndex';
import format from 'date-fns/format';
import io from 'socket.io-client';
import { mapState } from 'vuex';
import NewEvent from './NewEvent';
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
    ...mapState('auth', ['user'])
  },
  methods: {
    fetchEvents() {
      return api.fetch().then(events => { this.events = events; });
    },
    postEvent(val) {
      const event = this.isValidFormat(val);
      if (!event) return;
      api.create(event).then(result => { this.dialog = false; });
    },
    deleteEvent(id) {
      return api.destroy({ id }).then(result => { console.log(result); });
    },
    attend(id) {
      return api.attend({ id }).then(result => { console.log(result); });
    },
    withdraw(id) {
      return api.unattend({ id }).then(result => { console.log(result); });
    },
    updateEvent(val) {
      const event = this.isValidFormat(val);
      if (!event) return;
      this.getCurrentTimeEvents(event.start);
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
    });
    this.socket.on('update', data => {
      const index = findIndex(this.events, it => {
        return data.event.id === it.id;
      });
      Vue.set(this.events, index, data.event);
    });
    this.socket.on('delete', data => {
      const index = findIndex(this.events, it => {
        return data.event.id === it.id;
      });
      Vue.delete(this.events, index);
    });
  },
  filters: {
    format: val => format(val, 'HH:mm')
  },
  components: { AddButton, NewEvent }
};
</script>
