<template>
  <div class="full-width-container full-width-container--with-options-bar">

    <options-bar info-button-title="your defaults">
      <template v-slot:content>
        <reload-button :loading="loading" v-on:click.native="load" color="transparent"
                       extra-classes="desktop"></reload-button>
        <div v-if="loading === false">
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

          <v-select
              class="mt-2"
              v-model="expertFilters"
              :items="expertFiltersOptions"
              :menu-props="{ maxHeight: '500' }"
              label="Expert filters"
              outlined
              multiple
              chips
              hint="Select one or more expert filters to limit the list"
              persistent-hint
          ></v-select>

          <v-select
              class="mt-2"
              v-model="filteredTeams"
              :items="getTeams"
              :menu-props="{ maxHeight: '400' }"
              label="Bundesliga Club"
              outlined
              multiple
              chips
              hint="Select one or more clubs"
              persistent-hint
              return-object
              :item-value="'i'"
          >
            <template v-slot:selection="{ item }">
              <v-img class="mr-3" max-width="24" max-height="24" :src="clubImage(item.i)"/>
              {{ item.n }}
            </template>
            <template v-slot:item="{ item }">
              <v-img class="mr-3" max-width="24" max-height="24" :src="clubImage(item.i)"/>
              {{ item.n }}
            </template>
          </v-select>

          <v-switch
              v-model="showOtherUsersPlayer"
              label="Show all player (of all league members)"
          ></v-switch>

          <v-divider class="mt-3 mb-6"/>
          <v-select
              :items="orderOptions"
              label="Sort order"
              v-model="order"
              outlined
              :hide-details=true
          ></v-select>
        </div>
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
        /
        {{ getFilteredPlayers.length }} players match your criteria (out of a total of {{ getComputedBids.length }}
        players on the TM)

      </v-alert>

        <v-alert
            v-if="hasActiveFilters"
            style="cursor: pointer"
            type="info"
            dark
            text
            @click="resetFilters"
        >
          you have active filters. <u>reset filters</u>
        </v-alert>
      <v-text-field
          label="Search for player at current market"
          v-model="search"
          prepend-icon="fa-search"
          class="hidden-md-and-up"
      ></v-text-field>
      <div v-if="getFilteredPlayers.length">
        <bid-row
            v-for="player in getFilteredPlayers"
            :key="player.id"
            :player="player"/>
      </div>
      <v-alert v-else type="info" text>
        no player matched your criteria. please check your filters
      </v-alert>

    </div>
    <div v-else class="flex-grow-1 options-bar__sibling">
      <loading-spinner></loading-spinner>
    </div>
  </div>

</template>

<script>
import moment from "moment"
import api from '../api/api'
import {mapGetters, mapMutations} from 'vuex'

import BidRow from './BidRow'
import OptionsBar from './Generic/OptionsBar'
import ReloadButton from './Generic/ReloadButton'
import LoadingSpinner from "@/components/Spinner"

import {getMarketValueGrowth, getBundesligaClubImageUrlById} from "@/helper/helper"

