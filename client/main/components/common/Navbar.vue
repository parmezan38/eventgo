<template>
  <v-toolbar color="light-blue" app fixed height="64">
    <router-link :to="{ name: 'events' }" tag="span" class="app-brand">
      <v-avatar color="white" size="40">
        <v-icon color="light-blue">mdi-clock-outline</v-icon>
      </v-avatar>
      <v-toolbar-title class="app-name">EVENTGO</v-toolbar-title>
    </router-link>
    <v-spacer/>
  </v-toolbar>
</template>

<script>
export default {
  name: 'main-navbar'
};
</script>

<style lang="scss" scoped>
$container-height: 40px;
$font-color: #333;

.v-toolbar {
  z-index: 20;
  background-image: linear-gradient(to bottom, #03aff4, 80%, #039be5 100%);
}

.app-brand {
  cursor: pointer;

  .v-avatar {
    float: left;
    margin-right: 14px;
  }

  .app-name {
    color: white;
    font-size: 1.5rem;
    font-weight: 400;
    line-height: $container-height;
  }
}
</style>
