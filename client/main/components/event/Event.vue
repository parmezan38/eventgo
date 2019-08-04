<template>
  <div
    :style="{
      top: calculateTop(position),
      width: calculateWidth(start, end),
      'margin-left': calculateX(start)
    }"
    class="my-event">
    <v-btn
      v-if="user.id === creatorId"
      @click="deleteEvent(id)"
      flat
      class="button button-left">
      <v-icon :size="18">mdi-close</v-icon>
    </v-btn>
    <span>{{ name }}</span>
    <span>{{ start | format }}</span>
    <span>{{ attendees.length }}</span>
    <v-btn
      v-if="isAttendee()"
      @click="unattend(id)"
      flat
      class="button button-right">
      <v-icon :size="18">mdi-account-minus</v-icon>
    </v-btn>
    <v-btn
      v-else
      @click="attend(id)"
      flat
      class="button button-right">
      <v-icon :size="18">mdi-account-plus</v-icon>
    </v-btn>
  </div>
</template>

<script>
import api from '@/main/api/event';
import differenceInMinutes from 'date-fns/difference_in_minutes';
// import endOfDay from 'date-fns/end_of_day';
import find from 'lodash/find';
import format from 'date-fns/format';
import { mapState } from 'vuex';

export default {
  name: 'event',
  props: {
    id: { type: Number, required: true },
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
    calculateWidth(start, end) {
      const duration = differenceInMinutes(end, start);
      const endOffset = differenceInMinutes(this.timelineEnd, this.timelineStart);
      console.log(duration / (endOffset / 100) + '%');
      return (duration / (endOffset / 100) + '%');
    },
    calculateTop: val => ((val * 37) + 68 + 'px'),
    calculateX(start) {
      const time = differenceInMinutes(start, this.timelineStart);
      const endOffset = differenceInMinutes(this.timelineEnd, this.timelineStart);
      return (time / (endOffset / 100)) + '%';
    }
  },
  filters: {
    format: val => format(val, 'HH:mm')
  }
};
</script>

<style lang='scss' scoped>
.my-event {
  position: absolute;
  min-height: 26px;
  padding: 0;
  border-radius: 15px;
  color: #fff;
  overflow: hidden;
  font-size: 12px;
  background-color: blue;
  justify-content: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.button {
  min-width: 1.8rem;
  margin: 0 !important;
  color: #fff;
  background-color: rgba(255, 255, 255, 0) !important;
  border: 0 !important;
  border-radius: 4px;
}

.button-left {
  padding: 0 0 0 0.4rem !important;
  border-top-left-radius: 15px;
  border-bottom-left-radius: 15px;
}

.button-right {
  padding: 0 0.4rem 0 0 !important;
  border-top-right-radius: 15px;
  border-bottom-right-radius: 15px;
}
</style>
