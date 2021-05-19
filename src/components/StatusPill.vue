<template>
    <span>
        <v-chip pill v-if="player.status === 16" color="orange">
            <v-icon color="white">fa-times-circle</v-icon>
            <slot></slot>
        </v-chip>
        <v-chip pill v-else-if="player.status === 64" color="grey darken-4">
            <v-icon color="white">fa-ghost</v-icon>
            <slot></slot>
        </v-chip>
        <v-chip pill v-else-if="player.status === 2" color="orange">
            <v-icon color="white">fa-user-injured</v-icon>
            <slot></slot>
        </v-chip>
        <v-chip pill v-else-if="player.status === 1" color="red">
            <v-icon color="white">fa-plus-square</v-icon>
            <slot></slot>
        </v-chip>
        <v-chip pill v-else color="green">
            <v-icon color="white">fa-thumbs-up</v-icon>
            <slot></slot>
        </v-chip>
    </span>
</template>


<script>

export default {
  name: 'StatusPill',
  props: {
      player: {
          type: Object,
          required: true,
      }
  },
  mounted() {
  },
  computed: {
  },
  methods: {
  }
};
</script>
