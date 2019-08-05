<template>
  <div
    :style="{
      top: calculateTop(position),
      width: calculateX({
        start: end, end: start, timelineStart, timelineEnd }),
      'margin-left': calculateX({
        start, end: timelineStart, timelineStart, timelineEnd
      }),
      'background-color': calculateColor(index)
    }"
    class="my-event">
    <v-btn
      v-if="user.id === creatorId"
      @click="deleteEvent(id)"
      flat
      class="button button-left">
      <v-icon :size="20">mdi-close</v-icon>
    </v-btn>
    <div v-else class="button button-left"></div>
    <div class="info">
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
      @click="unattend(id)"
      flat
      class="button button-right">
      <v-icon :size="20">mdi-account-minus</v-icon>
    </v-btn>
    <v-btn
      v-else
      @click="attend(id)"
      flat
      class="button button-right">
      <v-icon :size="20">mdi-account-plus</v-icon>
    </v-btn>
  </div>
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
    attendees: { type: Array, required: true },
    timelineStart: { type: Date, required: false, default: new Date() },
    timelineEnd: { type: Date, required: false, default: new Date() }
  },
  data() {
    return {};
  },
  computed: {
    ...mapState('auth', ['user'])
  },
  methods: {
    isAttendee() {
      return !!find(this.attendees, it => {
        return it.id === this.user.id;
      });
    },
    deleteEvent(id) {
      return api.destroy({ id }).then(result => { console.log(result); });
    },
    attend(id) {
      return api.attend({ id }).then(result => { console.log(result); });
    },
    unattend(id) {
      return api.unattend({ id }).then(result => { console.log(result); });
    },
    calculateTop: val => calculateTop(val),
    calculateX: data => calculateX(data),
    calculateColor(index) {
      // TODO: Loop through colors array
      return colors[index];
    }
  },
  filters: {
    format: val => format(val, 'HH:mm')
  }
};
</script>

<style lang='scss' scoped>
.my-event {
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

.info {
  flex-grow: 2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

.button {
  flex-grow: 1;
  min-width: 1.3rem;
  max-width: 1.7rem;
  margin: auto !important;
  color: #fff;
  background-color: rgba(255, 255, 255, 0) !important;
  border: 0 !important;
  border-radius: 4px;
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

.button-left {
  border-top-left-radius: 18px;
  border-bottom-left-radius: 18px;
}

.button-right {
  border-top-right-radius: 18px;
  border-bottom-right-radius: 18px;
}
</style>
