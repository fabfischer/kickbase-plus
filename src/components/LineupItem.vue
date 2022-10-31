<template>
  <div class="position--lined-up" @click="openChangeDialog">
    <template v-if="item.firstName || item.knownName">
        <div class="position__next-match">
          <span v-if="nextMatchComputed" class="vsInfo">
                   <img :src="teamImage" class="vsTeam" /> vs <img :src="nextMatchComputed.img" class="vsTeam"/>
                </span>
        </div>

        <div class="position__avatar">
          <v-img
              v-if="item.profileBig"
              :src="item.profileBig"
              width="150"
              height="150"
              aspect-ratio="1"
              contain
          ></v-img>
          <v-avatar v-else>

          </v-avatar>
        </div>

        <div class="position__details">
          <div class="position__details__name">
            <span class="player-name" v-if="item.knownName">{{ item.knownName }}</span>
            <span class="player-name" v-else>{{ item.firstName }} {{ item.lastName }}</span>
          </div>
          <div class="position__details__status">
            <status-pill :player="item"></status-pill>
          </div>

        </div>

    </template>
    <div class="position__choose" v-else>
      <v-avatar class="no-position" size="48">
        <v-icon size="48" color="blue-grey darken-2">
          fa-plus-circle
        </v-icon>
      </v-avatar>
      <span>add player</span>
    </div>
  </div>
</template>

<script>
import StatusPill from './StatusPill'
import {getBundesligaClubImageUrlById, nextMatch} from '@/helper/helper'

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
      return getBundesligaClubImageUrlById(this.item.teamId)
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
