<template>
  <div>
    <navbar/>
    <new-value
      :visible="newNameDialog"
      @close="newNameDialog = false"
      @post="createNewUser"
      title="Create Username"
      type="name"/>
    <v-layout row justify-center>
      <new-value
        :visible="newEventDialog"
        :message="message"
        @close="newEventDialog = false"
        @post="postEvent"
        @update="updateEvent"
        type="event"/>
    </v-layout>
    <v-container>
      <div v-for="(event, index) in events" :key="index">
        <span>{{ event.name }}</span>
        <span>{{ event.start | format }}</span>
        <span>{{ event.attendees.length }}</span>
        <v-btn @click="attend(event.id)">Attend</v-btn>
      </div>
    </v-container>
    <add-button @onClick="newEventDialog = true"/>
  </div>
</template>

<script>
import AddButton from '@/main/components/common/AddButton';
import eventApi from '@/main/api/event';
import format from 'date-fns/format';
import io from 'socket.io-client';
import Navbar from '@/main/components/common/Navbar';
import NewValue from './NewValue';
import Promise from 'bluebird';
import replace from 'lodash/replace';
import setHours from 'date-fns/set_hours';
import setMinutes from 'date-fns/set_minutes';
import setSeconds from 'date-fns/set_seconds';
import split from 'lodash/split';
import throttle from 'lodash/throttle';
import userApi from '@/main/api/user';

const DEFAULT_MESSAGE = '# name of event, @ start time. e.g. #event@13';
export default {
  name: 'index',
  props: {},
  data() {
    return {
      message: {
        text: DEFAULT_MESSAGE,
        error: false
      },
      events: [],
      sameTimeEvents: [],
      isLoggedIn: false,
      newNameDialog: false,
      newEventDialog: false,
      event: ''
    };
  },
  methods: {
    fetchEvents() {
      return eventApi.fetchEvents()
        .then(events => {
          this.events = events;
        });
    },
    async createNewUser(name) {
      return createSocketConnection()
        .then(subscription => userApi.create({ name, subscription }))
        .then(() => {
          this.isLoggedIn = true;
          this.newNameDialog = false;
          this.fetchEvents();
        });
    },
    postEvent(val) {
      const event = this.isValidFormat(val);
      if (!event) return;
      eventApi.createEvent(event).then(result => { this.newEventDialog = false; });
    },
    getCurrentTimeEvents: throttle(function (time) {
      return eventApi.fetchEvents({ params: { time } })
        .then(events => { this.sameTimeEvents = events; });
    }, 400),
    attend(id) {
      return eventApi.attendEvent({ id }).then(result => { console.log(result); });
    },
    isValidFormat(event) {
      if (!event) return false;
      const indexOfName = event.indexOf('#');
      if (indexOfName < 0) {
        const text = 'Please use "#" and type a name of the event (#name)';
        return this.setMessage(text, true);
      }
      const indexOfTime = event.indexOf('@');
      if (indexOfTime < 0) {
        const text = 'Please use "@" and type the start time (#name@12)';
        return this.setMessage(text, true);
      }
      return this.deconstructEvent({ event, indexOfName, indexOfTime });
    },
    deconstructEvent({ event, indexOfName, indexOfTime }) {
      const splitByTimeSeparator = split(event, '@');
      const name = replace(splitByTimeSeparator[0], '#', '');
      const time = split(splitByTimeSeparator[1], ':');
      const hours = parseInt(time[0]);
      const minutes = time[1] ? parseInt(time[1]) : 0;
      if (typeof hours !== 'number' || isNaN(hours)) {
        const text = 'Time must be a valid number';
        return this.setMessage(text, true);
      }
      if (typeof minutes !== 'number' || isNaN(hours)) {
        const text = 'Time must be a valid number';
        return this.setMessage(text, true);
      }
      this.setMessage(DEFAULT_MESSAGE, false);
      return { name, start: formatTime(hours, minutes) };
    },
    setMessage(text, error) {
      this.message = { text, error };
      return !error;
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
    eventApi.isLoggedIn()
      .then(result => {
        this.isLoggedIn = result;
        this.newNameDialog = !result;
        if (result) this.fetchEvents();
      });
  },
  mounted() {
    this.socket.on('test', data => { console.log(data); });
    this.socket.on('created', () => this.fetchEvents());
  },
  filters: {
    format: val => format(val, 'HH:mm')
  },
  components: { AddButton, Navbar, NewValue }
};

function createSocketConnection() {
  if ('serviceWorker' in navigator === false) {
    console.error('Service workers are not supported in this browser');
  }
  return navigator.serviceWorker.getRegistrations()
    .then(registrations => {
      for (let registration of registrations) { registration.unregister(); }
      return Promise.map(registrations, it => it.unregister());
    })
    .then(() => navigator.serviceWorker.register('/sw.js', { scope: '/' }))
    .then(register => navigator.serviceWorker.ready)
    .then(register => {
      if (!register) { console.error('oh noes'); }
      const vapidPublicKey = process.env.VUE_APP_VAPID_KEY_PUBLIC;
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      const options = { userVisibleOnly: true, applicationServerKey };
      return register.pushManager.subscribe(options);
    })
    .catch(err => { console.error(err); });
}

function formatTime(hours, minutes = 0) {
  return setSeconds(setMinutes(setHours(new Date(), hours), minutes), 0);
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
