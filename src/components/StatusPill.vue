<template>
    <span class="status-pill">
      <v-alert dense text v-if="player.status === 0" icon="fa-thumbs-up" type="success">
            fit
      </v-alert>
      <v-alert dense text v-else-if="player.status === 1" icon="fa-plus-square" color="red">
            injured
      </v-alert>
      <v-alert dense v-else-if="player.status === 2" text :color="orange" icon="fa-user-injured" class="is-stricken">
            stricken
      </v-alert>
      <v-alert dense text v-else-if="player.status === 4" icon="fa-dumbbell" color="orange">
            recover training
      </v-alert>
      <v-alert dense text v-else-if="player.status === 8" icon="fa-times-circle" color="red">
            red card
      </v-alert>
      <v-alert dense text v-else-if="player.status === 16" icon="fa-times-circle" :color="orange" class="is-stricken">
            second yellow card
      </v-alert>
      <v-alert dense text v-else-if="player.status === 32" icon="fa-times-circle" :color="orange" class="is-stricken">
            5th yellow card
      </v-alert>
      <v-alert dense text v-else-if="player.status === 64" icon="fa-ghost"
               color="this.$vuetify.theme.dark ? #ccc' : '#2A3B4D'">
            not in team
      </v-alert>
      <v-alert dense text v-else-if="player.status === 128" icon="fa-suitcase"
               color="this.$vuetify.theme.dark ? #ccc' : '#2A3B4D'">
            left the league
      </v-alert>
      <v-alert dense text v-else-if="player.status === 256" icon="fa-suitcase"
               color="this.$vuetify.theme.dark ? #ccc' : '#2A3B4D'">
            away
      </v-alert>
      <v-alert dense text v-else icon="fa-question" type="info">
            unsupported status
      </v-alert>
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
  computed: {
    orange() {
      return (this.$vuetify.theme.dark) ? 'orange lighten-4' : 'orange darken-3'
    }
  }
};
</script>
