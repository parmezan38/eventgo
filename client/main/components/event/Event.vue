<template>
  <v-fade-transition>
    <div v-show="visible" :style="style" class="event">
      <v-btn
        v-if="user.id === creatorId"
        @click="deleteEvent(id)"
        flat
        class="button">
        <v-icon size="20">mdi-close</v-icon>
      </v-btn>
      <div v-else class="button"></div>
      <div class="event-info">
        <span class="text">{{ name }}</span>
        <span class="start">
          <v-icon class="icon">mdi-clock-outline</v-icon>
          {{ start | format }}</span>
        <span class="attendees">
          <v-icon class="icon">mdi-account-multiple</v-icon>
          {{ attendees.length }}
        </span>
      </div>
      <v-btn
        v-if="isAttendee()"
        :style="buttonStyle"
        @click="unattend(id)"
        flat
        class="button">
        <v-icon size="20">mdi-account-minus</v-icon>
      </v-btn>
      <v-btn
        v-else
        :style="buttonStyle"
        @click="attend(id)"
        flat
        class="button">
        <v-icon size="20">mdi-account-plus</v-icon>
      </v-btn>
    </div>
  </v-fade-transition>
</template>

<script>
import { calculateTop, calculateX } from '@/common/util/calculateTransforms';
import api from '@/main/api/event';
import colors from '@/common/util/colors';
import find from 'lodash/find';
import format from 'date-fns/format';
import { mapState } from 'vuex';

export default {
  name: 'event',
  props: {
    id: { type: Number, required: true },
    index: { type: Number, required: true },
    creatorId: { type: String, required: true },
    position: { type: Number, required: true },
    name: { type: String, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    visible: { type: Boolean, required: true },
    attendees: { type: Array, required: true },
    timeline: { type: Object, required: true }
  },
  computed: {
    ...mapState('auth', ['user']),
    style() {
      const { end, start, timeline, index, position } = this;
      return {
        top: calculateTop(position),
        width: calculateX({ start: end, end: start, timeline }),
        'margin-left': calculateX({ start, end: timeline.start, timeline }),
        'background-image': this.calculateGradient(index)
      };
    },
    buttonStyle() { return { 'color': this.calculateColor(this.index) }; }
  },
  methods: {
    isAttendee() {
      return !!find(this.attendees, { id: this.user.id });
    },
    deleteEvent(id) {
      return api.destroy({ id })
        .then(({ message }) => this.$snackbar['success'](message))
        .catch(() => this.$snackbar['error']('An error occured!'));
    },
    attend(id) {
      return api.attend({ id })
        .then(({ message }) => this.$snackbar['success'](message))
        .catch(() => this.$snackbar['error']('An error occured!'));
    },
    unattend(id) {
      return api.unattend({ id })
        .then(({ message }) => this.$snackbar['success'](message))
        .catch(() => this.$snackbar['error']('An error occured!'));
    },
    calculateGradient(index) {
      const color = colors[getColorIndex(index, colors)];
      const white = 'rgba(255, 255, 255, 0)';
      return `linear-gradient(to right, ${color}, 77%, ${white} 96%, ${white})`;
    },
    calculateColor: index => colors[getColorIndex(index, colors)]
  },
  filters: {
    format: val => format(val, 'HH:mm')
  }
};

const getColorIndex = (index, colors) => index % colors.length;
</script>

<style lang='scss' scoped>
.event {
  display: flex;
  position: absolute;
  height: 36px;
  padding: 0 0.1rem;
  border-radius: 18px;
  color: #fff;
  font-size: 1rem;
  align-items: center;
  justify-content: space-between;
  z-index: 10;
}

.event-info {
  flex-grow: 2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.button {
  flex-grow: 1;
  min-width: 1.3rem;
  max-width: 1.7rem;
  margin: auto !important;
  color: #fff;
  background-color: rgba(255, 255, 255, 0) !important;
  border: 0 !important;
  border-radius: 18px;
}

.text {
  font-weight: 600;
}

.start {
  margin-left: 0.3rem;
  font-weight: 300;

  .icon {
    padding-bottom: 0.1rem;
    color: #fff;
    font-size: 1.1rem;
    vertical-align: middle;
  }
}

.attendees {
  font-weight: 300;

  .icon {
    padding-bottom: 0.2rem;
    color: #fff;
    font-size: 1.2rem;
    vertical-align: middle;
  }
}
</style>
