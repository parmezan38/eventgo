<template>
  <div>
    <new-value
      :visible="show"
      :message="message"
      @close="close"
      @post="post"
      @update="update"
      type="event"/>
    <v-expand-transition>
      <div v-show="events.length" class="events-container">
        <div height="100" width="100" class="events">
          <div v-for="(event, index) in events" :key="index" class="event">
            {{ event.name }}
            {{ event.start | format }}
          </div>
        </div>
      </div>
    </v-expand-transition>
  </div>
</template>

<script>
import {
  DEFAULT_MESSAGE,
  extractValues,
  validateFormat,
  validateValues
} from '@/common/util/eventValidation';
import api from '@/main/api/event';
import format from 'date-fns/format';
import NewValue from '@/main/components/common/NewValue';
import setHours from 'date-fns/set_hours';
import setMilliseconds from 'date-fns/set_milliseconds';
import setMinutes from 'date-fns/set_minutes';
import setSeconds from 'date-fns/set_seconds';
import throttle from 'lodash/throttle';

export default {
  name: 'new-event',
  props: { visible: { type: Boolean, required: true } },
  data() {
    return {
      message: {
        text: DEFAULT_MESSAGE,
        error: false
      },
      events: [],
      event: ''
    };
  },
  computed: {
    show: {
      get() {
        return this.visible;
      },
      set(value) {
        if (!value) this.close();
      }
    }
  },
  methods: {
    close() {
      this.event = '';
      this.events = [];
      this.$emit('update:visible', false);
    },
    post(val) {
      const event = this.validateEvent(val);
      return api.create(event)
        .then(({ message }) => {
          this.$snackbar['success'](message);
          this.close();
        })
        .catch(() => this.$snackbar['error']('An error occured!'));
    },
    fetchEvents: throttle(function ({ time, filter }) {
      return api.fetch({ params: { time, filter } })
        .then(events => { this.events = events; });
    }, 400),
    validateEvent(val) {
      const formatError = validateFormat(val);
      if (formatError) return this.setMessage(formatError);
      const values = extractValues(val);
      const valueError = validateValues(values);
      if (valueError) return this.setMessage(valueError);
      this.setMessage({ text: DEFAULT_MESSAGE, error: false });
      const { name, hours, minutes } = values;
      return { name, start: formatTime(hours, minutes) };
    },
    setMessage({ text, error }) {
      this.message = { text, error };
    },
    update(val) {
      const event = this.validateEvent(val);
      if (!event) return;
      this.fetchEvents({ time: event.start, filter: event.name });
    }
  },
  filters: {
    format: val => format(val, 'HH:mm')
  },
  components: { NewValue }
};

function formatTime(h, m = 0) {
  const date = new Date();
  return setMilliseconds(setSeconds(setMinutes(setHours(date, h), m), 0), 0);
}
</script>

<style lang='scss' scoped>
.events-container {
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 56%;
  left: 0;
  width: 100%;
  align-items: center;
  justify-content: center;
  z-index: 300;
}

.events {
  text-align: center;
  min-width: 20rem;
  min-height: 1rem;
  padding: 0.8rem 1.2rem 0.8rem 1.2rem;
  background-color: #fff;
  border-radius: 18px;
}

.event {
  display: block;
  flex: 1;
}
</style>
