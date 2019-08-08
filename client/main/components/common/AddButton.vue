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
  background-image: radial-gradient(farthest-corner at 23px 18px, #ff9800, 80%, #f57f17 100%);
}
</style>
