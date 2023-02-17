<template>
  <div class="full-width-container">

    <div class="d-flex flex-wrap flex-sm-nowrap justify-space-between align-center">
      <h2 class="text-h4 text-sm-h3 mb-5">Live Scores</h2>
      <reload-button :loading="loading" v-on:click.native="reload"></reload-button>
    </div>

    <v-expansion-panels multiple accordion class="elevation-1 player-card-accordion" v-if="getUsers && getUsers.length">
      <v-expansion-panel
          v-for="(user, idx) in getUsers" :key="user.id"
      >
        <v-expansion-panel-header class="elevation-0">
          <template v-slot:default>
            <v-row no-gutters>
              <v-col cols="12" md="3">
                {{ (idx+1) }}. <strong>{{ user.n }}</strong>:
              </v-col>
              <v-col
                  md="9"
                  cols="12"
                  class="text--secondary"
              >
                {{ user.t }} / {{ user.st }} (with <strong>{{ numberOfPlayersWhoScored(user.pl) }}</strong>players, who have scored)
              </v-col>
            </v-row>
          </template>

        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-data-table
              :headers="headers"
              :items="user.pl"
              :options="options"
              :mobile-breakpoint="0"
              class="elevation-1"
              hide-default-footer
          ></v-data-table>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <spinner v-else></spinner>
  </div>
</template>

<script>
import {mapGetters} from 'vuex'
import api from '../api/api'
import numeral from 'numeral'

numeral.locale('deff')

import Spinner from './Spinner'
import ReloadButton from "./Generic/ReloadButton";

export default {
  name: 'live-view',
  components: {
    ReloadButton,
    Spinner,
  },
  data: () => ({
        loading: false,
        headers: [
          {
            text: 'Name',
            align: 'start',
            value: 'displayName',
          },
          {text: 'Points', value: 't'},
          {text: 'Goals', value: 'g', align: ' d-none d-md-table-cell'},
          {text: 'Assists', value: 'a', align: ' d-none d-md-table-cell'},
          {text: 'Yellow-Card', value: 'y', mobile: false, align: ' d-none d-md-table-cell'},
          {text: 'Yellow/Red-Card', value: 'yr', align: ' d-none d-md-table-cell'},
          {text: 'Red-Card', value: 'r', align: ' d-none d-md-table-cell'},
          {text: 'position', value: 'p', align: ' d-none'},
          {text: 's', value: 's', align: ' d-none'},
          {text: 'tid', value: 'tid', align: ' d-none '},

        ],
        options: {
          itemsPerPage: 100,
          body: {
            isMobile: false,
          }
        }
      }
  ),
  computed: {
    ...mapGetters(['getLiveData']),
    getUsers() {
      if (this.getLiveData && this.getLiveData.u && this.getLiveData.u.length) {
        const users = this.getLiveData.u
        users.sort((a, b) => {
          if (a.t > b.t) {
            return -1
          } else if (a.t < b.t) {
            return 1
          }
          if (a.t === b.t) {
            if (a.st > b.st) {
              return -1
            } else if (a.st < b.st) {
              return 1
            }
          }
          return 0
        })

        users.forEach((user) => {
          if (user.pl.length) {
            user.pl.forEach((player) => {
              let displayName = ''
              if (player.fn) {
                displayName += player.fn + ' '
              }
              displayName += `${player.n} (${player.nr})`

              player.displayName = displayName
            })
          }
        })

        return users
      }
      return []
    }
  },
  mounted() {
    this.loading = true
    window.setTimeout(() => {
      this.reload()
    }, 2000)
  },
  methods: {
    reload() {
      this.loading = true
      api.loadGlobalLiveData(() => {
        window.setTimeout(() => {this.loading = false}, 200)

      })
    },
    numberOfPlayersWhoScored(players) {
      return players.filter((p) => {
        return p.t !== 0
      }).length
    }
  }
};
</script>
