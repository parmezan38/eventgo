<template>
  <v-layout row justify-center>
    <v-dialog v-model="visible" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ title }}</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12 sm10 md10>
                <v-text-field v-model="value">
                </v-text-field>
                <div :class="['message', { 'error' : message.error }]">
                  {{ message.text }}
                </div>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="$emit('close')">Close</v-btn>
          <v-btn @click="post">Post</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
export default {
  name: 'new-value',
  props: {
    title: { type: String, required: false, default: '' },
    visible: { type: Boolean, required: true },
    type: { type: String, required: true },
    message: { type: Object, required: false, default: () => ({}) }
  },
  data() {
    return {
      value: ''
    };
  },
  methods: {
    post() {
      this.$emit('post', this.value);
    }
  },
  watch: {
    value(val) {
      this.$emit('update', val);
    }
  }
};
</script>

<style lang='scss' scoped>
.message {
  background-color: #fff;
}

.error {
  color: #bd0006;
}
</style>
