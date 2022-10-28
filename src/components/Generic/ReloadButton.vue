<template>
  <v-btn
      :loading="loading"
      :disabled="loading"
      fab
      :x-large="xLarge"
      :large="large"
      :color="color"
      class="reload-button elevation-0"
      :class="extraClasses"
  >
    <v-icon>
      fa-redo
    </v-icon>
  </v-btn>
</template>

<script>
export default {
  name: "ReloadButton",
  props: {
    loading: {
      type: Boolean,
      required: false,
      default: false,
    },
    color: {
      type: String,
      required: false,
      default: 'secondary',
    },
    xLarge: {
      type: Boolean,
      required: false,
      default: false,
    },
    large: {
      type: Boolean,
      required: false,
      default: false,
    },
    extraClasses: {
      type: String,
      required: false,
      default: '',
    }
  }
}
</script>