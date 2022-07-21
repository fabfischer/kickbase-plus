<template>
  <div style="width:100%;">
    <v-layout
        text-center
        fill-height
        wrap
        v-if="players && players.length"
    >
      <v-container>
        <v-alert
            :color="alertColor"
            dark
        >
          you can still buy the following number of players: <strong>{{ playersLeft }}</strong>
        </v-alert>
        <v-container grid-list-md text-center>
          <v-layout wrap class="">
            <v-flex xs11 text-left>
              <v-text-field
                  label="Search for player at current market"
                  v-model="search"
                  prepend-icon="fa-search"

              ></v-text-field>
            </v-flex>
            <v-flex xs1 align-self-center>
              <v-icon large class="reload-button" @click="load">fa-redo</v-icon>
            </v-flex>
          </v-layout>
        </v-container>

        <bid-row
            v-for="player in players"
            :key="player.id"
            :player="player"/>
      </v-container>

    </v-layout>
    <spinner v-else></spinner>
  </div>

</template>

<script>
import api from '../api/api'
import {mapGetters} from 'vuex'

import BidRow from './BidRow'
import Spinner from './Spinner'

export default {
  name: 'transfermarket-view',
  components: {
    BidRow,
    Spinner,
  },
  data: () => ({
    players: [],
    search: null,
  }),
  computed: {
    ...mapGetters([
      'getBids',
      'getSelf',
      'getSelfPlayerDetails',
      'getSelectedLeague',
    ]),
    playersLeft() {
      if (this.getSelectedLeague && this.getSelectedLeague.pl) {
        return (this.getSelfPlayerDetails && this.getSelfPlayerDetails.players && this.getSelectedLeague)
            ? this.getSelectedLeague.pl - this.getSelfPlayerDetails.players.length
            : 0
      } else {
        return 'unlimited'
      }
    },
    alertColor() {
      if (this.playersLeft === 0) {
        return 'red darken-2'
      } else if (this.playersLeft === 1) {
        return 'orange darken-2'
      } else {
        return 'success darken-2'
      }
    }
  },
  mounted() {
    this.init()
  },
  watch: {
    search(newValue) {
      const regex = new RegExp(newValue, 'i')
      this.players = this.getBids.filter(player => player.lastName.match(regex))
    },
    getBids() {
      this.players = this.getBids
    }
  },
  methods: {
    init: async function () {
      if (this.getSelf) {
        await api.loadBids(true)
        this.players = this.getBids
      } else {
        window.setTimeout(this.init, 1000)
      }
    },
    load() {
      this.players = []
      api.loadBids(false)
    },
  },
};
</script>
