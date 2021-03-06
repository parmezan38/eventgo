<template>
  <div>
    <div v-for="(time, index) in timeFlags" :key="index">
      <div
        :style="style({ start: time })"
        class="time top">{{ time | format }}h</div>
      <div :style="style({ start: time })" class="time bottom"></div>
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
      const timelineEnd = addMinutes(this.timeline.end, 10);
      const timelineStart = subMinutes(this.timeline.start, 10);
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
  height: 20%;
  color: #78909c;
  z-index: 1;
}

.time.top {
  top: 5rem;
  border-image: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(226, 226, 226, 1) 1%, rgba(255, 255, 255, 0) 80%);
  border-image-slice: 1;
}

.time.bottom {
  bottom: 0;
  border-image: linear-gradient(to top, rgba(226, 226, 226, 1) 0%, rgba(255, 255, 255, 0) 60%);
  border-image-slice: 1;
}
</style>
