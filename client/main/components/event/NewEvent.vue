<template>
  <new-value
    :visible="show"
    :message="message"
    @close="close"
    @post="post"
    @update="update"
    type="event"/>
</template>

<script>
import api from '@/main/api/event';
import NewValue from '@/main/components/common/NewValue';
import replace from 'lodash/replace';
import setHours from 'date-fns/set_hours';
import setMinutes from 'date-fns/set_minutes';
import setSeconds from 'date-fns/set_seconds';
import split from 'lodash/split';
import throttle from 'lodash/throttle';

const DEFAULT_MESSAGE = '# name of event, @ start time. e.g. #event@13';
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
      this.$emit('update:visible', false);
    },
    post(val) {
      const event = this.isValidFormat(val);
      if (!event) return;
      api.create(event).then(result => this.$emit('update:visible', false));
    },
    getCurrentTimeEvents: throttle(function (time) {
      return api.fetch({ params: { time } })
        .then(events => { this.events = events; });
    }, 400),
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
    update(val) {
      const event = this.isValidFormat(val);
      if (!event) return;
      this.getCurrentTimeEvents(event.start);
    }
  },
  components: { NewValue }
};

function formatTime(hours, minutes = 0) {
  return setSeconds(setMinutes(setHours(new Date(), hours), minutes), 0);
}
</script>
