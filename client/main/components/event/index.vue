<template>
  <div>
    <navbar/>
    <v-layout row justify-center>
      <v-dialog
        v-model="dialog"
        persistent
        max-width="600px">
        <v-card>
          <v-card-title>
            <span class="headline">New Event</span>
          </v-card-title>
          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12 sm10 md10>
                  <v-text-field
                    v-model="event"
                    label="Event description">
                  </v-text-field>
                  <div :class="['message', { 'error' : message.error }]">
                    {{ message.text }}
                  </div>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="dialog = false">Close</v-btn>
            <v-btn @click="post">Post</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
    <v-container>
      <div
        v-for="(event, index) in events"
        :key="index">
        <span>{{ event.name }}</span>
        <span>{{ event.start | format }}</span>
        <span>{{ event.attendees.length }}</span>
        <v-btn @click="attend(event.id)">Attend</v-btn>
      </div>
    </v-container>
    <add-button @onClick="dialog = true"/>
  </div>
</template>

<script>
import AddButton from '@/main/components/common/AddButton';
import api from '@/main/api/event';
import format from 'date-fns/format';
import io from 'socket.io-client';
import Navbar from '@/main/components/common/Navbar';
import replace from 'lodash/replace';
import setHours from 'date-fns/set_hours';
import setMinutes from 'date-fns/set_minutes';
import setSeconds from 'date-fns/set_seconds';
import split from 'lodash/split';
import throttle from 'lodash/throttle';

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
      dialog: false,
      event: ''
    };
  },
  methods: {
    post() {
      const event = this.isValidFormat(this.event);
      if (!event) return;
      api.createEvent(event).then(result => {
        console.log(result);
        console.log(this.events);
        this.dialog = false;
      });
    },
    getCurrentTimeEvents: throttle(function (time) {
      return api.fetchEvents({ params: { time } })
        .then(events => { this.sameTimeEvents = events; });
    }, 400),
    attend(id) {
      return api.attendEvent({ id })
        .then(result => { console.log(result); });
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
    }
  },
  watch: {
    event(val) {
      const event = this.isValidFormat(val);
      if (!event) return;
      this.getCurrentTimeEvents(event.start);
    }
  },
  created() {
    const ip = process.env.VUE_APP_IP;
    const port = process.env.VUE_APP_PORT;
    this.socket = io(`http://${ip}:${port}`);
    notifyMe();
    api.fetchEvents()
      .then(events => { this.events = events; });
  },
  mounted() {
    this.socket.on('test', data => { console.log(data); });
    this.socket.on('created', () => {
      api.fetchEvents().then(events => { this.events = events; });
    });
  },
  filters: {
    format: val => format(val, 'HH:mm')
  },
  components: { AddButton, Navbar }
};

function notifyMe() {
  async function triggerPushNotification() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations()
        .then(registrations => {
          for (let registration of registrations) { registration.unregister(); }
          return navigator.serviceWorker.register('/sw.js', { scope: '/' });
        })
        .then(register => {
          const vapidPublicKey = process.env.VUE_APP_VAPID_KEY_PUBLIC;
          const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
          const options = { userVisibleOnly: true, applicationServerKey };
          return register.pushManager.subscribe(options);
        })
        .then(subscription => api.login(JSON.stringify(subscription)));
    } else {
      console.error('Service workers are not supported in this browser');
    }
  }
  triggerPushNotification();
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
