<template>
  <div class="pull-right">
    <v-btn
      @click="$emit('onClick')"
      dark
      fab
      color="orange"
      class="add-button">
      <v-icon>mdi-plus</v-icon>
    </v-btn>
  </div>
</template>

<script>
export default {
  name: 'add-button'
};
</script>

<style lang='scss' scoped>
.add-button {
  position: fixed;
  right: 2vw;
  bottom: 1vh;
  z-index: 10;
}
</style>
