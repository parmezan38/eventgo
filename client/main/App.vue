<template>
  <v-app id="app" class="system-font-stack">
    <router-view/>
  </v-app>
</template>

<script>
export default {
  name: 'app'
};
</script>

<style lang="scss">
@import "./stylesheets/main";

* {
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
  overflow: hidden;
  overflow-y: hidden !important;
}

#app {
  height: 100%;
  overflow-y: auto !important;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

</style>
