<template>
  <div class="dialog-container">
    <v-dialog v-model="visible" persistent content-class="my-dialog">
      <div class="my-title">{{ title }}</div>
      <div class="main-container">
        <v-btn @click="$emit('close')" flat class="button">
          <v-icon size="50" class="icon">mdi-close</v-icon>
        </v-btn>
        <div class="text-field-container">
          <v-text-field v-model="value" class="text-field"/>
          <div :class="['message', { 'message-error' : message.error }]">
            {{ message.text }}
          </div>
        </div>
        <v-btn @click="post" flat class="button">
          <v-icon size="60" class="icon">mdi-plus</v-icon>
        </v-btn>
      </div>
    </v-dialog>
  </div>
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
.main-container {
  display: flex;
  width: 45rem;
  height: 7rem;
  margin: auto;
  padding: 0 0.1rem;
  border-radius: 5rem;
  background-color: #fff;
  align-items: center;
  justify-content: space-between;
  vertical-align: middle;
  box-shadow:
    0 11px 15px -7px rgba(0,0,0,0.2),
    0 24px 38px 3px rgba(0,0,0,0.14),
    0 9px 46px 8px rgba(0,0,0,0.12);
}

.my-title {
  position: absolute;
  top: 37%;
  color: #fff;
  font-size: 3rem;
}

.button {
  max-width: 7rem;
  height: 100%;
  flex-grow: 1;
  margin: auto !important;
  color: #ff9800;
  background-color: rgba(255, 255, 255, 0) !important;
  border: 0 !important;
  border-radius: 5rem;
}

.text-field-container {
  flex-grow: 2;
  text-align: center;

  .text-field {
    max-width: 100%;
  }
}

.message {
  min-height: 2rem;
  padding-top: 0.5rem;
  background-color: #fff;
}

.message-error {
  color: #bd0006;
}
</style>

<style lang='scss'>
.my-dialog {
  display: flex;
  justify-content: center;
  align-items: center;
}

.my-dialog.v-dialog {
  height: 100%;
  box-shadow: 0 0 0 0 !important;
}

.text-field {
  margin-top: 1rem;

  .v-text-field__slot {
    font-size: 1.8rem;
  }

  .v-text-field__details {
    height: 0;
  }

  .v-input__slot {
    margin: 0;
  }
}
</style>
