<template>
  <div>
    <div v-for="(time, index) in timeFlags" :key="index">
      <div
        :style="style({ start: time })"
        class="time">{{ time | format }}h</div>
    </div>
  </div>
</template>

<script>
import addHours from 'date-fns/add_hours';
import addMinutes from 'date-fns/add_minutes';
import { calculateX } from '@/common/util/calculateTransforms';
import differenceInHours from 'date-fns/difference_in_hours';
import format from 'date-fns/format';
import setMinutes from 'date-fns/set_minutes';
import setSeconds from 'date-fns/set_seconds';
import subMinutes from 'date-fns/sub_minutes';

export default {
  name: 'timeline',
  props: {
    timeline: {
      type: Object,
      required: false,
      default: () => ({ start: new Date(), end: new Date() })
    }
  },
  computed: {
    timeFlags() {
      const timeFlags = [];
      const timelineEnd = addMinutes(this.timeline.end, 30);
      const timelineStart = subMinutes(this.timeline.start, 30);
      const hours = differenceInHours(timelineEnd, timelineStart);
      const start = setSeconds(setMinutes(this.timeline.start, 0), 0);
      for (let i = 1; i < hours + 1; i++) timeFlags.push(addHours(start, i));
      return timeFlags;
    }
  },
  methods: {
    style({ start }) {
      const { timeline } = this;
      return {
        'margin-left': calculateX({ start, end: timeline.start, timeline })
      };
    }
  },
  filters: {
    format: val => format(val, 'HH')
  }
};
</script>

<style lang='scss' scoped>
.time {
  border-left: 2px solid #cfd8dc;
  position: absolute;
  top: 5rem;
  height: 100%;
  color: #78909c;
  z-index: 1;
  border-image: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(226, 226, 226, 1) 1%, rgba(255, 255, 255, 0) 20%, rgba(255, 255, 255, 0) 80%, rgba(226, 226, 226, 1) 99%, rgba(255, 255, 255, 0) 100%);
  border-image-slice: 1;
}
</style>
