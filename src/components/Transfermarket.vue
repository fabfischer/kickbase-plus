<template>
  <div style="width:100%;">
    <v-layout
        text-center
        fill-height
        wrap
    >
      <v-container>
        <v-alert
            :color="alertColor"
            dark
        >
          you can still buy the following number of players: <strong>{{ playersLeft }}</strong>
        </v-alert>
          <div class="pa-10 pb-0 pt-0 d-flex justify-space-between align-center flex-wrap flex-md-nowrap tm-tools">
            <div class="tm-search">
              <v-text-field
                  label="Search for player at current market"
                  v-model="search"
                  prepend-icon="fa-search"
              ></v-text-field>
            </div>
            <div >
              <v-select
                  :items="positions"
                  label="Position filter"
                  dense
                  outlined
                  v-model="selectedFilteredPosition"
                  hide-details="true"
              ></v-select>
            </div>
            <div >
              <v-switch
                  v-model="showOtherUsersPlayer"
                  label="Show all"
              ></v-switch>
            </div>
            <div >
              <v-icon large class="reload-button" @click="load">fa-redo</v-icon>
            </div>
          </div>

        <bid-row
            v-for="player in getFilteredPlayers"
            :key="player.id"
            :player="player"/>
      </v-container>

    </v-layout>
  </div>

</template>

<script>
import api from '../api/api'
import {mapGetters} from 'vuex'

import BidRow from './BidRow'

export default {
  name: 'transfermarket-view',
  components: {
    BidRow,
  },
  data: () => ({
    players: [],
    search: null,
    showOtherUsersPlayer: false,
    positions: [
        'All',
        'Goalkeeper',
        'Defender',
        'Midfielder',
        'Forward',
    ],
    selectedFilteredPosition: null,
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
    },
    getFilteredPlayers() {
      let players = this.getBids
      if (this.search) {
        const regex = new RegExp(this.search, 'i')
        players = players.filter(player => player.lastName.match(regex))
      }

      if (this.selectedFilteredPosition) {
        let p = null
        switch(this.selectedFilteredPosition) {
          case 'All':
            break;
          case 'Goalkeeper':
            p = 1
            break;
          case 'Defender':
            p = 2
                break
          case 'Midfielder':
            p = 3
                break
          case 'Forward':
            p = 4
                break;
          default:
            p = null
                break;
        }

        if (p) {
          players = players.filter(player => player.position === p)
        }
      }

      if (!this.showOtherUsersPlayer) {
        players = players.filter(player => !player.userId)
      }

      return players
    }
  },
  mounted() {
    this.init()
  },
  watch: {
    search() {
      this.players = this.getFilteredPlayers
    },
    getBids() {
      this.players = this.getBids
    },
    selectedFilteredPosition() {
      this.players = this.getFilteredPlayers
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
