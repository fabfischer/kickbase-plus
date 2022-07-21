<template>
  <div class="spinner">
    <v-progress-circular
        indeterminate
        :size="64"
        :width="8"
        color="dark"
    ></v-progress-circular>
  </div>
</template>

<script>
export default {
  name: 'loading-spinner'
};
</script>
