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
        <div
          height="100"
          width="100"
          class="events">
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
} from '@/util/eventValidation.js';
import api from '@/main/api/event';
import format from 'date-fns/format';
import NewValue from '@/main/components/common/NewValue';
import setHours from 'date-fns/set_hours';
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
      api.create(event).then(result => this.$emit('update:visible', false));
    },
    fetchEvents: throttle(function (time) {
      return api.fetch({ params: { time } })
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
      this.fetchEvents(event.start);
    }
  },
  filters: {
    format: val => format(val, 'HH:mm')
  },
  components: { NewValue }
};

function formatTime(hours, minutes = 0) {
  return setSeconds(setMinutes(setHours(new Date(), hours), minutes), 0);
}
</script>

<style lang='scss' scoped>
.events-container {
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 62%;
  left: 0;
  width: 100%;
  align-items: center;
  justify-content: center;
}

.events {
  text-align: center;
  min-width: 20rem;
  min-height: 1rem;
  padding: 0.8rem 1.2rem 0.8rem 1.2rem;
  background-color: #fff;
}

.event {
  display: block;
  flex: 1;
}
</style>