export default {
  name: 'transfermarket-view',
  components: {
    LoadingSpinner,
    BidRow,
    OptionsBar,
    ReloadButton,
  },
  data: () => ({
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
    loading: true,
    expertFilters: [],
    filteredTeams: [],
    order: null,
    orderOptions: [
      'order by date (default)',
      'order by market value',
      'order by growth',
    ],
    expertFiltersOptions: [
      {
        text: 'only players with growing market value',
        value: 'growing'
      },
      {
        text: 'only players without any bids',
        value: 'no-bids'
      },
      {
        text: 'only players without other bids',
        value: 'no-foreign-bids'
      },
      {
        text: 'only players with own bid',
        value: 'own-bid'
      },
      {
        text: 'only players without injuries',
        value: 'no-injuries'
      },
      {
        text: 'show players who are sold before next matchday',
        value: 'sold-before-matchday'
      },
      {
        text: 'show players who are sold after next matchday',
        value: 'sold-after-matchday'
      },
      {
        text: 'show players who are sold before next market value update (ca. 22:00)',
        value: 'sold-before-market-value-update'
      },
      {
        text: 'show players who are sold after next market value update (ca. 22:00)',
        value: 'sold-after-market-value-update'
      },
    ]
  }),
  computed: {
    ...mapGetters([
      'getBids',
      'getSelf',
      'getInitialized',
      'getUsersDetails',
      'getSelectedLeague',
      'getTeams',
      'getNextMatchDay',
    ]),
    playersLeft() {
      if (this.getSelectedLeague && this.getSelectedLeague.pl) {
        return (this.getUsersDetails && this.getUsersDetails.players && this.getSelectedLeague)
            ? this.getSelectedLeague.pl - this.getUsersDetails.players.length
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
    getComputedBids() {
      const players = this.getBids

      if (players.length) {
        for (const player of players) {
          player.expiration = moment().add(player.expiry, 's')
          player.hasOwnBid = this.hasOwnBid(player)
          player.hasOnlySelfBid = this.hasOnlySelfBid(player)
          player.hasNoBid = this.hasNoBid(player)
          player.marketValueChange = getMarketValueGrowth(player.id)
        }
      }

      return players
    },
    hasActiveFilters() {
      return (this.search || this.selectedFilteredPosition || this.filteredTeams.length || this.expertFilters.length)
    },
    getFilteredPlayers() {
      const mvChangeDate = moment().hour(22).minute(0)
      const gameDayDate = this.getNextMatchDay ? this.getNextMatchDay.nts : null

      let players = this.getComputedBids
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

      if (this.filteredTeams.length) {
        const clubIds = []
        for (const club of this.filteredTeams) {
          clubIds.push(club.i * 1)
        }
        players = players.filter(player => clubIds.indexOf(player.teamId * 1) !== -1)
      }

      if (this.expertFilters.length) {
        for (const expertFilter of this.expertFilters) {
          if (expertFilter === 'no-injuries') {
            players = players.filter(player => player.status !== 1)
          }
          if (expertFilter === 'own-bid') {
            players = players.filter(player => player.hasOwnBid === true)
          }
          if (expertFilter === 'no-foreign-bids') {
            players = players.filter(player => player.hasOnlySelfBid === true)
          }
          if (expertFilter === 'no-bids') {
            players = players.filter(player => player.hasNoBid === true)
          }
          if (expertFilter === 'growing') {
            players = players.filter(player => player.marketValueChange > 0)
          }
          if (expertFilter === 'sold-before-matchday' && gameDayDate) {
            players = players.filter(player => player.expiration.isBefore(gameDayDate))
          }
          if (expertFilter === 'sold-after-matchday' && gameDayDate) {
            players = players.filter(player => player.expiration.isAfter(gameDayDate))
          }
          if (expertFilter === 'sold-before-market-value-update') {
            players = players.filter(player => player.expiration.isBefore(mvChangeDate))
          }
          if (expertFilter === 'sold-after-market-value-update') {
            players = players.filter(player => player.expiration.isAfter(mvChangeDate))
          }
        }
      }

      if (!this.showOtherUsersPlayer) {
        players = players.filter(player => !player.userId)
      }

      if (this.order) {
        if (this.order === 'order by market value') {
          players = players.sort((a, b) => {
            if (a.marketValue > b.marketValue) {
              return -1;
            }
            if (a.marketValue < b.marketValue) {
              return 1;
            }
            return 0;
          })
        }
        if (this.order === 'order by growth') {
          players = players.sort((a, b) => {
            if (a.marketValueChange > b.marketValueChange) {
              return -1;
            }
            if (a.marketValueChange < b.marketValueChange) {
              return 1;
            }
            return 0;
          })
        }
      }

      return players
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    ...mapMutations(['setBids']),
    init: async function () {
      if (this.getInitialized) {
        await this.load()
        await api.loadUsers()
        await api.loadUsersStats(true)
      } else {
        window.setTimeout(this.init, 1000)
      }
    },
    async load() {
      this.setBids([])
      this.loading = true
      await api.loadBids(true)
      this.loading = false
    },
    hasOwnBid(player) {
      const offers = player.offers
      let hasOwnBid = false
      if (offers && offers.length) {
        offers.forEach((offer) => {
          if (offer.userId * 1 === this.getSelf) {
            hasOwnBid = true
          }
        })
      }
      return hasOwnBid
    },
    hasOnlySelfBid(player) {
      return (player.offers && player.offers.length === 1 && this.hasOwnBid(player))
    },
    hasNoBid(player) {
      const offers = player.offers
      return (offers && offers.length === 0 || !offers)
    },
    clubImage(id) {
      return getBundesligaClubImageUrlById(id)
    },
    resetFilters() {
      this.search = null
      this.selectedFilteredPosition = null
      this.expertFilters = []
      this.filteredTeams = []
    },
  },
};
</script>
