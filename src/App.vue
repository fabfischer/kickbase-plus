<template>


  <v-app id="inspire" class="app" :class="{loading: !hasUser}">

    <v-overlay class="app-loading-overlay" :value="getLoading" z-index="99999" opacity=".9">
      <v-progress-linear
          indeterminate
          color="yellow darken-2"
      ></v-progress-linear>
      <v-container>
        <p
            v-for="(message, mkey) in getLoadingMessages"
            :key="mkey"
            class="title"
            :class="{'red':message.error}"
        >
          {{ message.message }}
        </p>
      </v-container>
    </v-overlay>

    <v-snackbar
        color="error"
        v-model="showSnack"
        :timeout="4000"
    >
      <p class="text-h4">{{ snackMessage }}</p>
    </v-snackbar>

    <div v-if="hasUser">

      <v-navigation-drawer
          v-model="drawer"
          class="blue-grey darken-2"
          dark
          app
      >
        <v-list color="blue-grey darken-2">

          <v-list-item to="/home" color="white">
            <v-list-item-action>
              <v-icon>fa-home</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Start/Leagues</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item to="/feed" color="white">
            <v-list-item-action>
              <v-icon>fa-rss-square</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>News Feed</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item to="/table" color="white">
            <v-list-item-action>
              <v-icon>fa-trophy</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>League Table</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item to="/transfermarket" color="white">
            <v-list-item-action>
              <v-icon>fa-exchange-alt</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Transfer market</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item to="/sell" color="white">
            <v-list-item-action>
              <v-icon>fa-money-bill-alt</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Offers / Sell</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item to="/lineup" color="white">
            <v-list-item-action>
              <v-icon>fa-user-friends</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Lineup</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item to="/live" color="white">
            <v-list-item-action>
              <v-icon>fa-satellite-dish</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Live Scores</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item color="white">
            <v-list-item-content>
              <v-divider></v-divider>
            </v-list-item-content>
          </v-list-item>

          <v-list-item to="/settings" color="white">
            <v-list-item-action>
              <v-icon>fa-cog</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Settings</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item color="white">
            <v-list-item-content>
              <v-divider></v-divider>
            </v-list-item-content>
          </v-list-item>

          <v-list-item @click="doLogout" color="white">
            <v-list-item-action>
              <v-icon>fa-sign-out-alt</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Logout</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item color="white">
            <v-list-item-content>
              <v-divider></v-divider>
            </v-list-item-content>
          </v-list-item>

          <v-list-item color="white">
            <v-list-item-content>
              <v-list-item-title>build: {{ build }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

        </v-list>
      </v-navigation-drawer>

      <v-app-bar
          app
          color="black"
          dark
      >
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <v-toolbar-title class="d-none d-sm-none d-md-flex" style="align-items:baseline;">
          KICKBASE<span class="yellow--text">+</span>
          <small v-if="leagueName">
            {{ leagueName }}
          </small>
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <small style="font-size:11px;" v-html="getPlayersDetails"></small>
        <v-spacer></v-spacer>
        <div style="font-size:11px;">
          daily bonus:<br>
          <span v-if="getFetchedGift === true">
            <v-icon color="green darken-2">fa-heart</v-icon>&nbsp;
            <span><span v-if="getGiftBonus!==0">{{ getGiftBonus }} / </span>{{ getGiftLevel }}</span>
          </span>
          <span v-else-if="getFetchedGift === false">
            <v-icon color="red">fa-sad-tear</v-icon>
          </span>
          <v-progress-circular v-else indeterminate size="16"></v-progress-circular>
        </div>

      </v-app-bar>

      <v-main>
        <v-container
            fluid
            fill-height
        >
          <v-layout
              align-center
              justify-center
          >
            <router-view
            ></router-view>
          </v-layout>
        </v-container>
      </v-main>
    </div>

    <login-dialog v-else-if="!hasUser"/>
  </v-app>
</template>

<script>
import {mapGetters, mapMutations} from 'vuex'
import moment from 'moment'

import numeral from 'numeral'

numeral.locale('deff')

import api from './api/api'
import LoginDialog from './components/LoginDialog'

export default {
  name: 'App',
  components: {
    LoginDialog,
  },
  props: {
    source: String,
  },
  data: () => ({
    drawer: null,
    snackMessage: null,
    showSnack: false,
  }),
  created: function () {
    this.$store.watch(state => state.errorMessage, () => {
      const msg = this.$store.state.errorMessage
      if (msg !== '') {
        this.showSnack = true
        this.snackMessage = msg
        this.setErrorMessage('')
      }
    })
  },
  mounted() {
    if (localStorage.getItem('password')) {
      localStorage.removeItem('password')
    }

    if (this.hasUser) {
      api.loadPersonalData(() => {
        api.loadLeagues(() => {
          api.checkBonusState()
          api.loadUsers()
        })
      })
    }
    this.initDarkMode();
  },
  computed: {
    ...mapGetters([
      'getAuthData',
      'getErrorMessage',
      'getLoading',
      'getFetchedGift',
      'getGiftBonus',
      'getBids',
      'getGiftLevel',
      'getLoadingMessages',
      'getSelfPlayerDetails',
      'getSelf',
      'getLeagues',
      'getLeague',
      'getDefaults',
    ]),
    hasUser() {
      const now = moment()
      if ((this.getAuthData.user)
          || (localStorage.getItem('token')
              && localStorage.getItem('tokenExp'))) {
        const tokenExpMoment = moment(localStorage.getItem('tokenExp'))
        if (tokenExpMoment > now) {
          return true
        }
      }
      return false
    },
    getPlayersDetails() {
      let details = ''
      if (this.getSelfPlayerDetails && this.getSelfPlayerDetails.budget) {
        details += 'Budget: ' + numeral(this.getSelfPlayerDetails.budget).format('0,0')
        details += '&nbsp; / Team: ' + numeral(this.getSelfPlayerDetails.teamValue).format('0,0')
      }

      if (this.getBids && this.getSelfPlayerDetails) {
        details += '<br>Bids: ' + numeral(this.getPlayerBidsSum).format('0,0')
        // details += ' / A<span class="d-none d-sm-none d-md-inline-block">fter</span> B<span class="d-none d-sm-none d-md-inline-block">ids</span>: ' + numeral(this.getSelfPlayerDetails.budget - this.getPlayerBidsSum).format('0,0')
        // details += '<span class="d-none d-sm-none d-md-inline-block"> / MaxedOut: ' + numeral((this.getSelfPlayerDetails.teamValue * 0.3) * -1).format('0,0') + '</span>'
      }

      if (this.getSelfPlayerDetails && this.getSelfPlayerDetails.budget) {
        details += '&nbsp;/ <span class="d-sm-inline-block d-md-none">/</span> Transfers: ' + (this.getSelfPlayerDetails.bought + this.getSelfPlayerDetails.sold)

        if (this.getSelfPlayerDetails.players && this.getSelfPlayerDetails.players.length) {
          details += ' / <span class="d-none d-sm-none d-md-inline-block">Players</span><span class="d-inline-block d-md-none">Ply</span>: ' + this.getSelfPlayerDetails.players.length
        }

      }
      return details
    },
    getPlayerBidsSum() {
      let sum = 0

      if (this.getBids && this.getBids.length) {
        this.getBids.forEach((bid) => {
          if (bid.offers && bid.offers.length) {
            bid.offers.forEach((offer) => {
              if (offer.userId * 1 === this.getSelf) {
                sum += offer.price * 1
              }
            })
          }
        })
      }
      return sum
    },
    selectedLeague() {
      let league = null
      if (this.getLeagues && this.getLeagues.length && this.getLeague) {
        const sLeague = this.getLeagues.filter((l) => l.id === this.getLeague)
        if (sLeague.length === 1) {
          league = sLeague[0]
        }
      }
      return league
    },
    leagueName() {
      return this.selectedLeague ? this.selectedLeague.name : null
    },
    build() {
      return process.env.VUE_APP_BUILD ? process.env.VUE_APP_BUILD : 'unknown'
    }
  },
  methods: {
    ...mapMutations([
      'setErrorMessage',
      'setLoading',
      'setOfferThreshold',
    ]),
    initDarkMode() {
      const darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      darkMediaQuery.addEventListener('change', () => {
        this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
      });

      if (darkMediaQuery.matches) {
        // need to set 0 sec timeout to set the dark more after mounted event, due to some bug in the framework
        setTimeout(() => this.$vuetify.theme.dark = true, 0);
      }
    },
    doLogout() {
      this.setLoading(true)
      localStorage.removeItem('token')
      localStorage.removeItem('tokenExp')
      localStorage.removeItem('league')
      window.location.reload()
    },
  },
};
</script>
