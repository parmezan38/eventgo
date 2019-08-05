<template>
  <div>
    <div v-for="(time, index) in timeline" :key="index">
      <div
        :style="{
          'margin-left': calculateX({
            start: time, end: timelineStart, timelineStart, timelineEnd
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
    timelineStart: { type: Date, required: false, default: new Date() },
    timelineEnd: { type: Date, required: false, default: new Date() }
  },
  data() {
    return {
      timeline: []
    };
  },
  methods: {
    calculateX: data => calculateX(data)
  },
  created() {
    const hours = differenceInHours(this.timelineEnd, this.timelineStart);
    this.timeline = [];
    const start = setSeconds(setMinutes(this.timelineStart, 0), 0);
    for (let i = 1; i < hours + 1; i++) this.timeline.push(addHours(start, i));
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
  top: 58px;
  height: 100%;
  color: #78909c;
  z-index: 1;
  border-image: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(226, 226, 226, 1) 1%, rgba(255, 255, 255, 0) 20%, rgba(255, 255, 255, 0) 80%, rgba(226, 226, 226, 1) 99%, rgba(255, 255, 255, 0) 100%);
  border-image-slice: 1;
}
</style>
