<template>
  <div class="full-width-container full-width-container--with-options-bar">

    <options-bar info-button-title="your defaults">
      <template v-slot:content>
        <reload-button :loading="loading" v-on:click.native="load" color="transparent"></reload-button>
        <v-text-field
            label="Search for player at current market"
            v-model="search"
            prepend-icon="fa-search"
        ></v-text-field>

        <v-select
            :items="positions"
            label="Position filter"
            dense
            outlined
            v-model="selectedFilteredPosition"
            hide-details="true"
        ></v-select>

        <v-switch
            v-model="showOtherUsersPlayer"
            label="Show all player (of all league members)"
        ></v-switch>

      </template>
      <template v-slot:other-buttons>
        <reload-button :loading="loading" v-on:click.native="load" :large=true></reload-button>
      </template>

    </options-bar>

    <div class="flex-grow-1 options-bar__sibling" v-if="loading === false">
      <v-alert
          :color="alertColor"
          dark
          text
          class="mb-5 text-body-2"
      >
        <strong class="text-h6 font-weight-black">{{ playersLeft }}</strong> free spots in your team
      </v-alert>
      <v-text-field
          label="Search for player at current market"
          v-model="search"
          prepend-icon="fa-search"
          class="hidden-md-and-up"
      ></v-text-field>
      <bid-row
          v-for="player in getFilteredPlayers"
          :key="player.id"
          :player="player"/>
    </div>
    <div v-else class="flex-grow-1 options-bar__sibling">
      <loading-spinner></loading-spinner>
    </div>
  </div>

</template>

<script>
import api from '../api/api'
import {mapGetters, mapMutations} from 'vuex'

import BidRow from './BidRow'
import OptionsBar from './Generic/OptionsBar'
import ReloadButton from './Generic/ReloadButton'
import LoadingSpinner from "@/components/Spinner";

export default {
  name: 'transfermarket-view',
  components: {
    LoadingSpinner,
    BidRow,
    OptionsBar,
    ReloadButton,
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
    loading: false,
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
        switch (this.selectedFilteredPosition) {
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
    ...mapMutations(['setBids']),
    init: async function () {
      if (this.getSelf) {
        await api.loadBids(true)
        await api.loadUsers(false)
        this.players = this.getBids
      } else {
        window.setTimeout(this.init, 1000)
      }
    },
    load() {
      this.players = []
      this.setBids([])
      this.loading = true
      api.loadBids(false, () => {
        window.setTimeout(() => {
          this.loading = false
        }, 600)
      })
    },
  },
};
</script>
