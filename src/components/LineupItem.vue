<template>
  <div class="position--lined-up" @click="openChangeDialog">
    <div v-if="item.firstName || item.knownName" class="d-flex flex-wrap flex-sm-nowrap align-center" style="width: 100%">

      <div class="d-flex align-center">
      <img :src="teamImage" width="48"/>

      <p class="text-caption text-sm-h6 mb-0 mr-5 d-inline-block">
        <span class="player-name" v-if="item.knownName">{{ item.knownName }}</span>
        <span class="player-name" v-else>{{ item.firstName }} {{ item.lastName }}</span>
      </p>

      </div>

      <status-pill :player="item"></status-pill>

      <span v-if="nextMatchComputed" class="vsInfo ml-5 text-caption text-sm-body-1">
                    vs: <img :src="nextMatchComputed.img" class="vsTeam"/> {{ nextMatchComputed.abbr }}
                </span>
    </div>
    <div v-else class="d-flex align-center">
      <v-avatar class="no-position" size="48">
        <v-icon size="48" color="blue-grey darken-2">
          fa-plus-circle
        </v-icon>
      </v-avatar>
      <p class="text-body-1 ma-0 ml-5">add player</p>

    </div>
  </div>
</template>

<script>
import StatusPill from './StatusPill'
import {nextMatch} from '../helper/helper'

export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
    matches: {
      type: Array,
      required: false,
    }
  },
  components: {
    StatusPill
  },
  computed: {
    teamImage() {
      return '/assets/teams/' + this.item.teamId + '.png'
    },
    nextMatchComputed() {
      return nextMatch(this.matches, this.item)
    }
  },
  methods: {
    openChangeDialog() {
      const p = this.item
      p.match = this.match
      this.$emit('openChangeDialog', {player: p})
    }
  }
};
</script>
