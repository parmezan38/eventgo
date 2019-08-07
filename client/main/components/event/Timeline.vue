<template>
  <div>
    <div v-for="(time, index) in timeFlags" :key="index">
      <div
        :style="{
          'margin-left': calculateX({
            start: time, end: timeline.start, timeline
          })
        }"
        class="time">{{ time | format }}h</div>
    </div>
  </div>
</template>

<script>
import addHours from 'date-fns/add_hours';
import { calculateX } from '@/common/util/calculateTransforms';
import differenceInHours from 'date-fns/difference_in_hours';
import format from 'date-fns/format';
import setMinutes from 'date-fns/set_minutes';
import setSeconds from 'date-fns/set_seconds';

export default {
  name: 'timeline',
  props: {
    timeline: {
      type: Object,
      required: false,
      default: () => {
        return { start: new Date(), end: new Date() };
      } }
  },
  data() {
    return {
      timeFlags: []
    };
  },
  methods: {
    calculateX: data => calculateX(data),
    setTimeline() {
      const hours = differenceInHours(this.timeline.end, this.timeline.start);
      this.timeFlags = [];
      const start = setSeconds(setMinutes(this.timeline.start, 0), 0);
      for (let i = 1; i < hours + 1; i++) this.timeFlags.push(addHours(start, i));
    }
  },
  watch: {
    'timeline.start'() {
      this.setTimeline();
    }
  },
  created() {
    this.setTimeline();
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
  top: 4.3rem;
  height: 100%;
  color: #78909c;
  z-index: 1;
  border-image: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(226, 226, 226, 1) 1%, rgba(255, 255, 255, 0) 20%, rgba(255, 255, 255, 0) 80%, rgba(226, 226, 226, 1) 99%, rgba(255, 255, 255, 0) 100%);
  border-image-slice: 1;
}
</style>
